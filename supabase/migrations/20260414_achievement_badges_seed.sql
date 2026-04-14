-- Seed the achievements listed in MASTER_PLAN 21.2.3

INSERT INTO public.achievements (key, title, description, xp_reward, coin_reward, category)
VALUES
  ('early_adopter',    'Early Adopter',     'Joined Bara Afrika in its first season',                100, 50, 'community'),
  ('music_lover',      'Music Lover',       'Listened to 1,000 songs on Bara Streams',               500, 250, 'music'),
  ('event_explorer',   'Event Explorer',    'Saved or attended 10 events',                            250, 100, 'community'),
  ('top_seller',       'Top Seller',        'Completed 10 successful marketplace sales',              500, 250, 'market'),
  ('prolific_writer',  'Prolific Writer',   'Published 10 blog posts',                                400, 200, 'community'),
  ('playlist_creator', 'Playlist Creator',  'Created your first playlist',                            50,  25,  'music'),
  ('first_purchase',   'First Purchase',    'Made your first marketplace purchase',                   100, 50,  'market'),
  ('event_host',       'Event Host',        'Published your first event',                            150, 75,  'community'),
  ('streak_7',         '7 Day Streak',      'Signed in 7 days in a row',                              150, 75,  'general'),
  ('streak_30',        '30 Day Streak',     'Signed in 30 days in a row',                             500, 250, 'general')
ON CONFLICT (key) DO UPDATE
SET title       = EXCLUDED.title,
    description = EXCLUDED.description,
    xp_reward   = EXCLUDED.xp_reward,
    coin_reward = EXCLUDED.coin_reward,
    category    = EXCLUDED.category;
