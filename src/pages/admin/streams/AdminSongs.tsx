import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    Edit,
    Trash2,
    Music,
    Upload,
    Loader2,
    Play,
    Pause
} from "lucide-react";
import { db, supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Song {
    id: string;
    title: string;
    artist_id: string;
    album_id: string | null;
    file_url: string;
    cover_url: string | null;
    duration: number;
    plays: number;
    artists?: { name: string };
    albums?: { title: string };
}

interface Artist {
    id: string;
    name: string;
}

interface Album {
    id: string;
    title: string;
    artist_id: string;
}

export const AdminSongs = () => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSong, setEditingSong] = useState<Song | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { toast } = useToast();

    // Form State
    const [formData, setFormData] = useState<Partial<Song>>({
        title: "",
        artist_id: "",
        album_id: "",
        file_url: "",
        cover_url: "",
        duration: 0
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [songsRes, artistsRes, albumsRes] = await Promise.all([
                db.songs().select('*, artists(name), albums(title)').order('created_at', { ascending: false }),
                db.artists().select('id, name').order('name'),
                db.albums().select('id, title, artist_id').order('title')
            ]);

            if (songsRes.error) throw songsRes.error;
            if (artistsRes.error) throw artistsRes.error;
            if (albumsRes.error) throw albumsRes.error;

            setSongs(songsRes.data || []);
            setArtists(artistsRes.data || []);
            setAlbums(albumsRes.data || []);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);

            // Calculate duration
            const audio = new Audio();
            audio.src = URL.createObjectURL(file);
            audio.onloadedmetadata = () => {
                setFormData(prev => ({ ...prev, duration: Math.round(audio.duration) }));
                toast({ title: "Metadata loaded", description: `Duration: ${Math.floor(audio.duration / 60)}:${Math.round(audio.duration % 60).toString().padStart(2, '0')}` });
            };
        }
    };

    const handleUpload = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `tracks/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('music-files')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('music-files')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const handleSave = async () => {
        try {
            if (!formData.title || !formData.artist_id) {
                toast({ title: "Error", description: "Title and Artist are required", variant: "destructive" });
                return;
            }

            setUploading(true);
            let finalFileUrl = formData.file_url;

            if (selectedFile) {
                finalFileUrl = await handleUpload(selectedFile);
            }

            if (!finalFileUrl) {
                toast({ title: "Error", description: "Audio file is required", variant: "destructive" });
                return;
            }

            const songData = {
                ...formData,
                file_url: finalFileUrl,
                album_id: formData.album_id === "none" ? null : formData.album_id
            };

            if (editingSong) {
                const { error } = await db.songs()
                    .update(songData)
                    .eq('id', editingSong.id);
                if (error) throw error;
                toast({ title: "Success", description: "Song updated" });
            } else {
                const { error } = await db.songs()
                    .insert(songData);
                if (error) throw error;
                toast({ title: "Success", description: "Song created" });
            }

            setIsDialogOpen(false);
            fetchInitialData();
            resetForm();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to save song", variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, fileUrl: string) => {
        if (!confirm("Are you sure you want to delete this track?")) return;
        try {
            // Delete from DB
            const { error: dbError } = await db.songs().delete().eq('id', id);
            if (dbError) throw dbError;

            // Optional: Delete from storage if it's a supabase URL
            if (fileUrl.includes('music-files')) {
                const fileName = fileUrl.split('/').pop();
                if (fileName) {
                    await supabase.storage.from('music-files').remove([`tracks/${fileName}`]);
                }
            }

            toast({ title: "Success", description: "Song deleted" });
            fetchInitialData();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to delete song", variant: "destructive" });
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            artist_id: "",
            album_id: "",
            file_url: "",
            cover_url: "",
            duration: 0
        });
        setEditingSong(null);
        setSelectedFile(null);
    };

    const openEdit = (song: Song) => {
        setEditingSong(song);
        setFormData({
            title: song.title,
            artist_id: song.artist_id,
            album_id: song.album_id || "none",
            file_url: song.file_url,
            cover_url: song.cover_url || "",
            duration: song.duration
        });
        setIsDialogOpen(true);
    };

    const togglePlay = (url: string, id: string) => {
        if (isPlaying === id) {
            audioRef.current?.pause();
            setIsPlaying(null);
        } else {
            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.play();
                setIsPlaying(id);
            }
        }
    };

    const filteredSongs = songs.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.artists?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout title="Songs" subtitle="Manage music tracks and uploads">
            <div className="p-6 space-y-6">
                <audio ref={audioRef} onEnded={() => setIsPlaying(null)} />

                <div className="flex justify-between items-center">
                    <div className="relative w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search songs or artists..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button className="bg-brand-blue">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Song
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>{editingSong ? 'Edit Song' : 'Add New Song'}</DialogTitle>
                                <DialogDescription>
                                    Upload music and manage track metadata.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Track Title</Label>
                                    <Input
                                        value={formData.title || ''}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Blinding Lights"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Artist</Label>
                                        <Select
                                            value={formData.artist_id}
                                            onValueChange={(val) => setFormData({ ...formData, artist_id: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Artist" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {artists.map(a => (
                                                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Album (Optional)</Label>
                                        <Select
                                            value={formData.album_id || "none"}
                                            onValueChange={(val) => setFormData({ ...formData, album_id: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Album" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No Album (Single)</SelectItem>
                                                {albums.filter(alb => alb.artist_id === formData.artist_id).map(a => (
                                                    <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Audio File (.mp3)</Label>
                                    <Input
                                        type="file"
                                        accept="audio/mp3,audio/wav"
                                        onChange={handleFileChange}
                                        className="cursor-pointer"
                                    />
                                    {editingSong && !selectedFile && (
                                        <p className="text-xs text-gray-500">Keep empty to maintain current file</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Cover Art URL (Optional)</Label>
                                    <Input
                                        value={formData.cover_url || ''}
                                        onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={uploading}>Cancel</Button>
                                <Button onClick={handleSave} className="bg-brand-blue" disabled={uploading}>
                                    {uploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {selectedFile ? 'Uploading...' : 'Saving...'}
                                        </>
                                    ) : 'Save Song'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-md border bg-white overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12"></TableHead>
                                <TableHead>Track</TableHead>
                                <TableHead>Artist</TableHead>
                                <TableHead>Album</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredSongs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">No songs found.</TableCell>
                                </TableRow>
                            ) : (
                                filteredSongs.map((song) => (
                                    <TableRow key={song.id}>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full"
                                                onClick={() => togglePlay(song.file_url, song.id)}
                                            >
                                                {isPlaying === song.id ? <Pause size={16} /> : <Play size={16} />}
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                                                    {song.cover_url ? (
                                                        <img src={song.cover_url} alt={song.title} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Music className="h-5 w-5 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="font-medium">{song.title}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{song.artists?.name}</TableCell>
                                        <TableCell className="text-gray-500">{song.albums?.title || "Single"}</TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(song)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(song.id, song.file_url)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AdminLayout>
    );
};

function Plus(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
