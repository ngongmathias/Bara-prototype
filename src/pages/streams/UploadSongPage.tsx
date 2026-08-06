import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { useAuthedSupabase } from '@/hooks/useAuthedSupabase';
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
import { uploadToMusicWithProgress } from '@/lib/uploadWithProgress';
import { PAID_MUSIC_ENABLED } from '@/lib/features';

const GENRES = [
    'Afrobeats', 'Amapiano', 'Highlife', 'Afropop', 'Bongo Flava',
    'Gengetone', 'Gqom', 'Kwaito', 'Jùjú', 'Fuji',
    'Soukous', 'Rumba', 'Mbalax', 'Hiplife', 'Azonto',
    'Afro-Soul', 'Gospel', 'R&B', 'Hip Hop', 'Dancehall',
    'Reggae', 'Jazz', 'Classical', 'Electronic', 'Pop', 'Other'
];

export default function UploadSongPage() {
    const { user } = useUser();
    const { getClient } = useAuthedSupabase();
    const navigate = useNavigate();
    const { toast } = useToast();
    const audioInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('');
    const [description, setDescription] = useState('');
    const [lyrics, setLyrics] = useState('');
    const [albumId, setAlbumId] = useState<string>('');
    const [albums, setAlbums] = useState<any[]>([]);
    const [producer, setProducer] = useState('');
    const [songwriter, setSongwriter] = useState('');
    const [featuredIds, setFeaturedIds] = useState<string[]>([]);
    const [allArtists, setAllArtists] = useState<{ id: string; name: string }[]>([]);

    const [price, setPrice] = useState<string>('');
    const [releaseOption, setReleaseOption] = useState<'now' | 'draft' | 'scheduled'>('now');
    const [scheduledDate, setScheduledDate] = useState<string>('');
    const [rightsAccepted, setRightsAccepted] = useState(false);
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

            // All artists (for crediting featured artists)
            const { data: artistsList } = await supabase.from('artists').select('id, name').order('name');
            setAllArtists(artistsList || []);
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
        // 27.8.8 — rights declaration is mandatory before anything uploads.
        if (!rightsAccepted) {
            toast({ title: 'Rights confirmation required', description: 'Please confirm you own the rights to this content before uploading.', variant: 'destructive' });
            return;
        }
        if (releaseOption === 'scheduled' && !scheduledDate) {
            toast({ title: 'Pick a release date', description: 'Choose when this should go live, or switch to "Publish now".', variant: 'destructive' });
            return;
        }

        setUploading(true);
        setUploadProgress(10);

        // Tracked outside the try so the catch block can clean up any file
        // that made it to storage before a later step (e.g. the DB insert)
        // failed — previously those were left orphaned forever.
        let uploadedAudioPath: string | null = null;
        let uploadedCoverPath: string | null = null;
        let insertedSongId: string | null = null;
        const client = await getClient();

        try {
            let currentArtistId = artistId;

            // Auto-create artist profile if none exists. artists.user_id is
            // UNIQUE, so a race (e.g. two tabs uploading before artistId
            // state settles) surfaces as a 23505 conflict here instead of
            // silently creating a second artist row for the same person —
            // recover by fetching the row the other request just created.
            if (!currentArtistId) {
                const { data: newArtist, error: artistError } = await client
                    .from('artists')
                    .insert({
                        name: user.fullName || user.firstName || 'Unknown Artist',
                        user_id: user.id,
                        image_url: user.imageUrl || '',
                        is_verified: false,
                    })
                    .select('id')
                    .single();

                if (artistError) {
                    if (artistError.code === '23505') {
                        const { data: existing, error: fetchError } = await client
                            .from('artists')
                            .select('id')
                            .eq('user_id', user.id)
                            .single();
                        if (fetchError || !existing) throw artistError;
                        currentArtistId = existing.id;
                    } else {
                        throw artistError;
                    }
                } else {
                    currentArtistId = newArtist.id;
                }
                setArtistId(currentArtistId);
            }

            setUploadProgress(10);

            // Upload audio file with REAL progress (maps to 10%→80% of the bar).
            const audioExt = audioFile.name.split('.').pop() || 'mp3';
            const audioPath = `songs/${user.id}/${Date.now()}.${audioExt}`;
            const fileUrl = await uploadToMusicWithProgress(audioPath, audioFile, (f) => {
                setUploadProgress(10 + Math.round(f * 70));
            }, client);
            uploadedAudioPath = audioPath;

            setUploadProgress(82);

            // Upload cover art if provided
            let coverUrl = '';
            if (coverFile) {
                const coverExt = coverFile.name.split('.').pop() || 'jpg';
                const coverPath = `covers/${user.id}/${Date.now()}.${coverExt}`;
                coverUrl = await uploadToMusicWithProgress(coverPath, coverFile, () => {}, client);
                uploadedCoverPath = coverPath;
            }

            setUploadProgress(88);

            // If this song is going straight into an album, give it the next
            // track number so it doesn't land as an unordered NULL until
            // someone visits Edit Album to fix it.
            let nextTrackNumber: number | null = null;
            if (albumId) {
                const { data: existingTracks } = await client
                    .from('songs')
                    .select('track_number')
                    .eq('album_id', albumId)
                    .order('track_number', { ascending: false, nullsFirst: false })
                    .limit(1);
                nextTrackNumber = (existingTracks?.[0]?.track_number || 0) + 1;
            }

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
            const { data: insertedSong, error: insertError } = await client
                .from('songs')
                .insert({
                    title: title.trim(),
                    artist_id: currentArtistId,
                    album_id: albumId || null,
                    track_number: nextTrackNumber,
                    file_url: fileUrl,
                    cover_url: coverUrl || null,
                    genre: genre || null,
                    duration: duration || null,
                    plays: 0,
                    price: price ? parseFloat(price) : null,
                    lyrics: lyrics.trim() || null,
                    description: description.trim() || null,
                    producer: producer.trim() || null,
                    songwriter: songwriter.trim() || null,
                    rights_accepted_at: new Date().toISOString(),
                    status: releaseOption === 'draft' ? 'draft' : 'published',
                    release_date: releaseOption === 'scheduled' && scheduledDate ? new Date(scheduledDate).toISOString() : null,
                })
                .select('id')
                .single();

            if (insertError) throw insertError;
            insertedSongId = insertedSong.id;

            // Credits: primary + featured artists (best-effort, like the admin flow).
            try {
                const entries = [
                    { song_id: insertedSong.id, artist_id: currentArtistId, role: 'primary', display_order: 0 },
                    ...featuredIds.map((aid, i) => ({ song_id: insertedSong.id, artist_id: aid, role: 'featured', display_order: i + 1 })),
                ];
                await client.from('song_artists').upsert(entries, { onConflict: 'song_id,artist_id,role' });
            } catch { /* credits are non-critical */ }

            setUploadProgress(100);

            const authorEmail = user?.primaryEmailAddress?.emailAddress;
            if (authorEmail) {
                supabase.from('email_queue').insert({
                    to_email: authorEmail,
                    subject: `"${title}" is now live on Bara Streams`,
                    metadata: {
                        type: 'song_uploaded',
                        data: {
                            artistName: user?.firstName ?? user?.fullName ?? 'Artist',
                            songTitle: title,
                            songId: insertedSong?.id ?? '',
                            coverUrl: coverUrl || undefined,
                        },
                    },
                }).then(({ error }) => { if (error) console.error(error); });
            }

            toast({ title: 'Upload complete!', description: `"${title}" has been uploaded successfully.` });
            setTimeout(() => navigate('/streams/creator'), 1500);

        } catch (error: any) {
            console.error('Upload error:', error);
            // Files reached storage but the song row never got created —
            // don't leave them orphaned.
            if (!insertedSongId) {
                const orphaned = [uploadedAudioPath, uploadedCoverPath].filter((p): p is string => !!p);
                if (orphaned.length > 0) {
                    client.storage.from('music').remove(orphaned).catch(() => {});
                }
            }
            toast({ title: 'Upload failed', description: error.message || 'Something went wrong. Please try again.', variant: 'destructive' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <StreamsLayout>
            <div className="min-h-screen p-6 sm:p-8 pb-32 max-w-3xl mx-auto">
                {/* Back button */}
                <button onClick={() => navigate('/streams/creator')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                    <ArrowLeft size={20} />
                    <span className="text-sm font-bold">Back to Creator Portal</span>
                </button>

                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">Upload Music</h1>
                <p className="text-gray-500 mb-8">Share your music with the world on Bara Streams.</p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Audio File */}
                    <div className="space-y-2">
                        <Label className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Audio File *</Label>
                        <input ref={audioInputRef} type="file" accept="audio/*,.mp3,.wav,.ogg,.flac,.aac,.m4a" onChange={handleAudioSelect} className="hidden" />
                        <div
                            onClick={() => audioInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${audioFile ? 'border-gray-900 bg-gray-900/5' : 'border-gray-700 hover:border-gray-500 bg-gray-50'}`}
                        >
                            {audioFile ? (
                                <div className="flex items-center justify-center gap-3">
                                    <CheckCircle className="text-gray-900" size={24} />
                                    <div>
                                        <p className="text-gray-900 font-bold">{audioFile.name}</p>
                                        <p className="text-gray-500 text-sm">{(audioFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <Upload className="mx-auto mb-3 text-gray-500" size={32} />
                                    <p className="text-gray-900 font-bold mb-1">Click to select an audio file</p>
                                    <p className="text-gray-500 text-sm">MP3, WAV, OGG, FLAC, AAC — up to 50MB</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cover Art */}
                    <div className="space-y-2">
                        <Label className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Cover Art (Optional)</Label>
                        <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" />
                        <div className="flex items-start gap-4">
                            <div
                                onClick={() => coverInputRef.current?.click()}
                                className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-700 hover:border-gray-500 bg-gray-50 flex items-center justify-center cursor-pointer transition-all overflow-hidden flex-shrink-0"
                            >
                                {coverPreview ? (
                                    <img loading="lazy" src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                                ) : (
                                    <Image className="text-gray-500" size={32} />
                                )}
                            </div>
                            <div className="pt-2">
                                <p className="text-gray-500 text-sm">Upload album art for your track.</p>
                                <p className="text-gray-500 text-xs mt-1">Recommended: 1000×1000px, JPG or PNG</p>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Track Title *</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter track title"
                            className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-600 focus:border-gray-900 focus:ring-gray-900 h-12"
                            required
                        />
                    </div>

                    {/* Genre */}
                    <div className="space-y-2">
                        <Label className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Genre</Label>
                        <Select value={genre} onValueChange={setGenre}>
                            <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 h-12">
                                <SelectValue placeholder="Select a genre" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-50 border-gray-200">
                                {GENRES.map((g) => (
                                    <SelectItem key={g} value={g} className="text-gray-900 hover:bg-gray-100">{g}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Album */}
                    {albums.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Add to Album (Optional)</Label>
                            <Select value={albumId} onValueChange={setAlbumId}>
                                <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 h-12">
                                    <SelectValue placeholder="Release as single" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-50 border-gray-200">
                                    <SelectItem value="" className="text-gray-900 hover:bg-gray-100">Release as Single</SelectItem>
                                    {albums.map((album) => (
                                        <SelectItem key={album.id} value={album.id} className="text-gray-900 hover:bg-gray-100">{album.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Featured Artists */}
                    <div className="space-y-2">
                        <Label className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Featured Artists (Optional)</Label>
                        {featuredIds.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {featuredIds.map((aid) => {
                                    const a = allArtists.find((x) => x.id === aid);
                                    return a ? (
                                        <span key={aid} className="bg-gray-100 text-sm px-3 py-1 rounded-full flex items-center gap-1.5">
                                            {a.name}
                                            <button type="button" onClick={() => setFeaturedIds((p) => p.filter((id) => id !== aid))} className="text-gray-400 hover:text-gray-900">&times;</button>
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        )}
                        <select
                            value=""
                            onChange={(e) => { const v = e.target.value; if (v && v !== artistId && !featuredIds.includes(v)) setFeaturedIds((p) => [...p, v]); }}
                            className="w-full h-12 rounded-md bg-gray-50 border border-gray-200 px-3 text-gray-900 text-sm focus:border-gray-900 focus:outline-none"
                        >
                            <option value="">Add a featured artist…</option>
                            {allArtists.filter((a) => a.id !== artistId && !featuredIds.includes(a.id)).map((a) => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Producer / Songwriter */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Producer (Optional)</Label>
                            <Input value={producer} onChange={(e) => setProducer(e.target.value)} placeholder="e.g. Don Jazzy" className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-600 focus:border-gray-900 focus:ring-gray-900 h-12" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Songwriter (Optional)</Label>
                            <Input value={songwriter} onChange={(e) => setSongwriter(e.target.value)} placeholder="e.g. Tiwa Savage" className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-600 focus:border-gray-900 focus:ring-gray-900 h-12" />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Description (Optional)</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Tell listeners about this track..."
                            className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-600 focus:border-gray-900 focus:ring-gray-900 min-h-[100px] resize-none"
                        />
                    </div>

                    {/* Lyrics */}
                    <div className="space-y-2">
                        <Label className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Lyrics (Optional)</Label>
                        <Textarea
                            value={lyrics}
                            onChange={(e) => setLyrics(e.target.value)}
                            placeholder={"Paste lyrics here, one line per verse...\n\nTip: prefix each line with a [mm:ss] timestamp for karaoke-style synced lyrics, e.g.\n[00:12] First line\n[00:18] Second line"}
                            className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-600 focus:border-gray-900 focus:ring-gray-900 min-h-[180px] resize-y font-mono text-sm"
                        />
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                            Optional: start each line with a <span className="font-mono text-gray-700">[mm:ss]</span> timestamp
                            (e.g. <span className="font-mono text-gray-700">[01:23]</span>) and lyrics will scroll &amp; highlight
                            in time with the song. Lines without timestamps display as plain text.
                        </p>
                    </div>

                    {/* Price — hidden while paid music is deferred (all songs are free) */}
                    {PAID_MUSIC_ENABLED && (
                        <div className="space-y-2">
                            <Label className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Price (Optional)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0.00 (free)"
                                    className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-600 focus:border-gray-900 focus:ring-gray-900 h-12 pl-8"
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                Leave empty or set to 0 for free streaming. Set a price and listeners will hear a 25-second preview before purchasing.
                            </p>
                        </div>
                    )}

                    {/* Publish timing */}
                    <div className="space-y-2">
                        <Label className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Release</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {([
                                { value: 'now', label: 'Publish now' },
                                { value: 'draft', label: 'Save as draft' },
                                { value: 'scheduled', label: 'Schedule' },
                            ] as const).map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setReleaseOption(opt.value)}
                                    className={`py-2.5 rounded-lg text-sm font-bold border-2 transition ${
                                        releaseOption === opt.value
                                            ? 'border-gray-900 bg-gray-900 text-white'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-400'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        {releaseOption === 'draft' && (
                            <p className="text-xs text-gray-500">Only you can see this until you publish it.</p>
                        )}
                        {releaseOption === 'scheduled' && (
                            <div className="pt-1">
                                <Input
                                    type="datetime-local"
                                    value={scheduledDate}
                                    min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    className="bg-gray-50 border-gray-200 text-gray-900 focus:border-gray-900 focus:ring-gray-900 h-12"
                                />
                                <p className="text-xs text-gray-500 mt-1">Hidden from listeners until this date/time.</p>
                            </div>
                        )}
                    </div>

                    {/* Rights declaration (27.8.8) */}
                    <div className="space-y-3 border border-gray-200 rounded-xl p-4 bg-gray-50">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rightsAccepted}
                                onChange={(e) => setRightsAccepted(e.target.checked)}
                                className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-400 accent-black"
                            />
                            <span className="text-sm text-gray-700 leading-relaxed">
                                I confirm I own all rights to this content or am licensed to distribute it,
                                and I accept the{' '}
                                <a href="/content-terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-900 underline">
                                    BARA Afrika Content Terms
                                </a>. *
                            </span>
                        </label>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                            By uploading you warrant the content is yours or licensed to you, grant BARA Afrika a
                            license to host and stream it, and accept liability for infringement. See our{' '}
                            <a href="/streams/guidelines" target="_blank" rel="noopener noreferrer" className="underline text-gray-700">
                                content guidelines
                            </a>{' '}
                            for what's allowed — rights holders can request takedowns via our{' '}
                            <a href="/dmca" target="_blank" rel="noopener noreferrer" className="underline text-gray-700">
                                DMCA form
                            </a>.
                        </p>
                    </div>

                    {/* Upload Progress */}
                    {uploading && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-bold">Uploading...</span>
                                <span className="text-gray-900 font-bold">{uploadProgress}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gray-900 rounded-full transition-all duration-500"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={uploading || !audioFile || !title.trim() || !rightsAccepted}
                        className="w-full h-14 bg-gray-900 text-white hover:bg-black font-black text-lg rounded-xl disabled:opacity-50"
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
