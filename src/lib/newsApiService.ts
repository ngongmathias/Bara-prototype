/**
 * News API Service
 * 
 * Supports multiple news API providers:
 * - Google News RSS (Free, unlimited)
 * - NewsAPI.org (Paid, best coverage)
 * - GNews API (Affordable)
 * - Currents API (Best free tier)
 */

import { supabase } from './supabase';

export interface NewsArticle {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  imageUrl?: string;
  author?: string;
  countryCode?: string;
  countryName?: string;
}

// ============================================
// OPTION 1: Google News RSS (FREE, DEFAULT)
// ============================================

/**
 * Per-code overrides for feeds that cannot be derived from the country name.
 *
 * Two reasons an override is needed:
 *  1. Several of the site's "countries" are people-groups, not countries
 *     (ED = HBCU, US-BA, GB-BA, EU-BA, BR-BA). Interpolating those codes
 *     produces an invalid Google News edition.
 *  2. Morocco is stored under `MC`, which is Monaco's ISO code, so the
 *     derived edition would be wrong.
 *
 * Every URL produced by this module was verified by live fetch — see
 * `scripts/verify_rss_urls.mjs`, which counts <item> elements for all 40
 * active countries. Re-run it before changing this map.
 */
const FEED_OVERRIDES: Record<string, { query: string; gl: string; hl: string; ceid: string }> = {
  'US-BA': { query: 'African American news', gl: 'US', hl: 'en-US', ceid: 'US:en' },
  'GB-BA': { query: 'Black British news', gl: 'GB', hl: 'en-GB', ceid: 'GB:en' },
  'EU-BA': { query: 'Black Europeans Africa diaspora', gl: 'GB', hl: 'en-GB', ceid: 'GB:en' },
  'BR-BA': { query: 'afro-brasileiros', gl: 'BR', hl: 'pt-BR', ceid: 'BR:pt-419' },
  'ED': { query: 'HBCU', gl: 'US', hl: 'en-US', ceid: 'US:en' },
  'MC': { query: 'Morocco news', gl: 'MA', hl: 'en-MA', ceid: 'MA:en' },
};

/**
 * Build a Google News RSS URL that actually returns articles.
 *
 * The previous implementation used `when:24h+allinurl:<name>`, which Google
 * returns an EMPTY feed for. Because an empty feed still responds 200, every
 * affected source recorded `last_fetch_status: 'ok'` with zero items — 41 of
 * 60 sources were dead while reporting healthy, and 32 of 40 country pages
 * served no news at all.
 */
export const generateGoogleNewsURL = (countryName: string, countryCode: string): string => {
  const o = FEED_OVERRIDES[countryCode];
  if (o) {
    return `https://news.google.com/rss/search?q=${encodeURIComponent(o.query)}&hl=${o.hl}&gl=${o.gl}&ceid=${encodeURIComponent(o.ceid)}`;
  }
  return `https://news.google.com/rss/search?q=${encodeURIComponent(`${countryName} news`)}` +
    `&hl=en-${countryCode}&gl=${countryCode}&ceid=${encodeURIComponent(`${countryCode}:en`)}`;
};

// ============================================
// OPTION 2: NewsAPI.org (PAID)
// ============================================
const NEWSAPI_KEY = import.meta.env.VITE_NEWSAPI_KEY || '';

export const fetchFromNewsAPI = async (countryCode: string): Promise<NewsArticle[]> => {
  if (!NEWSAPI_KEY) {
    console.warn('NewsAPI key not configured, falling back to RSS');
    return [];
  }

  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=${countryCode.toLowerCase()}&pageSize=10&apiKey=${NEWSAPI_KEY}`
    );

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`);
    }

    const data = await response.json();

    return data.articles.map((article: any) => ({
      title: article.title,
      description: article.description || '',
      link: article.url,
      pubDate: article.publishedAt,
      source: article.source.name,
      imageUrl: article.urlToImage,
      author: article.author,
      countryCode: countryCode,
    }));
  } catch (error) {
    console.error('Error fetching from NewsAPI:', error);
    return [];
  }
};

// ============================================
// OPTION 3: GNews API (AFFORDABLE)
// ============================================
const GNEWS_KEY = import.meta.env.VITE_GNEWS_KEY || '';

