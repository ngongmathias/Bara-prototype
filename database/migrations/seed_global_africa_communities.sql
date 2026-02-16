-- Seed additional Global Africa (diaspora) communities so /countries/:slug URLs work.
-- Slug is derived from name: lowercase, spaces → hyphens, non-alphanumeric removed.
-- E.g. "Black/African British" → /countries/blackafrican-british
-- Run after create_global_africa_table.sql. Safe to re-run (ON CONFLICT DO NOTHING).

INSERT INTO global_africa (name, code, flag_emoji, display_order, is_active) VALUES
    ('Black/African British', 'GB-BA', '🇬🇧', 7, true),
    ('Black/African Europeans', 'EU-BA', '🌍', 8, true),
    ('Black/African Americans', 'US-BA', '🇺🇸', 9, true),
    ('Black/African Brazilians', 'BR-BA', '🇧🇷', 10, true)
ON CONFLICT (name) DO UPDATE SET is_active = true;
