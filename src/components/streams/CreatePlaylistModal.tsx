import React, { useState } from 'react';
import { X, Loader2, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

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

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast({
                title: 'Error',
                description: 'Please provide a title for your playlist.',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { error } = await supabase
                .from('playlists')
                .insert({
                    title: title.trim(),
                    description: description.trim(),
                    user_id: user.id,
                    is_public: true, // Default to true for now
                });

            if (error) throw error;

            toast({
                title: 'Success',
                description: 'Playlist created successfully!',
            });

            setTitle('');
            setDescription('');
            onSuccess?.();
            onClose();
        } catch (error: any) {
            console.error('Error creating playlist:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to create playlist.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#181818] w-full max-w-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <Music className="text-[#1DB954]" size={24} />
                        Create Playlist
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 text-white hover:bg-white/5 font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-[#1DB954] text-black hover:bg-[#1ed760] font-black tracking-tight"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
