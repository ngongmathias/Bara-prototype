import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Image, Loader2, ArrowLeft, Disc, CheckCircle } from 'lucide-react';

const ALBUM_TYPES = ['Album', 'EP', 'Single', 'Mixtape', 'Compilation'];

export default function CreateAlbumPage() {
    const { user } = useUser();
    const navigate = useNavigate();
    const { toast } = useToast();
    const coverInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [albumType, setAlbumType] = useState('Album');
    const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);

    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const [saving, setSaving] = useState(false);
    const [artistId, setArtistId] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) return;

        const fetchArtist = async () => {
            const { data: artist } = await supabase
                .from('artists')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (artist) setArtistId(artist.id);
        };

        fetchArtist();
    }, [user?.id]);

    const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast({ title: 'Invalid file', description: 'Please upload an image file.', variant: 'destructive' });
            return;
        }
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id || !title.trim()) {
            toast({ title: 'Missing fields', description: 'Please enter an album title.', variant: 'destructive' });
            return;
        }

        setSaving(true);

        try {
            let currentArtistId = artistId;

            // Auto-create artist profile if none exists
            if (!currentArtistId) {
                const { data: newArtist, error: artistError } = await supabase
                    .from('artists')
                    .insert({
                        name: user.fullName || user.firstName || 'Unknown Artist',
                        user_id: user.id,
                        image_url: user.imageUrl || '',
                        is_verified: false,
                    })
                    .select('id')
                    .single();

                if (artistError) throw artistError;
                currentArtistId = newArtist.id;
                setArtistId(currentArtistId);
            }

            // Upload cover art if provided
            let coverUrl = '';
            if (coverFile) {
                const coverExt = coverFile.name.split('.').pop() || 'jpg';
                const coverPath = `covers/${user.id}/album_${Date.now()}.${coverExt}`;
                const { error: coverUploadError } = await supabase.storage
                    .from('music')
                    .upload(coverPath, coverFile, { contentType: coverFile.type });

                if (coverUploadError) throw coverUploadError;
                const { data: coverUrlData } = supabase.storage.from('music').getPublicUrl(coverPath);
                coverUrl = coverUrlData.publicUrl;
            }

            // Insert album
            const { error: insertError } = await supabase
                .from('albums')
                .insert({
                    title: title.trim(),
                    artist_id: currentArtistId,
                    cover_url: coverUrl || null,
                    release_date: releaseDate,
                    album_type: albumType,
                    description: description.trim() || null,
                });

            if (insertError) throw insertError;

            toast({ title: 'Album created!', description: `"${title}" has been created. You can now add tracks to it.` });
            setTimeout(() => navigate('/streams/creator'), 1000);

        } catch (error: any) {
            console.error('Error creating album:', error);
            toast({ title: 'Error', description: error.message || 'Failed to create album.', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <StreamsLayout>
            <div className="min-h-screen p-6 sm:p-8 pb-32 max-w-3xl mx-auto">
                {/* Back button */}
                <button onClick={() => navigate('/streams/creator')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={20} />
                    <span className="text-sm font-bold">Back to Creator Portal</span>
                </button>

                <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Create Album</h1>
                <p className="text-gray-400 mb-8">Organize your tracks into an album, EP, or mixtape.</p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Cover Art */}
                    <div className="space-y-2">
                        <Label className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Album Cover</Label>
                        <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" />
                        <div className="flex items-start gap-6">
                            <div
                                onClick={() => coverInputRef.current?.click()}
                                className="w-48 h-48 rounded-lg border-2 border-dashed border-gray-700 hover:border-gray-500 bg-white/5 flex items-center justify-center cursor-pointer transition-all overflow-hidden flex-shrink-0"
                            >
                                {coverPreview ? (
                                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center">
                                        <Image className="text-gray-500 mx-auto mb-2" size={40} />
                                        <p className="text-gray-500 text-xs font-bold">Click to upload</p>
                                    </div>
                                )}
                            </div>
                            <div className="pt-4">
                                <p className="text-gray-400 text-sm mb-1">Upload album cover art.</p>
                                <p className="text-gray-500 text-xs">Recommended: 1000×1000px, JPG or PNG</p>
                                {coverFile && (
                                    <div className="flex items-center gap-2 mt-3 text-[#1DB954]">
                                        <CheckCircle size={16} />
                                        <span className="text-sm font-bold">{coverFile.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Album Title *</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter album title"
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-[#1DB954] focus:ring-[#1DB954] h-12"
                            required
                        />
                    </div>

                    {/* Album Type */}
                    <div className="space-y-2">
                        <Label className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Type</Label>
                        <Select value={albumType} onValueChange={setAlbumType}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white h-12">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#282828] border-white/10">
                                {ALBUM_TYPES.map((t) => (
                                    <SelectItem key={t} value={t} className="text-white hover:bg-white/10">{t}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Release Date */}
                    <div className="space-y-2">
                        <Label className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Release Date</Label>
                        <Input
                            type="date"
                            value={releaseDate}
                            onChange={(e) => setReleaseDate(e.target.value)}
                            className="bg-white/5 border-white/10 text-white h-12 [color-scheme:dark]"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Description (Optional)</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Tell listeners about this album..."
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-[#1DB954] focus:ring-[#1DB954] min-h-[100px] resize-none"
                        />
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={saving || !title.trim()}
                        className="w-full h-14 bg-[#1DB954] text-black hover:bg-[#1ed760] font-black text-lg rounded-xl disabled:opacity-50"
                    >
                        {saving ? (
                            <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={20} /> Creating...</span>
                        ) : (
                            <span className="flex items-center gap-2"><Disc size={20} /> Create Album</span>
                        )}
                    </Button>
                </form>
            </div>
        </StreamsLayout>
    );
}
