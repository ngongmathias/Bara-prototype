import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { supabase } from '@/lib/supabase';
import { SEO } from '@/components/SEO';
import { Clock, Music, User as UserIcon, Flame, Loader2 } from 'lucide-react';

interface StatBucket {
  minutes: number;
  plays: number;
}

interface TopEntry {
  key: string;
  label: string;
  count: number;
  imageUrl?: string;
}

export default function ListeningStatsPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [weekStats, setWeekStats] = useState<StatBucket>({ minutes: 0, plays: 0 });
  const [monthStats, setMonthStats] = useState<StatBucket>({ minutes: 0, plays: 0 });
  const [topArtists, setTopArtists] = useState<TopEntry[]>([]);
  const [topGenres, setTopGenres] = useState<TopEntry[]>([]);
  const [streakDays, setStreakDays] = useState(0);

  useEffect(() => {
    if (!user) return;
    const run = async () => {
      setLoading(true);
      try {
        const since = new Date();
        since.setDate(since.getDate() - 30);

        const { data: history } = await supabase
          .from('play_history')
          .select('song_id, played_at, songs(id, title, duration, genre, artist_id, artists(id, name, image_url))')
          .eq('user_id', user.id)
          .gte('played_at', since.toISOString())
          .order('played_at', { ascending: false })
          .limit(2000);

        const rows = (history || []) as any[];
        const weekCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;

        let wMinutes = 0, wPlays = 0, mMinutes = 0, mPlays = 0;
        const artistCounts = new Map<string, TopEntry>();
        const genreCounts = new Map<string, TopEntry>();
        const dayKeys = new Set<string>();

        rows.forEach((row: any) => {
          const playedAtMs = new Date(row.played_at).getTime();
          const dur = row.songs?.duration || 0;
          mMinutes += dur / 60;
          mPlays += 1;
          if (playedAtMs >= weekCutoff) {
            wMinutes += dur / 60;
            wPlays += 1;
          }
          // Day-level key for streak
          const d = new Date(playedAtMs);
          dayKeys.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);

          // Top artists
          const artist = row.songs?.artists;
          if (artist?.id) {
            const existing = artistCounts.get(artist.id);
            if (existing) existing.count += 1;
            else artistCounts.set(artist.id, { key: artist.id, label: artist.name, count: 1, imageUrl: artist.image_url });
          }

          // Top genres
          const genre = row.songs?.genre;
          if (genre) {
            const existing = genreCounts.get(genre);
            if (existing) existing.count += 1;
            else genreCounts.set(genre, { key: genre, label: genre, count: 1 });
          }
        });

        setWeekStats({ minutes: Math.round(wMinutes), plays: wPlays });
        setMonthStats({ minutes: Math.round(mMinutes), plays: mPlays });
        setTopArtists(Array.from(artistCounts.values()).sort((a, b) => b.count - a.count).slice(0, 5));
        setTopGenres(Array.from(genreCounts.values()).sort((a, b) => b.count - a.count).slice(0, 5));

        // Streak: consecutive days ending today with at least one play
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          if (dayKeys.has(key)) streak += 1;
          else break;
        }
        setStreakDays(streak);
      } catch (err) {
        console.error('Listening stats error:', err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user]);

  if (!user) {
    return (
      <StreamsLayout>
        <div className="max-w-3xl mx-auto py-20 text-center">
          <p className="text-gray-500">Sign in to see your listening stats.</p>
        </div>
      </StreamsLayout>
    );
  }

  return (
    <StreamsLayout>
      <SEO title="Your Listening Stats | Bara Streams" description="Personalized listening stats for Bara Streams." />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-comfortaa font-bold text-gray-900 mb-2">Your Listening Stats</h1>
          <p className="text-gray-600">Your music habits over the last 30 days.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : monthStats.plays === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-xl">
            <Music className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No plays yet. Start listening to build your stats!</p>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <StatCard icon={Clock} label="This week" value={`${weekStats.minutes} min`} sub={`${weekStats.plays} plays`} />
              <StatCard icon={Clock} label="This month" value={`${monthStats.minutes} min`} sub={`${monthStats.plays} plays`} />
              <StatCard icon={Flame} label="Streak" value={`${streakDays} day${streakDays === 1 ? '' : 's'}`} sub="in a row" />
              <StatCard icon={UserIcon} label="Top artist" value={topArtists[0]?.label || '—'} sub={topArtists[0] ? `${topArtists[0].count} plays` : ''} />
            </div>

            {/* Top artists */}
            <section className="mb-10">
              <h2 className="text-xl font-comfortaa font-semibold text-gray-900 mb-4">Top Artists</h2>
              {topArtists.length === 0 ? (
                <p className="text-sm text-gray-500">Not enough data yet.</p>
              ) : (
                <div className="space-y-2">
                  {topArtists.map((a, idx) => (
                    <div key={a.key} className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-lg">
                      <span className="text-sm font-bold text-gray-400 w-6">#{idx + 1}</span>
                      {a.imageUrl ? (
                        <img src={a.imageUrl} alt={a.label} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold">
                          {a.label.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{a.label}</div>
                        <div className="text-xs text-gray-500">{a.count} plays</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Top genres */}
            <section>
              <h2 className="text-xl font-comfortaa font-semibold text-gray-900 mb-4">Top Genres</h2>
              {topGenres.length === 0 ? (
                <p className="text-sm text-gray-500">Not enough data yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {topGenres.map((g) => (
                    <span
                      key={g.key}
                      className="inline-flex items-center gap-2 bg-purple-50 text-purple-800 border border-purple-200 px-3 py-1.5 rounded-full text-sm font-semibold"
                    >
                      {g.label}
                      <span className="text-xs text-purple-500">{g.count}</span>
                    </span>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </StreamsLayout>
  );
}

const StatCard = ({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) => (
  <div className="bg-white border border-gray-100 rounded-xl p-4">
    <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide mb-2">
      <Icon className="w-4 h-4" />
      {label}
    </div>
    <div className="text-2xl font-bold text-gray-900 truncate">{value}</div>
    {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
  </div>
);
