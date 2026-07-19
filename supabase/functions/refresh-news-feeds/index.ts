// Supabase Edge Function: refresh RSS news feeds into the rss_feeds cache table.
//
// Called two ways, both authenticated by the platform JWT check (anon key works):
//   - pg_cron (hourly) — respects each source's fetch_interval_minutes
//   - the admin "Refresh Now" button — passes { force: true } to ignore intervals
//
// Feeds are fetched directly (no CORS proxy — that constraint only exists in
// browsers) and parsed with fast-xml-parser, since the Deno edge runtime has
// no DOMParser.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { XMLParser } from 'https://esm.sh/fast-xml-parser@4.3.6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FeedSource {
  id: string
  name: string
  url: string
  country_code: string | null
  country_name: string | null
  category: string | null
  fetch_interval_minutes: number
  last_fetched_at: string | null
}

interface FeedItem {
  title: string
  link: string
  description: string
  pub_date: string
  source: string
  image_url?: string
  author?: string
  guid: string
}

const MAX_ITEMS_PER_FEED = 10
const FETCH_TIMEOUT_MS = 12_000
const CONCURRENCY = 8
// A forced refresh (admin button) still no-ops if one ran in the last 2 minutes,
// so the public endpoint can't be used to hammer the source sites.
const FORCE_COOLDOWN_MS = 2 * 60_000

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
})

const asArray = <T>(v: T | T[] | undefined): T[] => (v === undefined ? [] : Array.isArray(v) ? v : [v])

const text = (v: unknown): string => {
  if (v == null) return ''
  if (typeof v === 'string' || typeof v === 'number') return String(v)
  if (typeof v === 'object' && '#text' in (v as Record<string, unknown>)) return text((v as Record<string, unknown>)['#text'])
  return ''
}

const stripHtml = (html: string): string =>
  html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#?\w+;/g, ' ')
    .replace(/\s+/g, ' ').trim()

const toIso = (v: string): string => {
  const d = new Date(v)
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
}

function atomLink(link: unknown): string {
  // Atom <link> can be an object or array of objects with href attributes.
  const links = asArray(link as Record<string, unknown>)
  const alt = links.find((l) => l?.['@_rel'] === 'alternate' || !l?.['@_rel'])
  return text(alt?.['@_href']) || text(links[0]?.['@_href']) || text(link)
}

function itemImage(item: Record<string, unknown>, description: string): string | undefined {
  const media = asArray(item['media:thumbnail'] as Record<string, unknown>)[0] ||
    asArray(item['media:content'] as Record<string, unknown>)[0]
  if (media?.['@_url']) return text(media['@_url'])
  const enclosure = asArray(item.enclosure as Record<string, unknown>)[0]
  if (enclosure?.['@_url'] && String(enclosure?.['@_type'] || '').startsWith('image')) return text(enclosure['@_url'])
  const m = description.match(/<img[^>]+src="([^">]+)"/)
  return m ? m[1] : undefined
}

function parseFeed(xml: string, sourceName: string): FeedItem[] {
  const doc = parser.parse(xml)
  // RSS 2.0: rss.channel.item — RDF 1.0: rdf:RDF.item — Atom: feed.entry
  const rssItems = asArray(doc?.rss?.channel?.item ?? doc?.['rdf:RDF']?.item)
  const atomEntries = asArray(doc?.feed?.entry)

  const items: FeedItem[] = []
  for (const item of rssItems.slice(0, MAX_ITEMS_PER_FEED)) {
    const rawDesc = text(item.description) || text(item['content:encoded'])
    const link = text(item.link)
    items.push({
      title: stripHtml(text(item.title)),
      link,
      description: stripHtml(rawDesc).substring(0, 300),
      pub_date: toIso(text(item.pubDate) || text(item['dc:date'])),
      source: sourceName,
      image_url: itemImage(item, rawDesc),
      author: stripHtml(text(item.author) || text(item['dc:creator'])) || undefined,
      guid: text(item.guid) || link,
    })
  }
  for (const entry of atomEntries.slice(0, MAX_ITEMS_PER_FEED)) {
    const rawDesc = text(entry.summary) || text(entry.content)
    const link = atomLink(entry.link)
    items.push({
      title: stripHtml(text(entry.title)),
      link,
      description: stripHtml(rawDesc).substring(0, 300),
      pub_date: toIso(text(entry.published) || text(entry.updated)),
      source: sourceName,
      image_url: itemImage(entry, rawDesc),
      author: stripHtml(text(asArray(entry.author)[0]?.name)) || undefined,
      guid: text(entry.id) || link,
    })
  }
  return items.filter((i) => i.title && i.link && i.guid)
}

async function fetchFeed(url: string, sourceName: string): Promise<FeedItem[]> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: {
      'User-Agent': 'BaraAfrika-NewsBot/1.0 (+https://baraafrika.com)',
      Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return parseFeed(await res.text(), sourceName)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const force = req.method === 'POST'
      ? Boolean((await req.json().catch(() => ({})))?.force)
      : false

    const { data: sources, error: sourcesError } = await supabase
      .from('rss_feed_sources')
      .select('*')
      .eq('is_active', true)
      .order('name')
    if (sourcesError) throw sourcesError

    const now = Date.now()
    if (force) {
      const newest = Math.max(...(sources ?? []).map((s: FeedSource) =>
        s.last_fetched_at ? new Date(s.last_fetched_at).getTime() : 0))
      if (now - newest < FORCE_COOLDOWN_MS) {
        return new Response(
          JSON.stringify({ success: true, skipped: 'cooldown', itemsAdded: 0, sourcesProcessed: 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }
    }

    const due = (sources ?? []).filter((s: FeedSource) => {
      if (force || !s.last_fetched_at) return true
      const minutes = (now - new Date(s.last_fetched_at).getTime()) / 60_000
      return minutes >= s.fetch_interval_minutes
    })

    let itemsAdded = 0
    let sourcesProcessed = 0
    const errors: string[] = []

    const queue = [...due]
    await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
      for (let source = queue.shift(); source; source = queue.shift()) {
        try {
          const items = await fetchFeed(source.url, source.name)
          if (items.length > 0) {
            const rows = items.map((i) => ({
              ...i,
              country_code: source.country_code,
              country_name: source.country_name,
              category: source.category,
            }))
            const { error, count } = await supabase
              .from('rss_feeds')
              .upsert(rows, { onConflict: 'guid', ignoreDuplicates: true, count: 'exact' })
            if (error) throw error
            itemsAdded += count ?? rows.length
          }
          await supabase
            .from('rss_feed_sources')
            .update({
              last_fetched_at: new Date().toISOString(),
              last_fetch_status: 'ok',
              last_fetch_error: null,
              last_fetch_items: items.length,
            })
            .eq('id', source.id)
          sourcesProcessed++
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e)
          errors.push(`${source.name}: ${message}`)
          await supabase
            .from('rss_feed_sources')
            .update({ last_fetch_status: 'error', last_fetch_error: message.substring(0, 500) })
            .eq('id', source.id)
        }
      }
    }))

    // Trim the cache so it doesn't grow without bound.
    await supabase.from('rss_feeds').delete()
      .lt('pub_date', new Date(now - 30 * 24 * 3600_000).toISOString())

    return new Response(
      JSON.stringify({
        success: true,
        itemsAdded,
        sourcesProcessed,
        sourcesSkipped: (sources?.length ?? 0) - due.length,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('refresh-news-feeds failed:', error)
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})
