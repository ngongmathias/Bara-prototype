-- ============================================================
-- New-release notifications (Streams Tier 2 #6 / F10)
-- ============================================================
-- When a song is inserted, notify everyone who follows that artist — via either
-- follow mechanism: user_follows (following the artist's user account, used by
-- FollowUserButton on ArtistPage) or the legacy user_artist_follows.
--
-- Notifications use the existing `notifications` table (type
-- 'new_song_from_artist', already in the frontend NotificationType union + bell
-- icon mapping) and surface live via the existing realtime subscription.
--
-- Safety:
--  * SECURITY DEFINER so it can write notifications for other users.
--  * Whole body wrapped in EXCEPTION → a notification failure can NEVER block /
--    roll back the song upload.
--  * Anti-spam: skip pure catalogue imports (upload_type='platform' AND the
--    artist has no user account). Creator uploads and real-artist uploads notify.
-- ============================================================

CREATE OR REPLACE FUNCTION public.notify_followers_of_new_song()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_artist_name text;
  v_artist_user_id text;
BEGIN
  IF NEW.artist_id IS NULL THEN RETURN NEW; END IF;

  SELECT name, user_id INTO v_artist_name, v_artist_user_id
  FROM public.artists WHERE id = NEW.artist_id;

  IF v_artist_name IS NULL THEN RETURN NEW; END IF;

  -- Skip faceless catalogue seeding to avoid notification spam.
  IF COALESCE(NEW.upload_type, 'platform') = 'platform' AND v_artist_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, message, link)
  SELECT DISTINCT f.uid,
         'new_song_from_artist',
         'New release from ' || v_artist_name,
         '"' || NEW.title || '" is out now on BARA Streams',
         '/streams/song/' || NEW.id::text
  FROM (
    SELECT follower_user_id AS uid
      FROM public.user_follows
     WHERE v_artist_user_id IS NOT NULL AND followee_user_id = v_artist_user_id
    UNION
    SELECT user_id AS uid
      FROM public.user_artist_follows
     WHERE artist_id = NEW.artist_id
  ) f
  WHERE f.uid IS NOT NULL
    AND f.uid <> COALESCE(v_artist_user_id, '');

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never let a notification problem block the upload.
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_notify_new_song ON public.songs;
CREATE TRIGGER tr_notify_new_song
AFTER INSERT ON public.songs
FOR EACH ROW
EXECUTE FUNCTION public.notify_followers_of_new_song();
