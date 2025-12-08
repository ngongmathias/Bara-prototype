import { supabase } from './supabase';

export interface RSSFeedItem {
  id?: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  countryCode?: string;
  countryName?: string;
  imageUrl?: string;
  author?: string;
  category?: string;
  guid?: string;
}

export interface RSSFeedSource {
  id: string;
  name: string;
  url: string;
  countryCode?: string;
  countryName?: string;
  category?: string;
  isActive: boolean;
  fetchIntervalMinutes: number;
  lastFetchedAt?: string;
}

/**
 * Fetch RSS feeds from the database cache
 */
export async function getRSSFeeds(options?: {
  countryCode?: string;
  limit?: number;
  source?: string;
}): Promise<RSSFeedItem[]> {
  try {
    let query = supabase
      .from('rss_feeds')
      .select('*')
      .order('pub_date', { ascending: false });

    if (options?.countryCode) {
      query = query.eq('country_code', options.countryCode);
    }

    if (options?.source) {
      query = query.eq('source', options.source);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    } else {
      query = query.limit(20);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching RSS feeds:', error);
      return [];
    }

    return (data || []).map(feed => ({
      id: feed.id,
      title: feed.title,
      link: feed.link,
      description: feed.description || '',
      pubDate: feed.pub_date,
      source: feed.source,
      countryCode: feed.country_code,
      countryName: feed.country_name,
      imageUrl: feed.image_url,
      author: feed.author,
      category: feed.category,
      guid: feed.guid,
    }));
  } catch (error) {
    console.error('Error in getRSSFeeds:', error);
    return [];
  }
}

/**
 * Get active RSS feed sources
 */
export async function getRSSFeedSources(): Promise<RSSFeedSource[]> {
  try {
    const { data, error } = await supabase
      .from('rss_feed_sources')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching RSS feed sources:', error);
      return [];
    }

    return (data || []).map(source => ({
      id: source.id,
      name: source.name,
      url: source.url,
      countryCode: source.country_code,
      countryName: source.country_name,
      category: source.category,
      isActive: source.is_active,
      fetchIntervalMinutes: source.fetch_interval_minutes,
      lastFetchedAt: source.last_fetched_at,
    }));
  } catch (error) {
    console.error('Error in getRSSFeedSources:', error);
    return [];
  }
}

/**
 * Parse RSS feed XML using a CORS proxy
 */
export async function fetchAndParseRSSFeed(feedUrl: string, sourceName: string): Promise<RSSFeedItem[]> {
  try {
    // Use a CORS proxy to fetch RSS feeds
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`;
    
    const response = await fetch(proxyUrl);
    const xmlText = await response.text();
    
    // Parse XML
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
      
      // RSS 2.0 format
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
      
      feedItems.push({
        title: title.trim(),
        link: link.trim(),
        description: stripHtml(description).trim().substring(0, 300),
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

/**
 * Strip HTML tags from text
 */
function stripHtml(html: string): string {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

/**
 * Refresh RSS feeds from all active sources and cache in database
 */
export async function refreshRSSFeeds(): Promise<{ success: boolean; itemsAdded: number }> {
  try {
    const sources = await getRSSFeedSources();
    let totalItemsAdded = 0;
    
    for (const source of sources) {
      // Check if we should fetch based on interval
      if (source.lastFetchedAt) {
        const lastFetch = new Date(source.lastFetchedAt);
        const now = new Date();
        const minutesSinceLastFetch = (now.getTime() - lastFetch.getTime()) / (1000 * 60);
        
        if (minutesSinceLastFetch < source.fetchIntervalMinutes) {
          console.log(`Skipping ${source.name} - fetched ${minutesSinceLastFetch.toFixed(0)} minutes ago`);
          continue;
        }
      }
      
      console.log(`Fetching RSS feed from ${source.name}...`);
      const items = await fetchAndParseRSSFeed(source.url, source.name);
      
      // Insert items into database (ignore duplicates based on guid)
      for (const item of items) {
        const { error } = await supabase
          .from('rss_feeds')
          .upsert({
            title: item.title,
            link: item.link,
            description: item.description,
            pub_date: item.pubDate,
            source: item.source,
            country_code: source.countryCode,
            country_name: source.countryName,
            image_url: item.imageUrl,
            author: item.author,
            category: source.category,
            guid: item.guid,
          }, {
            onConflict: 'guid',
            ignoreDuplicates: true,
          });
        
        if (!error) {
          totalItemsAdded++;
        }
      }
      
      // Update last_fetched_at for this source
      await supabase
        .from('rss_feed_sources')
        .update({ last_fetched_at: new Date().toISOString() })
        .eq('id', source.id);
    }
    
    console.log(`RSS refresh complete. Added ${totalItemsAdded} new items.`);
    return { success: true, itemsAdded: totalItemsAdded };
  } catch (error) {
    console.error('Error refreshing RSS feeds:', error);
    return { success: false, itemsAdded: 0 };
  }
}
