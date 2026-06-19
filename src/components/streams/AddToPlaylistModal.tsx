import React, { useState, useEffect } from 'react';
import { X, Loader2, Music, Search, Plus, Check, ListPlus } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface PlaylistRow {
  id: string;
  title: string;
  cover_url: string | null;
}

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  songId: string | null;
  songTitle?: string;
}

/**
 * "Add to playlist" modal (Phase 17.5.2) — searchable list of the user's
 * playlists + inline "Create new playlist". Monochrome per the design system.
 * Mirrors CreatePlaylistModal's data approach (anon client, playlist_songs).
 */
export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ isOpen, onClose, songId, songTitle }) => {
  const { toast } = useToast();
  const { user, isSignedIn } = useUser();
  const [playlists, setPlaylists] = useState<PlaylistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;
    setAdded(new Set());
    setQuery('');
    setShowCreate(false);
    setNewTitle('');
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('playlists')
        .select('id, title, cover_url')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      setPlaylists((data as PlaylistRow[]) || []);
      setLoading(false);
    })();
  }, [isOpen, user?.id]);

  if (!isOpen) return null;

  const addToPlaylist = async (playlistId: string) => {
    if (!songId || added.has(playlistId)) return;
    setBusyId(playlistId);
    try {
      const { count } = await supabase
        .from('playlist_songs')
        .select('id', { count: 'exact', head: true })
        .eq('playlist_id', playlistId);
      const { error } = await supabase
        .from('playlist_songs')
        .insert({ playlist_id: playlistId, song_id: songId, position: count || 0 });
      // Unique(playlist_id, song_id) -> duplicate is fine, treat as added
      if (error && !`${error.message}`.toLowerCase().includes('duplicate')) throw error;
      setAdded((prev) => new Set(prev).add(playlistId));
      toast({ title: 'Added to playlist' });
    } catch (e: any) {
      toast({ title: 'Could not add', description: e.message, variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !user || !songId) return;
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('playlists')
        .insert({ title: newTitle.trim(), created_by: user.id, is_public: true })
        .select('id, title, cover_url')
        .single();
      if (error) throw error;
      await supabase.from('playlist_songs').insert({ playlist_id: data.id, song_id: songId, position: 0 });
      setPlaylists((prev) => [data as PlaylistRow, ...prev]);
      setAdded((prev) => new Set(prev).add(data.id));
      setShowCreate(false);
      setNewTitle('');
      toast({ title: 'Playlist created', description: `"${data.title}" — song added.` });
    } catch (e: any) {
      toast({ title: 'Could not create playlist', description: e.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const filtered = playlists.filter((p) => p.title.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2"><ListPlus size={20} /> Add to playlist</h2>
            {songTitle && <p className="text-xs text-gray-500 truncate mt-0.5">{songTitle}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors" aria-label="Close"><X size={22} /></button>
        </div>

        {!isSignedIn ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-4">Sign in to save songs to your playlists.</p>
            <a href={`/user/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`}
              className="inline-block bg-gray-900 text-white font-bold px-6 py-2.5 rounded-full hover:bg-black transition">Sign in</a>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-100 shrink-0 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a playlist…" className="pl-9" />
              </div>
              {showCreate ? (
                <div className="flex gap-2">
                  <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="New playlist name" autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()} />
                  <Button onClick={handleCreate} disabled={creating || !newTitle.trim()} className="bg-gray-900 text-white font-bold shrink-0">
                    {creating ? <Loader2 size={16} className="animate-spin" /> : 'Create'}
                  </Button>
                </div>
              ) : (
                <button onClick={() => setShowCreate(true)} className="w-full flex items-center gap-3 p-2.5 rounded-lg border-2 border-dashed border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900 transition font-bold text-sm">
                  <span className="w-9 h-9 rounded bg-gray-900 text-white flex items-center justify-center"><Plus size={18} /></span>
                  Create new playlist
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400" size={22} /></div>
              ) : filtered.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-10">{query.trim() ? 'No playlists match.' : 'No playlists yet — create one above.'}</p>
              ) : (
                filtered.map((pl) => {
                  const isAdded = added.has(pl.id);
                  return (
                    <button
                      key={pl.id}
                      onClick={() => addToPlaylist(pl.id)}
                      disabled={isAdded || busyId === pl.id}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition text-left"
                    >
                      <div className="w-11 h-11 rounded bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {pl.cover_url ? <img src={pl.cover_url} alt="" className="w-full h-full object-cover" /> : <Music size={16} className="text-gray-400" />}
                      </div>
                      <span className="flex-1 min-w-0 text-sm font-bold text-gray-900 truncate">{pl.title}</span>
                      <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isAdded ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {busyId === pl.id ? <Loader2 size={14} className="animate-spin" /> : isAdded ? <Check size={14} /> : <Plus size={14} />}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
