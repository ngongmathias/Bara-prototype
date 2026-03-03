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
import { Upload, Music, Image, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

const GENRES = [
    'Afrobeats', 'Amapiano', 'Highlife', 'Afropop', 'Bongo Flava',
    'Gengetone', 'Gqom', 'Kwaito', 'Jùjú', 'Fuji',
    'Soukous', 'Rumba', 'Mbalax', 'Hiplife', 'Azonto',
    'Afro-Soul', 'Gospel', 'R&B', 'Hip Hop', 'Dancehall',
    'Reggae', 'Jazz', 'Classical', 'Electronic', 'Pop', 'Other'
];

export default function UploadSongPage() {
    const { user } = useUser();
    const navigate = useNavigate();
    const { toast } = useToast();
    const audioInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('');
    const [description, setDescription] = useState('');
    const [albumId, setAlbumId] = useState<string>('');
    const [albums, setAlbums] = useState<any[]>([]);

    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [artistId, setArtistId] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) return;

        const fetchArtistData = async () => {
            // Check if user has an artist profile
            const { data: artist } = await supabase
                .from('artists')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (artist) {
                setArtistId(artist.id);
                // Fetch their albums
                const { data: albumsData } = await supabase
                    .from('albums')
                    .select('id, title')
                    .eq('artist_id', artist.id)
                    .order('created_at', { ascending: false });
                setAlbums(albumsData || []);
            }
        };

        fetchArtistData();
    }, [user?.id]);

    const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac', 'audio/m4a', 'audio/x-m4a'];
        if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|flac|aac|m4a)$/i)) {
            toast({ title: 'Invalid file', description: 'Please upload an MP3, WAV, OGG, FLAC, or AAC file.', variant: 'destructive' });
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            toast({ title: 'File too large', description: 'Audio files must be under 50MB.', variant: 'destructive' });
            return;
        }
        setAudioFile(file);
    };

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
        if (!user?.id || !audioFile || !title.trim()) {
            toast({ title: 'Missing fields', description: 'Please fill in the title and select an audio file.', variant: 'destructive' });
            return;
        }

        setUploading(true);
        setUploadProgress(10);

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

            setUploadProgress(30);

            // Upload audio file
            const audioExt = audioFile.name.split('.').pop() || 'mp3';
            const audioPath = `songs/${user.id}/${Date.now()}.${audioExt}`;
            const { error: audioUploadError } = await supabase.storage
                .from('music')
                .upload(audioPath, audioFile, { contentType: audioFile.type });

            if (audioUploadError) throw audioUploadError;

            const { data: audioUrlData } = supabase.storage.from('music').getPublicUrl(audioPath);
            const fileUrl = audioUrlData.publicUrl;

            setUploadProgress(60);

            // Upload cover art if provided
            let coverUrl = '';
            if (coverFile) {
                const coverExt = coverFile.name.split('.').pop() || 'jpg';
                const coverPath = `covers/${user.id}/${Date.now()}.${coverExt}`;
                const { error: coverUploadError } = await supabase.storage
                    .from('music')
                    .upload(coverPath, coverFile, { contentType: coverFile.type });

                if (coverUploadError) throw coverUploadError;
                const { data: coverUrlData } = supabase.storage.from('music').getPublicUrl(coverPath);
                coverUrl = coverUrlData.publicUrl;
            }

            setUploadProgress(80);

            // Get audio duration
            let duration = 0;
            try {
                const audio = new Audio(fileUrl);
                await new Promise<void>((resolve) => {
                    audio.addEventListener('loadedmetadata', () => {
                        duration = Math.round(audio.duration);
                        resolve();
                    });
                    audio.addEventListener('error', () => resolve());
                    setTimeout(resolve, 5000);
                });
            } catch {
                // Duration detection is non-critical
            }

            // Insert song record
            const { error: insertError } = await supabase
                .from('songs')
                .insert({
                    title: title.trim(),
                    artist_id: currentArtistId,
                    album_id: albumId || null,
                    file_url: fileUrl,
                    cover_url: coverUrl || null,
                    genre: genre || null,
                    duration: duration || null,
                    plays: 0,
                });

            if (insertError) throw insertError;

            setUploadProgress(100);

            toast({ title: 'Upload complete!', description: `"${title}" has been uploaded successfully.` });
            setTimeout(() => navigate('/streams/creator'), 1500);

        } catch (error: any) {
            console.error('Upload error:', error);
            toast({ title: 'Upload failed', description: error.message || 'Something went wrong. Please try again.', variant: 'destructive' });
        } finally {
            setUploading(false);
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

                <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Upload Music</h1>
                <p className="text-gray-400 mb-8">Share your music with the world on Bara Streams.</p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Audio File */}
                    <div className="space-y-2">
                        <Label className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Audio File *</Label>
                        <input ref={audioInputRef} type="file" accept="audio/*,.mp3,.wav,.ogg,.flac,.aac,.m4a" onChange={handleAudioSelect} className="hidden" />
                        <div
                            onClick={() => audioInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${audioFile ? 'border-[#1DB954] bg-[#1DB954]/5' : 'border-gray-700 hover:border-gray-500 bg-white/5'}`}
                        >
                            {audioFile ? (
                                <div className="flex items-center justify-center gap-3">
                                    <CheckCircle className="text-[#1DB954]" size={24} />
                                    <div>
                                        <p className="text-white font-bold">{audioFile.name}</p>
                                        <p className="text-gray-400 text-sm">{(audioFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <Upload className="mx-auto mb-3 text-gray-500" size={32} />
                                    <p className="text-white font-bold mb-1">Click to select an audio file</p>
                                    <p className="text-gray-500 text-sm">MP3, WAV, OGG, FLAC, AAC — up to 50MB</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cover Art */}
                    <div className="space-y-2">
                        <Label className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Cover Art (Optional)</Label>
                        <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" />
                        <div className="flex items-start gap-4">
                            <div
                                onClick={() => coverInputRef.current?.click()}
                                className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-700 hover:border-gray-500 bg-white/5 flex items-center justify-center cursor-pointer transition-all overflow-hidden flex-shrink-0"
                            >
                                {coverPreview ? (
                                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                                ) : (
                                    <Image className="text-gray-500" size={32} />
                                )}
                            </div>
                            <div className="pt-2">
                                <p className="text-gray-400 text-sm">Upload album art for your track.</p>
                                <p className="text-gray-500 text-xs mt-1">Recommended: 1000×1000px, JPG or PNG</p>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Track Title *</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter track title"
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-[#1DB954] focus:ring-[#1DB954] h-12"
                            required
                        />
                    </div>

                    {/* Genre */}
                    <div className="space-y-2">
                        <Label className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Genre</Label>
                        <Select value={genre} onValueChange={setGenre}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white h-12">
                                <SelectValue placeholder="Select a genre" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#282828] border-white/10">
                                {GENRES.map((g) => (
                                    <SelectItem key={g} value={g} className="text-white hover:bg-white/10">{g}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Album */}
                    {albums.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Add to Album (Optional)</Label>
                            <Select value={albumId} onValueChange={setAlbumId}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white h-12">
                                    <SelectValue placeholder="Release as single" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#282828] border-white/10">
                                    <SelectItem value="" className="text-white hover:bg-white/10">Release as Single</SelectItem>
                                    {albums.map((album) => (
                                        <SelectItem key={album.id} value={album.id} className="text-white hover:bg-white/10">{album.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Description */}
                    <div className="space-y-2">
                        <Label className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Description (Optional)</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Tell listeners about this track..."
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-[#1DB954] focus:ring-[#1DB954] min-h-[100px] resize-none"
                        />
                    </div>

                    {/* Upload Progress */}
                    {uploading && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400 font-bold">Uploading...</span>
                                <span className="text-[#1DB954] font-bold">{uploadProgress}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#1DB954] rounded-full transition-all duration-500"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={uploading || !audioFile || !title.trim()}
                        className="w-full h-14 bg-[#1DB954] text-black hover:bg-[#1ed760] font-black text-lg rounded-xl disabled:opacity-50"
                    >
                        {uploading ? (
                            <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={20} /> Uploading...</span>
                        ) : (
                            <span className="flex items-center gap-2"><Music size={20} /> Upload Track</span>
                        )}
                    </Button>
                </form>
            </div>
        </StreamsLayout>
    );
}
