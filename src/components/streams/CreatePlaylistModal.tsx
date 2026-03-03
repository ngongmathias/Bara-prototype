import React, { useState, useEffect } from 'react';
import { X, Loader2, Music, Search, Plus, Check, ArrowRight } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface SongItem {
    id: string;
    title: string;
    cover_url: string | null;
    artists?: { name: string } | null;
}

interface CreatePlaylistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const { user, isLoaded } = useUser();

    // Step 2: Add songs
    const [step, setStep] = useState<'details' | 'songs'>('details');
    const [playlistId, setPlaylistId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [recommendedSongs, setRecommendedSongs] = useState<SongItem[]>([]);
    const [searchResults, setSearchResults] = useState<SongItem[]>([]);
    const [addedSongIds, setAddedSongIds] = useState<Set<string>>(new Set());
    const [loadingSongs, setLoadingSongs] = useState(false);

    useEffect(() => {
        if (step === 'songs') {
            fetchRecommendedSongs();
        }
    }, [step]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(() => searchSongs(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchRecommendedSongs = async () => {
        setLoadingSongs(true);
        const { data } = await supabase
            .from('songs')
            .select('id, title, cover_url, artists(name)')
            .order('plays', { ascending: false })
            .limit(20);
        setRecommendedSongs((data as SongItem[]) || []);
        setLoadingSongs(false);
    };

    const searchSongs = async (query: string) => {
        const { data } = await supabase
            .from('songs')
            .select('id, title, cover_url, artists(name)')
            .ilike('title', `%${query}%`)
            .limit(20);
        setSearchResults((data as SongItem[]) || []);
    };

    const addSongToPlaylist = async (songId: string) => {
        if (!playlistId || addedSongIds.has(songId)) return;
        const position = addedSongIds.size;
        const { error } = await supabase.from('playlist_songs').insert({
            playlist_id: playlistId,
            song_id: songId,
            position,
        });
        if (!error) {
            setAddedSongIds(prev => new Set(prev).add(songId));
        }
    };

    if (!isOpen) return null;

    const handleCreatePlaylist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast({ title: 'Error', description: 'Please provide a title for your playlist.', variant: 'destructive' });
            return;
        }
        if (!isLoaded || !user) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('playlists')
                .insert({
                    title: title.trim(),
                    description: description.trim(),
                    created_by: user.id,
                    is_public: true,
                })
                .select('id')
                .single();

            if (error) throw error;
            setPlaylistId(data.id);
            setStep('songs');
        } catch (error: any) {
            console.error('Error creating playlist:', error);
            toast({ title: 'Error', description: error.message || 'Failed to create playlist.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleFinish = () => {
        toast({ title: 'Playlist created!', description: `"${title}" with ${addedSongIds.size} song${addedSongIds.size !== 1 ? 's' : ''}.` });
        setTitle('');
        setDescription('');
        setStep('details');
        setPlaylistId(null);
        setAddedSongIds(new Set());
        setSearchQuery('');
        onSuccess?.();
        onClose();
    };

    const songsToShow = searchQuery.trim() ? searchResults : recommendedSongs;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#181818] w-full max-w-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden max-h-[85vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <Music className="text-[#1DB954]" size={24} />
                        {step === 'details' ? 'Create Playlist' : 'Add Songs'}
                    </h2>
                    <button onClick={step === 'songs' ? handleFinish : onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {step === 'details' ? (
                    <form onSubmit={handleCreatePlaylist} className="p-6 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                                Playlist Title *
                            </Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. My Summer Vibes"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-[#1DB954] focus:ring-[#1DB954]"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                                Description (Optional)
                            </Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Tell us about this playlist..."
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-[#1DB954] focus:ring-[#1DB954] min-h-[100px] resize-none"
                            />
                        </div>

                        <div className="pt-2 flex gap-3">
                            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 text-white hover:bg-white/5 font-bold">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="flex-1 bg-[#1DB954] text-black hover:bg-[#1ed760] font-black tracking-tight">
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <span className="flex items-center gap-1">Next <ArrowRight size={16} /></span>
                                )}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="flex flex-col flex-1 min-h-0">
                        <div className="p-4 border-b border-white/5 shrink-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for songs to add..."
                                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-[#1DB954] focus:ring-[#1DB954]"
                                    autoFocus
                                />
                            </div>
                            {!searchQuery.trim() && (
                                <p className="text-xs text-gray-500 mt-2">Recommended songs — tap + to add</p>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-2">
                            {loadingSongs ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="animate-spin text-[#1DB954]" size={24} />
                                </div>
                            ) : songsToShow.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-8">
                                    {searchQuery.trim() ? 'No songs found' : 'No songs available yet'}
                                </p>
                            ) : (
                                songsToShow.map(song => {
                                    const isAdded = addedSongIds.has(song.id);
                                    return (
                                        <div key={song.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition">
                                            <div className="w-10 h-10 rounded bg-white/10 overflow-hidden shrink-0">
                                                {song.cover_url ? (
                                                    <img src={song.cover_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Music size={16} className="text-gray-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm font-medium truncate">{song.title}</p>
                                                <p className="text-gray-500 text-xs truncate">{song.artists?.name || 'Unknown Artist'}</p>
                                            </div>
                                            <button
                                                onClick={() => addSongToPlaylist(song.id)}
                                                disabled={isAdded}
                                                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition ${
                                                    isAdded
                                                        ? 'bg-[#1DB954] text-black'
                                                        : 'bg-white/10 text-white hover:bg-white/20'
                                                }`}
                                            >
                                                {isAdded ? <Check size={14} /> : <Plus size={14} />}
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="p-4 border-t border-white/5 shrink-0">
                            <Button onClick={handleFinish} className="w-full bg-[#1DB954] text-black hover:bg-[#1ed760] font-black">
                                Done ({addedSongIds.size} song{addedSongIds.size !== 1 ? 's' : ''} added)
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
