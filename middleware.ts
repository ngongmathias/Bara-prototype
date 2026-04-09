/**
 * Vercel Edge Middleware — dynamic OG meta tags for social-link previews.
 *
 * Why this exists:
 *   Bara is a Vite SPA — the static index.html has generic OG tags and
 *   no JavaScript runs in crawlers like WhatsApp, Facebook, Twitter, etc.
 *   Without this middleware, pasting any URL into WhatsApp shows a blank
 *   preview (or the Bara logo) regardless of which ad/song/event/blog
 *   post the link points to.
 *
 * How it works:
 *   1. On every request, check the User-Agent for known social crawlers.
 *   2. If the path matches an item route (e.g. /marketplace/ad/:id), fetch
 *      that item's metadata from Supabase via the REST API.
 *   3. Rewrite index.html with item-specific <meta property="og:*"> tags
 *      and return it. Human visitors pass straight through to the SPA.
 *
 * Required env vars on Vercel:
 *   - SUPABASE_URL (or VITE_SUPABASE_URL)
 *   - SUPABASE_ANON_KEY (or VITE_SUPABASE_ANON_KEY)
 */

export const config = {
  matcher: [
    '/marketplace/ad/:id*',
    '/marketplace/listing/:id*',
    '/streams/song/:id*',
    '/streams/playlist/:id*',
    '/streams/artist/:id*',
    '/events/:id*',
    '/blog/:slug*',
    '/listings/:slug*',
  ],
};

const BOT_REGEX = /WhatsApp|facebookexternalhit|Facebot|Twitterbot|TelegramBot|LinkedInBot|Slackbot|Discordbot|SkypeUriPreview|Pinterest|Googlebot|bingbot|YandexBot|Applebot|vkShare|redditbot|Embedly/i;

const SUPABASE_URL = (globalThis as any).process?.env?.SUPABASE_URL || (globalThis as any).process?.env?.VITE_SUPABASE_URL;
// Prefer service role key (bypasses RLS) — safe here because this runs server-side on Vercel Edge.
// Falls back to anon key if service role isn't configured.
const SUPABASE_KEY =
  (globalThis as any).process?.env?.SUPABASE_SERVICE_ROLE_KEY ||
  (globalThis as any).process?.env?.SUPABASE_ANON_KEY ||
  (globalThis as any).process?.env?.VITE_SUPABASE_ANON_KEY;

interface PreviewData {
  title: string;
  description: string;
  image: string;
  type: string;
}

const DEFAULT_IMAGE = '/og-image.jpg';
const SITE_NAME = 'Bara Afrika';

async function fetchFromSupabase(table: string, query: string): Promise<any | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('[OG middleware] Missing SUPABASE_URL or key env vars');
    return null;
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Accept: 'application/json',
      },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(`[OG middleware] Supabase ${table} query failed: ${res.status} ${body}`);
      return null;
    }
    const rows = await res.json();
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  } catch (err) {
    console.error(`[OG middleware] fetch error for ${table}:`, err);
    return null;
  }
}

