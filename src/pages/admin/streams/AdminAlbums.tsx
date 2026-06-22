import { useState, useEffect } from "react";
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
    Disc,
    Loader2,
    Calendar,
    Plus
} from "lucide-react";
import { db, supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';


interface Album {
    id: string;
    artist_id: string;
    title: string;
    cover_url: string | null;
    release_date: string;
    genre: string;
    artists?: { name: string };
}

interface Artist {
    id: string;
    name: string;
}

export const AdminAlbums = () => {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { toast } = useToast();

    // Form State
    const [formData, setFormData] = useState<Partial<Album>>({
        title: "",
        artist_id: "",
        cover_url: "",
        release_date: new Date().toLocaleDateString('en-CA'),
        genre: ""
    });

    const PAGE_SIZE = 20;
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    // Artists (for the dropdown) load once; albums are paginated.
    useEffect(() => {
        db.artists().select('id, name').order('name').then(({ data }) => setArtists(data || []));
    }, []);

    useEffect(() => {
        const t = setTimeout(() => fetchAlbums(page, searchTerm), 250);
        return () => clearTimeout(t);
    }, [page, searchTerm]);

    const fetchAlbums = async (pageNum = page, search = searchTerm) => {
        try {
            setLoading(true);
            const from = (pageNum - 1) * PAGE_SIZE;
            let q = db.albums().select('*, artists(name)', { count: 'exact' }).order('created_at', { ascending: false });
            if (search.trim()) q = q.ilike('title', `%${search.trim()}%`);
            const { data, count, error } = await q.range(from, from + PAGE_SIZE - 1);
            if (error) throw error;
            setAlbums(data || []);
            setTotal(count || 0);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `covers/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('music-covers')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('music-covers')
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
            let finalCoverUrl = formData.cover_url;

            if (selectedFile) {
                finalCoverUrl = await handleUpload(selectedFile);
            }

            if (editingAlbum) {
                const { error } = await db.albums()
                    .update({ ...formData, cover_url: finalCoverUrl })
                    .eq('id', editingAlbum.id);
                if (error) throw error;
                toast({ title: "Success", description: "Album updated" });
            } else {
                const { error } = await db.albums()
                    .insert({ ...formData, cover_url: finalCoverUrl });
                if (error) throw error;
                toast({ title: "Success", description: "Album created" });
            }

            setIsDialogOpen(false);
            fetchAlbums();
            resetForm();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to save album", variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, coverUrl: string) => {
        if (!confirm("Are you sure? This will not delete the songs inside.")) return;
        try {
            const { error: dbError } = await db.albums().delete().eq('id', id);
            if (dbError) throw dbError;

            // Optional: Delete from storage
            if (coverUrl && coverUrl.includes('music-covers')) {
                const fileName = coverUrl.split('/').pop();
                if (fileName) {
                    await supabase.storage.from('music-covers').remove([`covers/${fileName}`]);
                }
            }

            toast({ title: "Success", description: "Album deleted" });
            fetchAlbums();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to delete album", variant: "destructive" });
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            artist_id: "",
            cover_url: "",
            release_date: new Date().toLocaleDateString('en-CA'),
            genre: ""
        });
        setEditingAlbum(null);
        setSelectedFile(null);
    };

    const openEdit = (album: Album) => {
        setEditingAlbum(album);
        setFormData({
            title: album.title,
            artist_id: album.artist_id,
            cover_url: album.cover_url || "",
            release_date: new Date(album.release_date).toLocaleDateString('en-CA'),
            genre: album.genre || ""
        });
        setIsDialogOpen(true);
    };

    return (
        <AdminLayout title="Albums" subtitle="Manage albums and EP releases">
        <div className="mb-4 w-full flex justify-end">
          <AdminPageGuide 
            title="Bara Streams: Albums"
            description="Moderate album releases by independent artists."
            features={["Edit release dates", "Take down copyrighted material", "Feature new drops"]}
            workflow={["Search for flagged albums", "Verify rights ownership", "Remove if an active DMCA is present"]}
          />
        </div>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="relative w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search albums by title..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        />
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button className="bg-gray-900 hover:bg-black">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Album
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>{editingAlbum ? 'Edit Album' : 'Create New Album'}</DialogTitle>
                                <DialogDescription>
                                    Set up an album container for tracks.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Album Title</Label>
                                    <Input
                                        value={formData.title || ''}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. After Hours"
                                    />
                                </div>
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Release Date</Label>
                                        <Input
                                            type="date"
                                            value={formData.release_date || ''}
                                            onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Genre</Label>
                                        <Input
                                            value={formData.genre || ''}
                                            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                                            placeholder="e.g. Pop"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Cover Image</Label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="cursor-pointer"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={uploading}>Cancel</Button>
                                <Button onClick={handleSave} className="bg-gray-900 hover:bg-black" disabled={uploading}>
                                    {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {editingAlbum ? 'Update Album' : 'Create Album'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-md border bg-white overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Album</TableHead>
                                <TableHead>Artist</TableHead>
                                <TableHead>Release Date</TableHead>
                                <TableHead>Genre</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                                    </TableCell>
                                </TableRow>
                            ) : albums.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">No albums found.</TableCell>
                                </TableRow>
                            ) : (
                                albums.map((album) => (
                                    <TableRow key={album.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                                                    {album.cover_url ? (
                                                        <img loading="lazy" src={album.cover_url} alt={album.title} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Disc className="h-6 w-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="font-medium">{album.title}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{album.artists?.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar size={14} />
                                                {new Date(album.release_date).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                                {album.genre || "N/A"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(album)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(album.id, album.cover_url || '')}
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

                {total > PAGE_SIZE && (
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{total.toLocaleString()} albums · page {page} of {totalPages}</span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
                            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};
