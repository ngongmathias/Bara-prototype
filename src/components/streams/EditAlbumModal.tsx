import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X, Image as ImageIcon, Trash2 } from 'lucide-react';

const TYPES = ['Album', 'EP', 'Single', 'Mixtape', 'Compilation'];

interface Props {
  album: { id: string; title: string; cover_url: string | null };
  artistId: string;
  onClose: () => void;
  onSaved: () => void;
}

export const EditAlbumModal = ({ album, artistId, onClose, onSaved }: Props) => {
  const { user } = useUser();
  const { toast } = useToast();
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(album.title);
  const [type, setType] = useState('Album');
  const [releaseDate, setReleaseDate] = useState('');
  const [description, setDescription] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | null>(album.cover_url);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [songs, setSongs] = useState<{ id: string; title: string; album_id: string | null }[]>([]);
  const [inAlbum, setInAlbum] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: full }, { data: artistSongs }] = await Promise.all([
        supabase.from('albums').select('type, release_date, description').eq('id', album.id).maybeSingle(),
        supabase.from('songs').select('id, title, album_id').eq('artist_id', artistId).order('created_at', { ascending: false }),
      ]);
      if (full) {
        const t = (full as any).type;
        setType(t ? t.charAt(0).toUpperCase() + t.slice(1) : 'Album');
        setReleaseDate((full as any).release_date || '');
        setDescription((full as any).description || '');
      }
      setSongs(artistSongs || []);
      setInAlbum(new Set((artistSongs || []).filter((s: any) => s.album_id === album.id).map((s: any) => s.id)));
      setLoading(false);
    })();
  }, [album.id, artistId]);

  const handleCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const toggleTrack = (id: string) => {
    setInAlbum((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (!title.trim()) { toast({ title: 'Title required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      let coverUrl = album.cover_url;
      if (coverFile && user?.id) {
        const ext = coverFile.name.split('.').pop() || 'jpg';
        const path = `covers/${user.id}/album_${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('music').upload(path, coverFile, { contentType: coverFile.type });
        if (upErr) throw upErr;
        coverUrl = supabase.storage.from('music').getPublicUrl(path).data.publicUrl;
      }

      const { error } = await supabase.from('albums').update({
        title: title.trim(),
        type: type.toLowerCase(),
        release_date: releaseDate || null,
        description: description.trim() || null,
        cover_url: coverUrl || null,
      }).eq('id', album.id);
      if (error) throw error;

      // Apply track assignment changes (only the ones that actually changed).
      const updates: Promise<any>[] = [];
      for (const s of songs) {
        const wasIn = s.album_id === album.id;
        const nowIn = inAlbum.has(s.id);
        if (wasIn && !nowIn) updates.push(supabase.from('songs').update({ album_id: null }).eq('id', s.id));
        else if (!wasIn && nowIn) updates.push(supabase.from('songs').update({ album_id: album.id }).eq('id', s.id));
      }
      await Promise.all(updates);

      toast({ title: 'Saved', description: 'Album updated.' });
      onSaved();
      onClose();
    } catch (e: any) {
      toast({ title: "Couldn't save", description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      // Songs' album_id is set NULL by the FK on delete — tracks are not removed.
      const { error } = await supabase.from('albums').delete().eq('id', album.id);
      if (error) throw error;
      toast({ title: 'Album deleted', description: 'Its tracks were kept as singles.' });
      onSaved();
      onClose();
    } catch (e: any) {
      toast({ title: "Couldn't delete", description: e.message, variant: 'destructive' });
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
          <h2 className="text-lg font-black text-gray-900">Edit Album</h2>
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
                <label className={label}>Type</label>
                <select className={input} value={type} onChange={(e) => setType(e.target.value)}>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Release date</label>
                <input type="date" className={input} value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
              </div>
            </div>

            <div>
              <label className={label}>Description</label>
              <textarea className={`${input} min-h-[70px] resize-none`} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div>
              <label className={label}>Tracks in this album</label>
              {songs.length === 0 ? (
                <p className="text-xs text-gray-400">You have no tracks yet. Upload some, then add them here.</p>
              ) : (
                <div className="border border-gray-200 rounded-md divide-y max-h-48 overflow-y-auto">
                  {songs.map((s) => (
                    <label key={s.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" checked={inAlbum.has(s.id)} onChange={() => toggleTrack(s.id)} className="accent-gray-900" />
                      <span className="text-sm text-gray-800 truncate">{s.title}</span>
                      {s.album_id && s.album_id !== album.id && <span className="ml-auto text-[10px] text-gray-400">in another album</span>}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 p-5 border-t border-gray-100 shrink-0">
          <button onClick={() => setConfirmDelete(true)} className="p-2.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100" aria-label="Delete album" title="Delete album"><Trash2 size={18} /></button>
          <div className="flex-1" />
          <button onClick={onClose} className="px-4 py-2.5 rounded-md text-gray-700 font-bold hover:bg-gray-100">Cancel</button>
          <button onClick={handleSave} disabled={saving || loading} className="px-5 py-2.5 rounded-md bg-gray-900 text-white font-black hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="animate-spin" size={18} /> : 'Save'}
          </button>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-[310] flex items-center justify-center p-4 bg-black/50" onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-black text-gray-900 mb-2">Delete this album?</h3>
            <p className="text-sm text-gray-500 mb-5">The album will be removed. Its tracks are kept and become singles.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 rounded-md text-gray-700 font-bold hover:bg-gray-100">Cancel</button>
              <button onClick={handleDelete} disabled={saving} className="flex-1 py-2.5 rounded-md bg-gray-900 text-white font-black hover:bg-black disabled:opacity-50">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