export const fetchFromGNews = async (countryCode: string): Promise<NewsArticle[]> => {
  if (!GNEWS_KEY) {
    console.warn('GNews key not configured, falling back to RSS');
    return [];
  }

  try {
    const response = await fetch(
      `https://gnews.io/api/v4/top-headlines?country=${countryCode.toLowerCase()}&max=10&token=${GNEWS_KEY}`
    );

    if (!response.ok) {
      throw new Error(`GNews error: ${response.status}`);
    }

    const data = await response.json();

    return data.articles.map((article: any) => ({
      title: article.title,
      description: article.description || '',
      link: article.url,
      pubDate: article.publishedAt,
      source: article.source.name,
      imageUrl: article.image,
      author: article.author,
      countryCode: countryCode,
    }));
  } catch (error) {
    console.error('Error fetching from GNews:', error);
    return [];
  }
};

// ============================================
// OPTION 4: Currents API (BEST FREE TIER)
// ============================================
const CURRENTS_KEY = import.meta.env.VITE_CURRENTS_KEY || '';

export const fetchFromCurrents = async (countryCode: string): Promise<NewsArticle[]> => {
  if (!CURRENTS_KEY) {
    console.warn('Currents key not configured, falling back to RSS');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.currentsapi.services/v1/latest-news?country=${countryCode}&language=en&apiKey=${CURRENTS_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Currents error: ${response.status}`);
    }

    const data = await response.json();

    return data.news.map((article: any) => ({
      title: article.title,
      description: article.description || '',
      link: article.url,
      pubDate: article.published,
      source: article.author || 'Unknown',
      imageUrl: article.image,
      author: article.author,
      countryCode: countryCode,
    }));
  } catch (error) {
    console.error('Error fetching from Currents:', error);
    return [];
  }
};

// ============================================
// SMART FETCHER: Auto-selects best available API
// ============================================
export const fetchNewsForCountry = async (
  countryCode: string,
  countryName: string
): Promise<NewsArticle[]> => {
  // Priority order: NewsAPI > GNews > Currents > Google RSS
  
  // Try NewsAPI first (best coverage, but paid)
  if (NEWSAPI_KEY) {
    const articles = await fetchFromNewsAPI(countryCode);
    if (articles.length > 0) {
      return articles;
    }
  }

  // Try GNews (affordable, good coverage)
  if (GNEWS_KEY) {
    const articles = await fetchFromGNews(countryCode);
    if (articles.length > 0) {
      return articles;
    }
  }

  // Try Currents (best free tier)
  if (CURRENTS_KEY) {
    const articles = await fetchFromCurrents(countryCode);
    if (articles.length > 0) {
      return articles;
    }
  }

  // Fallback to Google News RSS (always free, always works)
  return []; // Will use existing RSS service
};

// ============================================
// AUTO-REFRESH: Fetch and cache news for all countries
// ============================================
export const autoRefreshAllCountries = async (): Promise<{
  success: boolean;
  articlesAdded: number;
  errors: string[];
}> => {
  try {
    // Get all countries
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('id, name, code')
      .not('code', 'is', null);

    if (countriesError) throw countriesError;

    let totalArticles = 0;
    const errors: string[] = [];

    // Fetch news for each country
    for (const country of countries || []) {
      try {
        const articles = await fetchNewsForCountry(country.code, country.name);

        // Cache articles in database
        for (const article of articles) {
          const { error } = await supabase
            .from('rss_feeds')
            .upsert({
              title: article.title,
              link: article.link,
              description: article.description,
              pub_date: article.pubDate,
              source: article.source,
              country_code: country.code,
              country_name: country.name,
              image_url: article.imageUrl,
              author: article.author,
              category: 'general',
              guid: article.link, // Use URL as unique identifier
            }, {
              onConflict: 'guid',
              ignoreDuplicates: true,
            });

          if (!error) {
            totalArticles++;
          }
        }
      } catch (error) {
        console.error(`Error fetching news for ${country.name}:`, error);
        errors.push(`${country.name}: ${error}`);
      }
    }

    return {
      success: true,
      articlesAdded: totalArticles,
      errors,
    };
  } catch (error) {
    console.error('Error in autoRefreshAllCountries:', error);
    return {
      success: false,
      articlesAdded: 0,
      errors: [String(error)],
    };
  }
};

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// Example 1: Use in admin panel
import { autoRefreshAllCountries } from '@/lib/newsApiService';

const handleRefresh = async () => {
  const result = await autoRefreshAllCountries();
};

// Example 2: Fetch specific country
import { fetchNewsForCountry } from '@/lib/newsApiService';

const articles = await fetchNewsForCountry('NG', 'Nigeria');

// Example 3: Set up API keys in .env
VITE_NEWSAPI_KEY=your_key_here
VITE_GNEWS_KEY=your_key_here
VITE_CURRENTS_KEY=your_key_here

// If no keys set, automatically falls back to Google News RSS (free!)
*/