async function buildPreview(pathname: string): Promise<PreviewData | null> {
  // /marketplace/ad/:id OR /marketplace/listing/:id
  const adMatch = pathname.match(/^\/marketplace\/(?:ad|listing)\/([^/?#]+)/);
  if (adMatch) {
    const id = adMatch[1];
    const row = await fetchFromSupabase(
      'marketplace_listings',
      `id=eq.${id}&select=title,description,price,currency,marketplace_listing_images(image_url,is_primary)`
    );
    if (!row) return null;
    const imgs = row.marketplace_listing_images || [];
    const primary = imgs.find((i: any) => i.is_primary) || imgs[0];
    return {
      title: row.title,
      description: `${row.currency} ${row.price?.toLocaleString?.() || row.price} — ${(row.description || '').slice(0, 160)}`,
      image: primary?.image_url || DEFAULT_IMAGE,
      type: 'article',
    };
  }

  // /streams/song/:id
  const songMatch = pathname.match(/^\/streams\/song\/([^/?#]+)/);
  if (songMatch) {
    const id = songMatch[1];
    const row = await fetchFromSupabase(
      'songs',
      `id=eq.${id}&select=title,cover_url,artist_id`
    );
    if (!row) return null;
    // Fetch artist name separately to avoid PostgREST FK ambiguity
    let artistName = 'Unknown Artist';
    if (row.artist_id) {
      const artist = await fetchFromSupabase(
        'artists',
        `id=eq.${row.artist_id}&select=name`
      );
      if (artist?.name) artistName = artist.name;
    }
    return {
      title: row.title,
      description: `Listen to ${row.title} by ${artistName} on Bara Streams`,
      image: row.cover_url || DEFAULT_IMAGE,
      type: 'music.song',
    };
  }

  // /streams/playlist/:id
  const playlistMatch = pathname.match(/^\/streams\/playlist\/([^/?#]+)/);
  if (playlistMatch) {
    const id = playlistMatch[1];
    const row = await fetchFromSupabase(
      'playlists',
      `id=eq.${id}&select=name,description,cover_url`
    );
    if (!row) return null;
    return {
      title: row.name,
      description: row.description || 'A playlist on Bara Streams',
      image: row.cover_url || DEFAULT_IMAGE,
      type: 'music.playlist',
    };
  }

  // /streams/artist/:id
  const artistMatch = pathname.match(/^\/streams\/artist\/([^/?#]+)/);
  if (artistMatch) {
    const id = artistMatch[1];
    const row = await fetchFromSupabase(
      'artists',
      `id=eq.${id}&select=name,bio,avatar_url`
    );
    if (!row) return null;
    return {
      title: row.name,
      description: row.bio?.slice(0, 160) || `${row.name} on Bara Streams`,
      image: row.avatar_url || DEFAULT_IMAGE,
      type: 'profile',
    };
  }

  // /events/:id
  const eventMatch = pathname.match(/^\/events\/([^/?#]+)/);
  if (eventMatch) {
    const id = eventMatch[1];
    // Skip if the segment is a known sub-route
    if (['create', 'new', 'edit', 'categories'].includes(id)) return null;
    const row = await fetchFromSupabase(
      'events',
      `id=eq.${id}&select=title,description,event_image_url,event_images,start_date,venue_name,venue_address`
    );
    if (!row) return null;
    const when = row.start_date ? new Date(row.start_date).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '';
    const venue = row.venue_name || row.venue_address || '';
    const firstGallery = Array.isArray(row.event_images) && row.event_images.length > 0 ? row.event_images[0] : null;
    return {
      title: row.title,
      description: `${when}${venue ? ` · ${venue}` : ''}${row.description ? ` — ${row.description.slice(0, 120)}` : ''}`.trim(),
      image: row.event_image_url || firstGallery || DEFAULT_IMAGE,
      type: 'event',
    };
  }

  // /blog/:slug
  const blogMatch = pathname.match(/^\/blog\/([^/?#]+)/);
  if (blogMatch) {
    const slug = blogMatch[1];
    if (['write', 'guidelines', 'edit'].includes(slug)) return null;
    const row = await fetchFromSupabase(
      'blog_posts',
      `slug=eq.${slug}&select=title,excerpt,cover_image_url,featured_image_url`
    );
    if (!row) return null;
    return {
      title: row.title,
      description: row.excerpt || 'Read on Bara Afrika',
      image: row.cover_image_url || row.featured_image_url || DEFAULT_IMAGE,
      type: 'article',
    };
  }

  // /listings/:slug (business directory)
  const bizMatch = pathname.match(/^\/listings\/([^/?#]+)/);
  if (bizMatch) {
    const slug = bizMatch[1];
    const row = await fetchFromSupabase(
      'businesses',
      `slug=eq.${slug}&select=name,description,logo_url,cover_image_url`
    );
    if (!row) return null;
    return {
      title: row.name,
      description: row.description?.slice(0, 160) || `${row.name} on Bara Afrika`,
      image: row.cover_image_url || row.logo_url || DEFAULT_IMAGE,
      type: 'business.business',
    };
  }

  return null;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildOgTags(url: string, data: PreviewData): string {
  const absImg = data.image.startsWith('http') ? data.image : `${new URL(url).origin}${data.image}`;
  const title = escapeHtml(`${data.title} | ${SITE_NAME}`);
  const description = escapeHtml(data.description);
  const image = escapeHtml(absImg);
  const pageUrl = escapeHtml(url);

  return `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:type" content="${data.type}" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
  `;
}

export default async function middleware(request: Request): Promise<Response | undefined> {
  const userAgent = request.headers.get('user-agent') || '';

  // Only run for known crawlers; humans get the normal SPA
  if (!BOT_REGEX.test(userAgent)) return;

  const url = new URL(request.url);
  const data = await buildPreview(url.pathname);
  if (!data) return; // pass-through

  // Fetch base index.html from the same origin
  let html: string;
  try {
    const indexRes = await fetch(new URL('/', url), {
      headers: { 'x-og-middleware-bypass': '1' },
    });
    if (!indexRes.ok) return;
    html = await indexRes.text();
  } catch {
    return;
  }

  const ogTags = buildOgTags(url.toString(), data);

  // Remove existing og:/twitter:/title/description tags so we don't duplicate
  html = html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name="description"[^>]*>/gi, '')
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '')
    .replace(/<\/head>/i, `${ogTags}</head>`);

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=300',
      'x-og-middleware': 'hit',
    },
  });
}
