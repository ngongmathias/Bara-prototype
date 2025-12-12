// Supabase Edge Function: Auto-refresh RSS feeds
// Runs automatically via cron job every 6 hours

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RSSFeedSource {
  id: string;
  name: string;
  url: string;
  country_code: string | null;
  country_name: string | null;
  category: string | null;
  fetch_interval_minutes: number;
  last_fetched_at: string | null;
}

interface RSSFeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  imageUrl?: string;
  author?: string;
  guid: string;
}

// Parse RSS feed XML
async function fetchAndParseRSSFeed(feedUrl: string, sourceName: string): Promise<RSSFeedItem[]> {
  try {
    // Use CORS proxy to fetch RSS feeds
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`;
    
    const response = await fetch(proxyUrl);
    const xmlText = await response.text();
    
    // Parse XML using DOMParser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      console.error('XML parsing error:', parseError.textContent);
      return [];
    }
    
    // Try RSS 2.0 format first
    let items = xmlDoc.querySelectorAll('item');
    
    // If no items, try Atom format
    if (items.length === 0) {
      items = xmlDoc.querySelectorAll('entry');
    }
    
    const feedItems: RSSFeedItem[] = [];
    
    items.forEach((item, index) => {
      if (index >= 10) return; // Limit to 10 items per feed
      
      const title = item.querySelector('title')?.textContent || '';
      const link = item.querySelector('link')?.textContent || item.querySelector('link')?.getAttribute('href') || '';
      const description = item.querySelector('description')?.textContent || 
                         item.querySelector('summary')?.textContent || 
                         item.querySelector('content')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || 
                     item.querySelector('published')?.textContent || 
                     item.querySelector('updated')?.textContent || 
                     new Date().toISOString();
      const guid = item.querySelector('guid')?.textContent || 
                  item.querySelector('id')?.textContent || 
                  link;
      const author = item.querySelector('author')?.textContent || 
                    item.querySelector('dc\\:creator')?.textContent || '';
      
      // Try to extract image
      let imageUrl = item.querySelector('media\\:thumbnail')?.getAttribute('url') || 
                    item.querySelector('media\\:content')?.getAttribute('url') || 
                    item.querySelector('enclosure[type^="image"]')?.getAttribute('url') || '';
      
      // If no image in item, try to extract from description
      if (!imageUrl && description) {
        const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) {
          imageUrl = imgMatch[1];
        }
      }
      
      // Strip HTML from description
      const tmp = new DOMParser().parseFromString(description, 'text/html');
      const cleanDescription = (tmp.body.textContent || '').trim().substring(0, 300);
      
      feedItems.push({
        title: title.trim(),
        link: link.trim(),
        description: cleanDescription,
        pubDate: new Date(pubDate).toISOString(),
        source: sourceName,
        imageUrl: imageUrl || undefined,
        author: author.trim() || undefined,
        guid: guid.trim(),
      });
    });
    
    return feedItems;
  } catch (error) {
    console.error(`Error fetching RSS feed from ${feedUrl}:`, error);
    return [];
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authorization (cron secret or service role)
    const authHeader = req.headers.get('Authorization')
    const cronSecret = Deno.env.get('CRON_SECRET')
    
    // Allow cron secret or service role key
    if (authHeader !== `Bearer ${cronSecret}` && !authHeader?.includes('service_role')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🔄 Starting RSS feed refresh...')

    // Get all active RSS feed sources
    const { data: sources, error: sourcesError } = await supabase
      .from('rss_feed_sources')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (sourcesError) {
      throw sourcesError
    }

    console.log(`📰 Found ${sources?.length || 0} active sources`)

    let totalItemsAdded = 0
    const errors: string[] = []

    // Fetch from each source
    for (const source of sources || []) {
      try {
        // Check if we should fetch (based on interval)
        if (source.last_fetched_at) {
          const lastFetch = new Date(source.last_fetched_at)
          const now = new Date()
          const minutesSinceLastFetch = (now.getTime() - lastFetch.getTime()) / (1000 * 60)

          if (minutesSinceLastFetch < source.fetch_interval_minutes) {
            console.log(`⏭️ Skipping ${source.name} - fetched ${minutesSinceLastFetch.toFixed(0)} minutes ago`)
            continue
          }
        }

        console.log(`📡 Fetching from ${source.name}...`)
        const items = await fetchAndParseRSSFeed(source.url, source.name)

        // Insert items into database
        for (const item of items) {
          const { error } = await supabase
            .from('rss_feeds')
            .upsert({
              title: item.title,
              link: item.link,
              description: item.description,
              pub_date: item.pubDate,
              source: item.source,
              country_code: source.country_code,
              country_name: source.country_name,
              image_url: item.imageUrl,
              author: item.author,
              category: source.category,
              guid: item.guid,
            }, {
              onConflict: 'guid',
              ignoreDuplicates: true,
            })

          if (!error) {
            totalItemsAdded++
          }
        }

        // Update last_fetched_at
        await supabase
          .from('rss_feed_sources')
          .update({ last_fetched_at: new Date().toISOString() })
          .eq('id', source.id)

        console.log(`✅ ${source.name}: Added ${items.length} items`)
      } catch (error) {
        const errorMsg = `${source.name}: ${error}`
        console.error(`❌ ${errorMsg}`)
        errors.push(errorMsg)
      }
    }

    console.log(`✅ RSS refresh complete. Added ${totalItemsAdded} new items.`)

    return new Response(
      JSON.stringify({
        success: true,
        itemsAdded: totalItemsAdded,
        sourcesProcessed: sources?.length || 0,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: new Date().toISOString(),
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('❌ Error in refresh-news-feeds function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
