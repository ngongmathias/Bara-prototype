-- Event Reminders & Engagement Email Triggers
-- Adds DB-level support for:
--   1. Event reminder emails (24h before event start)
--   2. Achievement unlocked emails (when user_achievements row inserted)
--   3. Streak warning emails (triggered manually or via cron)

-- ============================================================
-- STEP 1: Function to queue event reminder emails
-- Called by a scheduled job or manually for events starting in ~24h
-- ============================================================
CREATE OR REPLACE FUNCTION public.queue_event_reminder(p_event_id UUID)
RETURNS void AS $$
DECLARE
  v_event RECORD;
  v_registrations RECORD;
BEGIN
  -- Fetch event details
  SELECT id, title, start_date, location, organizer_name
  INTO v_event
  FROM public.events
  WHERE id = p_event_id
    AND start_date BETWEEN NOW() + INTERVAL '23 hours' AND NOW() + INTERVAL '25 hours'
    AND status = 'approved';

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Queue a reminder email for each registered attendee
  FOR v_registrations IN
    SELECT er.attendee_email, er.attendee_name, er.ticket_type
    FROM public.event_registrations er
    WHERE er.event_id = p_event_id
      AND er.status IN ('confirmed', 'pending')
      AND er.attendee_email IS NOT NULL
  LOOP
    INSERT INTO public.email_queue (
      to_email,
      subject,
      type,
      status,
      metadata
    ) VALUES (
      v_registrations.attendee_email,
      'Reminder: ' || v_event.title || ' is tomorrow!',
      'event_reminder',
      'pending',
      jsonb_build_object(
        'type', 'event_reminder',
        'data', jsonb_build_object(
          'userFirstname', COALESCE(split_part(v_registrations.attendee_name, ' ', 1), 'Explorer'),
          'eventTitle', v_event.title,
          'eventDate', to_char(v_event.start_date AT TIME ZONE 'UTC', 'FMDay, FMMonth FMDD, YYYY'),
          'eventTime', to_char(v_event.start_date AT TIME ZONE 'UTC', 'FMHH12:MI AM TZ'),
          'eventLocation', COALESCE(v_event.location, ''),
          'eventId', v_event.id::TEXT,
          'ticketType', COALESCE(v_registrations.ticket_type, 'General Admission'),
          'organizerName', COALESCE(v_event.organizer_name, 'the organizer')
        )
      )
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STEP 2: Trigger to send achievement unlocked email
-- Fires when a new row is inserted into user_achievements
-- ============================================================
CREATE OR REPLACE FUNCTION public.on_achievement_unlocked()
RETURNS TRIGGER AS $$
DECLARE
  v_achievement RECORD;
  v_user_email TEXT;
  v_user_name TEXT;
BEGIN
  -- Get achievement details
  SELECT title, description, xp_reward, coin_reward, category
  INTO v_achievement
  FROM public.achievements
  WHERE id = NEW.achievement_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Try to get user email from clerk_users table if it exists
  BEGIN
    SELECT email, first_name
    INTO v_user_email, v_user_name
    FROM public.clerk_users
    WHERE clerk_id = NEW.user_id
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    v_user_email := NULL;
    v_user_name := NULL;
  END;

  -- Only queue if we have an email
  IF v_user_email IS NOT NULL THEN
    INSERT INTO public.email_queue (
      to_email,
      subject,
      type,
      status,
      metadata
    ) VALUES (
      v_user_email,
      '🏆 Achievement Unlocked: ' || COALESCE(v_achievement.title, 'New Achievement') || '!',
      'achievement_unlocked',
      'pending',
      jsonb_build_object(
        'type', 'achievement_unlocked',
        'data', jsonb_build_object(
          'userFirstname', COALESCE(v_user_name, 'Explorer'),
          'achievementTitle', COALESCE(v_achievement.title, 'Achievement Unlocked'),
          'achievementDescription', COALESCE(v_achievement.description, 'You reached a new milestone!'),
          'xpReward', COALESCE(v_achievement.xp_reward, 0),
          'coinReward', COALESCE(v_achievement.coin_reward, 0),
          'category', COALESCE(v_achievement.category, 'general')
        )
      )
    );
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'on_achievement_unlocked failed: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_achievement_unlocked_email ON public.user_achievements;
CREATE TRIGGER tr_achievement_unlocked_email
AFTER INSERT ON public.user_achievements
FOR EACH ROW EXECUTE FUNCTION public.on_achievement_unlocked();

-- ============================================================
-- STEP 3: Function to send streak warning emails
-- Call this via a daily cron job (pg_cron) or Supabase scheduled function
-- Targets users with streaks >= 3 who haven't been active today
-- ============================================================
CREATE OR REPLACE FUNCTION public.queue_streak_warning_emails()
RETURNS INTEGER AS $$
DECLARE
  v_profile RECORD;
  v_user_email TEXT;
  v_user_name TEXT;
  v_count INTEGER := 0;
BEGIN
  FOR v_profile IN
    SELECT gp.user_id, gp.consecutive_days, gp.last_activity_at
    FROM public.gamification_profiles gp
    WHERE gp.consecutive_days >= 3
      AND gp.last_activity_at < NOW() - INTERVAL '20 hours'
      AND gp.last_activity_at > NOW() - INTERVAL '44 hours'
  LOOP
    -- Try to get user email
    BEGIN
      SELECT email, first_name
      INTO v_user_email, v_user_name
      FROM public.clerk_users
      WHERE clerk_id = v_profile.user_id
      LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
      v_user_email := NULL;
      v_user_name := NULL;
    END;

    IF v_user_email IS NOT NULL THEN
      -- Check we haven't already sent a streak warning today
      IF NOT EXISTS (
        SELECT 1 FROM public.email_queue
        WHERE to_email = v_user_email
          AND type = 'streak_warning'
          AND created_at > NOW() - INTERVAL '20 hours'
      ) THEN
        INSERT INTO public.email_queue (
          to_email,
          subject,
          type,
          status,
          metadata
        ) VALUES (
          v_user_email,
          '🔥 Don''t break your ' || v_profile.consecutive_days || '-day streak!',
          'streak_warning',
          'pending',
          jsonb_build_object(
            'type', 'streak_warning',
            'data', jsonb_build_object(
              'userFirstname', COALESCE(v_user_name, 'Explorer'),
              'currentStreak', v_profile.consecutive_days,
              'lastActivityDate', to_char(v_profile.last_activity_at AT TIME ZONE 'UTC', 'FMDay, FMMonth FMDD')
            )
          )
        );
        v_count := v_count + 1;
      END IF;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STEP 4: Helper view — upcoming events needing reminders
-- Run queue_event_reminder(id) for each row in this view daily
-- ============================================================
CREATE OR REPLACE VIEW public.events_needing_reminders AS
SELECT id, title, start_date, location
FROM public.events
WHERE start_date BETWEEN NOW() + INTERVAL '23 hours' AND NOW() + INTERVAL '25 hours'
  AND status = 'approved';

-- ============================================================
-- STEP 5: Function to send weekly digest emails
-- Call this once per week via pg_cron or Supabase scheduled function
-- Gathers each user's weekly stats and queues a digest email
-- ============================================================
CREATE OR REPLACE FUNCTION public.queue_weekly_digest_emails()
RETURNS INTEGER AS $$
DECLARE
  v_profile RECORD;
  v_user_email TEXT;
  v_user_name TEXT;
  v_xp_earned INTEGER;
  v_coins_earned INTEGER;
  v_missions_completed INTEGER;
  v_total_missions INTEGER;
  v_achievements_unlocked INTEGER;
  v_top_event RECORD;
  v_new_listings INTEGER;
  v_count INTEGER := 0;
  v_week_start TIMESTAMPTZ := date_trunc('week', NOW()) - INTERVAL '7 days';
  v_week_label TEXT := to_char(v_week_start, 'FMMonth FMDD') || ' – ' || to_char(v_week_start + INTERVAL '6 days', 'FMMonth FMDD, YYYY');
BEGIN
  FOR v_profile IN
    SELECT gp.user_id, gp.level, gp.consecutive_days, gp.bara_coins, gp.total_xp
    FROM public.gamification_profiles gp
    WHERE gp.last_activity_at > NOW() - INTERVAL '30 days'
  LOOP
    -- Get user email
    BEGIN
      SELECT email, first_name
      INTO v_user_email, v_user_name
      FROM public.clerk_users
      WHERE clerk_id = v_profile.user_id
      LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
      v_user_email := NULL;
      v_user_name := NULL;
    END;

    IF v_user_email IS NULL THEN
      CONTINUE;
    END IF;

    -- Skip if already sent this week
    IF EXISTS (
      SELECT 1 FROM public.email_queue
      WHERE to_email = v_user_email
        AND type = 'weekly_digest'
        AND created_at > v_week_start + INTERVAL '7 days'
    ) THEN
      CONTINUE;
    END IF;

    -- XP earned this week
    SELECT COALESCE(SUM(amount), 0) INTO v_xp_earned
    FROM public.gamification_history
    WHERE user_id = v_profile.user_id
      AND type IN ('xp_gain', 'mission_xp')
      AND created_at >= v_week_start
      AND created_at < v_week_start + INTERVAL '7 days';

    -- Coins earned this week
    SELECT COALESCE(SUM(amount), 0) INTO v_coins_earned
    FROM public.gamification_history
    WHERE user_id = v_profile.user_id
      AND type IN ('coin_gain', 'coin_purchase', 'mission_coins')
      AND amount > 0
      AND created_at >= v_week_start
      AND created_at < v_week_start + INTERVAL '7 days';

    -- Missions completed this week
    SELECT COUNT(*) INTO v_missions_completed
    FROM public.mission_history
    WHERE user_id = v_profile.user_id
      AND completed_at >= v_week_start
      AND completed_at < v_week_start + INTERVAL '7 days';

    -- Total available missions
    SELECT COUNT(*) INTO v_total_missions
    FROM public.user_missions
    WHERE user_id = v_profile.user_id;

    -- Achievements unlocked this week
    SELECT COUNT(*) INTO v_achievements_unlocked
    FROM public.user_achievements
    WHERE user_id = v_profile.user_id
      AND unlocked_at >= v_week_start
      AND unlocked_at < v_week_start + INTERVAL '7 days';

    -- Top upcoming event the user is registered for
    BEGIN
      SELECT e.title, e.start_date, e.id::TEXT
      INTO v_top_event
      FROM public.event_registrations er
      JOIN public.events e ON e.id = er.event_id
      WHERE er.attendee_email = v_user_email
        AND e.start_date > NOW()
        AND e.status = 'approved'
      ORDER BY e.start_date ASC
      LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
      v_top_event := NULL;
    END;

    -- New marketplace listings this week
    SELECT COUNT(*) INTO v_new_listings
    FROM public.marketplace_listings
    WHERE created_at >= v_week_start
      AND created_at < v_week_start + INTERVAL '7 days'
      AND status = 'active';

    -- Queue the digest email
    INSERT INTO public.email_queue (
      to_email,
      subject,
      type,
      status,
      metadata
    ) VALUES (
      v_user_email,
      'Your Bara Afrika Weekly Digest — ' || v_week_label,
      'weekly_digest',
      'pending',
      jsonb_build_object(
        'type', 'weekly_digest',
        'data', jsonb_build_object(
          'userFirstname', COALESCE(v_user_name, 'Explorer'),
          'weekOf', v_week_label,
          'xpEarned', v_xp_earned,
          'coinsEarned', v_coins_earned,
          'currentLevel', COALESCE(v_profile.level, 1),
          'currentStreak', COALESCE(v_profile.consecutive_days, 0),
          'missionsCompleted', v_missions_completed,
          'totalMissions', v_total_missions,
          'achievementsUnlocked', v_achievements_unlocked,
          'topEventTitle', COALESCE(v_top_event.title, ''),
          'topEventDate', CASE WHEN v_top_event.start_date IS NOT NULL
            THEN to_char(v_top_event.start_date AT TIME ZONE 'UTC', 'FMDay, FMMonth FMDD, YYYY')
            ELSE '' END,
          'topEventId', COALESCE(v_top_event.id, ''),
          'newListingsCount', v_new_listings,
          'leaderboardRank', 0
        )
      )
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- NOTES FOR SETUP:
-- 
-- To enable daily event reminders, set up a Supabase scheduled function
-- or pg_cron job that calls:
--
--   SELECT queue_event_reminder(id) FROM events_needing_reminders;
--
-- To enable daily streak warnings, call:
--
--   SELECT queue_streak_warning_emails();
--
-- To enable weekly digest emails (run once per week, e.g. Sunday 9am):
--
--   SELECT queue_weekly_digest_emails();
--
-- All functions write to email_queue, which is processed by the
-- tr_process_email_queue trigger → send-email edge function.
-- ============================================================
