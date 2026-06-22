import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X, Image as ImageIcon } from 'lucide-react';

const GENRES = [
  'Afrobeats', 'Amapiano', 'Highlife', 'Afropop', 'Bongo Flava',
  'Gengetone', 'Gqom', 'Kwaito', 'Jùjú', 'Fuji',
  'Soukous', 'Rumba', 'Mbalax', 'Hiplife', 'Azonto',
  'Afro-Soul', 'Gospel', 'R&B', 'Hip Hop', 'Dancehall',
  'Reggae', 'Jazz', 'Classical', 'Electronic', 'Pop', 'Other',
];

export interface EditableSong {
  id: string;
  title: string;
  genre: string | null;
  album_id: string | null;
  cover_url: string | null;
}

interface Props {
  song: EditableSong;
  artistId: string;
  albums: { id: string; title: string }[];
  onClose: () => void;
  onSaved: () => void;
}

export const EditSongModal = ({ song, artistId, albums, onClose, onSaved }: Props) => {
  const { user } = useUser();
  const { toast } = useToast();
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(song.title);
  const [genre, setGenre] = useState(song.genre || '');
  const [albumId, setAlbumId] = useState(song.album_id || '');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [producer, setProducer] = useState('');
  const [songwriter, setSongwriter] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | null>(song.cover_url);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [allArtists, setAllArtists] = useState<{ id: string; name: string }[]>([]);
  const [featuredIds, setFeaturedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load the song's full current values + the artist list for the feature picker.
  useEffect(() => {
    (async () => {
      const [{ data: full }, { data: artists }, { data: feats }] = await Promise.all([
        supabase.from('songs').select('price, description, lyrics, producer, songwriter').eq('id', song.id).maybeSingle(),
        supabase.from('artists').select('id, name').order('name'),
        supabase.from('song_artists').select('artist_id').eq('song_id', song.id).eq('role', 'featured'),
      ]);
      if (full) {
        setPrice(full.price != null ? String(full.price) : '');
        setDescription((full as any).description || '');
        setLyrics(full.lyrics || '');
        setProducer((full as any).producer || '');
        setSongwriter((full as any).songwriter || '');
      }
      setAllArtists(artists || []);
      setFeaturedIds((feats || []).map((f: any) => f.artist_id));
      setLoading(false);
    })();
  }, [song.id]);

  const handleCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!title.trim()) { toast({ title: 'Title required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      let coverUrl = song.cover_url;
      if (coverFile && user?.id) {
        const ext = coverFile.name.split('.').pop() || 'jpg';
        const path = `covers/${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('music').upload(path, coverFile, { contentType: coverFile.type });
        if (upErr) throw upErr;
        coverUrl = supabase.storage.from('music').getPublicUrl(path).data.publicUrl;
      }

      const { error } = await supabase.from('songs').update({
        title: title.trim(),
        genre: genre || null,
        album_id: albumId || null,
        price: price ? parseFloat(price) : null,
        description: description.trim() || null,
        lyrics: lyrics.trim() || null,
        producer: producer.trim() || null,
        songwriter: songwriter.trim() || null,
        cover_url: coverUrl || null,
      }).eq('id', song.id);
      if (error) throw error;

      // Sync featured artists (primary stays; replace the 'featured' rows).
      try {
        await supabase.from('song_artists').delete().eq('song_id', song.id).eq('role', 'featured');
        if (featuredIds.length > 0) {
          await supabase.from('song_artists').insert(
            featuredIds.map((aid, i) => ({ song_id: song.id, artist_id: aid, role: 'featured', display_order: i + 1 }))
          );
        }
      } catch { /* featured credits are best-effort */ }

      toast({ title: 'Saved', description: 'Your track was updated.' });
      onSaved();
      onClose();
    } catch (e: any) {
      toast({ title: "Couldn't save", description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const input = 'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';
  const label = 'block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1';

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-black text-gray-900">Edit Track</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Close"><X size={22} /></button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gray-900" size={28} /></div>
        ) : (
          <div className="overflow-y-auto p-5 space-y-4">
            <div className="flex gap-4">
              <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCover} className="hidden" />
              <div onClick={() => coverInputRef.current?.click()} className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer overflow-hidden flex-shrink-0">
                {coverPreview ? <img src={coverPreview} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-400" size={24} />}
              </div>
              <div className="flex-1">
                <label className={label}>Title</label>
                <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} />
                <p className="text-[11px] text-gray-400 mt-2">Tap the cover to replace it.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Genre</label>
                <select className={input} value={genre} onChange={(e) => setGenre(e.target.value)}>
                  <option value="">—</option>
                  {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Album</label>
                <select className={input} value={albumId} onChange={(e) => setAlbumId(e.target.value)}>
                  <option value="">Single</option>
                  {albums.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={label}>Featured artists</label>
              <div className="flex flex-wrap gap-1 mb-1">
                {featuredIds.map((aid) => {
                  const a = allArtists.find((x) => x.id === aid);
                  return a ? (
                    <span key={aid} className="bg-gray-100 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      {a.name}
                      <button onClick={() => setFeaturedIds((p) => p.filter((id) => id !== aid))} className="text-gray-400 hover:text-gray-700">&times;</button>
                    </span>
                  ) : null;
                })}
              </div>
              <select className={input} value="" onChange={(e) => { const v = e.target.value; if (v && v !== artistId && !featuredIds.includes(v)) setFeaturedIds((p) => [...p, v]); }}>
                <option value="">Add a featured artist…</option>
                {allArtists.filter((a) => a.id !== artistId && !featuredIds.includes(a.id)).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Producer</label>
                <input className={input} value={producer} onChange={(e) => setProducer(e.target.value)} placeholder="optional" />
              </div>
              <div>
                <label className={label}>Songwriter</label>
                <input className={input} value={songwriter} onChange={(e) => setSongwriter(e.target.value)} placeholder="optional" />
              </div>
            </div>

            <div>
              <label className={label}>Price (USD)</label>
              <input className={input} type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00 (free)" />
            </div>

            <div>
              <label className={label}>Description</label>
              <textarea className={`${input} min-h-[70px] resize-none`} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div>
              <label className={label}>Lyrics</label>
              <textarea className={`${input} min-h-[120px] resize-y font-mono text-xs`} value={lyrics} onChange={(e) => setLyrics(e.target.value)} placeholder="Optional. Prefix lines with [mm:ss] for synced lyrics." />
            </div>
          </div>
        )}

        <div className="flex gap-3 p-5 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-md text-gray-700 font-bold hover:bg-gray-100">Cancel</button>
          <button onClick={handleSave} disabled={saving || loading} className="flex-1 py-2.5 rounded-md bg-gray-900 text-white font-black hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="animate-spin" size={18} /> : 'Save changes'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
