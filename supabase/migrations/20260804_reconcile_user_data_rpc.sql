-- Root-cause fix for the Clerk dev->production ID migration bug.
--
-- Clerk user IDs are stored as raw TEXT directly in ~60 tables (coins/XP,
-- listings, likes, playlists, missions, achievements, follows, etc.) with no
-- central foreign key. When the Clerk app moved from development to
-- production, every user got a brand-new ID (a separate user pool). The only
-- reconciliation that existed (AuthFinishPage matching by email) patched the
-- clerk_users table alone, leaving every other table's data stranded under
-- the old ID — invisible to the user's new session (coins/XP silently
-- "reset", listings disappeared, etc). See scripts/reports/clerk_migration_*
-- for the one-time data repair already applied for the 3 users affected so
-- far (2026-08-04).
--
-- This function performs the full remap atomically so it can be called the
-- moment any future user is reconciled by email, instead of only patching
-- clerk_users.
CREATE OR REPLACE FUNCTION public.reconcile_user_data(p_old_id TEXT, p_new_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  simple_tables TEXT[][] := ARRAY[
    ARRAY['coin_transfers','from_user_id'], ARRAY['coin_transfers','to_user_id'],
    ARRAY['user_ad_free','user_id'],
    ARRAY['marketplace_seller_ratings','seller_user_id'], ARRAY['marketplace_seller_ratings','rater_user_id'],
    ARRAY['referrals','referrer_user_id'], ARRAY['referrals','referred_user_id'],
    ARRAY['marketplace_listing_comments','user_id'],
    ARRAY['marketplace_leads','seller_user_id'], ARRAY['marketplace_leads','buyer_user_id'],
    ARRAY['marketplace_reviews','reviewer_user_id'],
    ARRAY['marketplace_transactions','buyer_user_id'], ARRAY['marketplace_transactions','seller_user_id'],
    ARRAY['marketplace_offers','buyer_user_id'], ARRAY['marketplace_offers','seller_user_id'],
    ARRAY['play_history','user_id'],
    ARRAY['podcast_subscriptions','user_id'],
    ARRAY['user_album_saves','user_id'],
    ARRAY['admin_activity_log','admin_user_id'], ARRAY['admin_activity_log','target_user_id'],
    ARRAY['user_logs','user_id'],
    ARRAY['user_profile_themes','user_id'],
    ARRAY['country_gallery_photos','uploaded_by_clerk_id'],
    ARRAY['business_package_subscriptions','clerk_user_id'],
    ARRAY['mission_history','user_id'],
    ARRAY['event_registrations','user_id'],
    ARRAY['movie_watchlist','user_id'],
    ARRAY['marketplace_cart_items','user_id'],
    ARRAY['admin_users','user_id'],
    ARRAY['podcast_listen_history','user_id'],
    ARRAY['marketplace_partners','owner_user_id'],
    ARRAY['country_key_listings','created_by_clerk_id'],
    ARRAY['marketplace_listings','created_by'],
    ARRAY['sports_predictions','user_id'],
    ARRAY['blog_authors','user_id'],
    ARRAY['purchased_songs','user_id'],
    ARRAY['gamification_history','user_id'],
    ARRAY['blog_comments','user_id'],
    ARRAY['user_artist_follows','user_id'],
    ARRAY['leaderboard_payouts','user_id'],
    ARRAY['verification_requests','clerk_user_id'],
    ARRAY['blog_comment_likes','user_id'],
    ARRAY['blog_post_likes','user_id'],
    ARRAY['marketplace_partner_members','member_user_id'],
    ARRAY['user_song_likes','user_id'],
    ARRAY['marketplace_chat_threads','buyer_user_id'], ARRAY['marketplace_chat_threads','seller_user_id'],
    ARRAY['marketplace_favorites','user_id'],
    ARRAY['artists','user_id'],
    ARRAY['events','created_by_user_id'],
    ARRAY['marketplace_chat_messages','sender_user_id'],
    ARRAY['marketplace_saved_searches','user_id'],
    ARRAY['playlists','created_by'], ARRAY['playlists','user_id'],
    ARRAY['user_playlist_likes','user_id'],
    ARRAY['user_verifications','user_id'],
    ARRAY['user_team_follows','user_id'],
    ARRAY['user_slideshow_submissions','user_id'],
    ARRAY['blog_bookmarks','user_id'],
    ARRAY['notifications','user_id']
  ];
  pair TEXT[];
  t TEXT;
  c TEXT;
BEGIN
  IF p_old_id IS NULL OR p_new_id IS NULL OR p_old_id = p_new_id THEN
    RETURN;
  END IF;

  -- Tables with no per-user uniqueness beyond their own id: a blanket remap
  -- can never violate a constraint. On any unexpected conflict (schema drift,
  -- a uniqueness rule added later), skip that one table rather than aborting
  -- the whole reconciliation — the row is left harmlessly under the old id.
  FOREACH pair SLICE 1 IN ARRAY simple_tables LOOP
    t := pair[1];
    c := pair[2];
    BEGIN
      EXECUTE format('UPDATE public.%I SET %I = $1 WHERE %I = $2', t, c, c) USING p_new_id, p_old_id;
    EXCEPTION
      WHEN unique_violation THEN
        RAISE NOTICE 'reconcile_user_data: skipped % (%) on unique_violation for % -> %', t, c, p_old_id, p_new_id;
      WHEN undefined_table OR undefined_column THEN
        NULL; -- table/column renamed or dropped since this function was written
    END;
  END LOOP;

  -- gamification_profiles: PK = user_id. Coins/XP are ADDED, never
  -- overwritten — this is the one place real value would be lost by a naive
  -- remap (the new id typically already has a few hours/days of its own
  -- activity by the time reconciliation runs).
  BEGIN
    IF EXISTS (SELECT 1 FROM gamification_profiles WHERE user_id = p_new_id) THEN
      UPDATE gamification_profiles new_row
      SET total_xp        = COALESCE(new_row.total_xp, 0) + COALESCE(old_row.total_xp, 0),
          bara_coins      = COALESCE(new_row.bara_coins, 0) + COALESCE(old_row.bara_coins, 0),
          current_level   = GREATEST(COALESCE(new_row.current_level, 1), COALESCE(old_row.current_level, 1)),
          daily_streak    = GREATEST(COALESCE(new_row.daily_streak, 0), COALESCE(old_row.daily_streak, 0)),
          consecutive_days= GREATEST(COALESCE(new_row.consecutive_days, 0), COALESCE(old_row.consecutive_days, 0)),
          multiplier      = GREATEST(COALESCE(new_row.multiplier, 1), COALESCE(old_row.multiplier, 1)),
          streak_shields  = GREATEST(COALESCE(new_row.streak_shields, 0), COALESCE(old_row.streak_shields, 0)),
          updated_at      = now()
      FROM gamification_profiles old_row
      WHERE new_row.user_id = p_new_id AND old_row.user_id = p_old_id;

      DELETE FROM gamification_profiles WHERE user_id = p_old_id;
    ELSE
      UPDATE gamification_profiles SET user_id = p_new_id WHERE user_id = p_old_id;
    END IF;
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
  END;

  -- user_profiles: PK = user_id, low-stakes (name + welcome-email flag).
  BEGIN
    IF EXISTS (SELECT 1 FROM user_profiles WHERE user_id = p_new_id) THEN
      UPDATE user_profiles new_row
      SET full_name = COALESCE(new_row.full_name, old_row.full_name),
          welcome_email_sent = (COALESCE(new_row.welcome_email_sent, false) OR COALESCE(old_row.welcome_email_sent, false)),
          updated_at = now()
      FROM user_profiles old_row
      WHERE new_row.user_id = p_new_id AND old_row.user_id = p_old_id;

      DELETE FROM user_profiles WHERE user_id = p_old_id;
    ELSE
      UPDATE user_profiles SET user_id = p_new_id WHERE user_id = p_old_id;
    END IF;
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
  END;

  -- user_achievements: UNIQUE(user_id, achievement_id). Move achievements the
  -- new id doesn't already have; drop true duplicates (already unlocked
  -- under both — the reward was already granted once, no value lost).
  BEGIN
    UPDATE user_achievements old_t
    SET user_id = p_new_id
    WHERE old_t.user_id = p_old_id
      AND NOT EXISTS (
        SELECT 1 FROM user_achievements new_t
        WHERE new_t.user_id = p_new_id AND new_t.achievement_id = old_t.achievement_id
      );
    DELETE FROM user_achievements WHERE user_id = p_old_id;
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
  END;

  -- user_missions: UNIQUE(user_id, mission_id). Same dedupe pattern; missions
  -- reset on their own schedule so dropping a duplicate in-progress mission
  -- is harmless.
  BEGIN
    UPDATE user_missions old_t
    SET user_id = p_new_id
    WHERE old_t.user_id = p_old_id
      AND NOT EXISTS (
        SELECT 1 FROM user_missions new_t
        WHERE new_t.user_id = p_new_id AND new_t.mission_id = old_t.mission_id
      );
    DELETE FROM user_missions WHERE user_id = p_old_id;
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
  END;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reconcile_user_data(TEXT, TEXT) TO anon, authenticated, service_role;
