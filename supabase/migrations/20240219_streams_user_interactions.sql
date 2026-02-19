-- Track user likes for songs
CREATE TABLE IF NOT EXISTS public.user_song_likes (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, song_id)
);

-- Track user likes for playlists
CREATE TABLE IF NOT EXISTS public.user_playlist_likes (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, playlist_id)
);

-- Track user follows for artists
CREATE TABLE IF NOT EXISTS public.user_artist_follows (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, artist_id)
);

-- Enable RLS
ALTER TABLE public.user_song_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_playlist_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_artist_follows ENABLE ROW LEVEL SECURITY;

-- Policies for user_song_likes
CREATE POLICY "Users can view their own song likes" ON public.user_song_likes
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own song likes" ON public.user_song_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own song likes" ON public.user_song_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for user_playlist_likes
CREATE POLICY "Users can view their own playlist likes" ON public.user_playlist_likes
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own playlist likes" ON public.user_playlist_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own playlist likes" ON public.user_playlist_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for user_artist_follows
CREATE POLICY "Users can view their own artist follows" ON public.user_artist_follows
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own artist follows" ON public.user_artist_follows
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own artist follows" ON public.user_artist_follows
    FOR DELETE USING (auth.uid() = user_id);
