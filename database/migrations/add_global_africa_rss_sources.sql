-- Add RSS Feed Sources for Global Africa Communities
-- This creates news sources for diaspora communities using Google News RSS feeds
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING)

-- Caribbean Countries
INSERT INTO rss_feed_sources (name, url, country_code, country_name, category, is_active, fetch_interval_minutes)
VALUES
  ('Google News: Saint Vincent', 'https://news.google.com/rss/search?q=Saint+Vincent+Grenadines&hl=en&gl=VC&ceid=VC:en', 'VC', 'Saint Vincent and the Grenadines', 'general', true, 120),
  ('Google News: Jamaica', 'https://news.google.com/rss/search?q=Jamaica+news&hl=en&gl=JM&ceid=JM:en', 'JM', 'Jamaica', 'general', true, 120),
  ('Google News: Trinidad', 'https://news.google.com/rss/search?q=Trinidad+Tobago+news&hl=en&gl=TT&ceid=TT:en', 'TT', 'Trinidad and Tobago', 'general', true, 120),
  ('Google News: Haiti', 'https://news.google.com/rss/search?q=Haiti+news&hl=fr&gl=HT&ceid=HT:fr', 'HT', 'Haiti', 'general', true, 120),
  ('Google News: Barbados', 'https://news.google.com/rss/search?q=Barbados+news&hl=en&gl=BB&ceid=BB:en', 'BB', 'Barbados', 'general', true, 120)
ON CONFLICT (url) DO NOTHING;

-- African Diaspora Communities
INSERT INTO rss_feed_sources (name, url, country_code, country_name, category, is_active, fetch_interval_minutes)
VALUES
  -- Black/African British
  ('Google News: Black British', 'https://news.google.com/rss/search?q=Black+British+OR+African+British&hl=en-GB&gl=GB&ceid=GB:en', 'GB-BA', 'Black/African British', 'general', true, 120),
  
  -- Black/African Europeans
  ('Google News: Black Europeans', 'https://news.google.com/rss/search?q=Black+European+OR+African+diaspora+Europe&hl=en&gl=DE&ceid=DE:en', 'EU-BA', 'Black/African Europeans', 'general', true, 120),
  
  -- Black/African Americans  
  ('Google News: African Americans', 'https://news.google.com/rss/search?q=African+American&hl=en-US&gl=US&ceid=US:en', 'US-BA', 'Black/African Americans', 'general', true, 120),
  
  -- Black/African Brazilians
  ('Google News: Afro-Brazilians', 'https://news.google.com/rss/search?q=Afro-Brazilian+OR+Black+Brazil&hl=pt-BR&gl=BR&ceid=BR:pt-419', 'BR-BA', 'Black/African Brazilians', 'general', true, 120)
ON CONFLICT (url) DO NOTHING;

-- Verify the new sources were added
SELECT name, country_code, country_name, is_active 
FROM rss_feed_sources 
WHERE country_code IN ('VC', 'JM', 'TT', 'HT', 'BB', 'GB-BA', 'EU-BA', 'US-BA', 'BR-BA')
ORDER BY country_code;
