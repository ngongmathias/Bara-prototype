import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Mic2,
    CheckCircle,
    XCircle,
    Image as ImageIcon
} from "lucide-react";
import { db } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Artist {
    id: string;
    name: string;
    bio: string | null;
    image_url: string | null;
    is_verified: boolean;
    twitter_handle: string | null;
    instagram_handle: string | null;
}

export const AdminArtists = () => {
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
    const { toast } = useToast();

    // Form State
    const [formData, setFormData] = useState<Partial<Artist>>({
        name: "",
        bio: "",
        image_url: "",
        is_verified: false,
        twitter_handle: "",
        instagram_handle: ""
    });

    useEffect(() => {
        fetchArtists();
    }, []);

    const fetchArtists = async () => {
        try {
            setLoading(true);
            const { data, error } = await db.artists().select('*').order('name');
            if (error) throw error;
            setArtists(data || []);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to fetch artists", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (!formData.name) {
                toast({ title: "Error", description: "Name is required", variant: "destructive" });
                return;
            }

            if (editingArtist) {
                const { error } = await db.artists()
                    .update(formData)
                    .eq('id', editingArtist.id);
                if (error) throw error;
                toast({ title: "Success", description: "Artist updated" });
            } else {
                const { error } = await db.artists()
                    .insert(formData);
                if (error) throw error;
                toast({ title: "Success", description: "Artist created" });
            }

            setIsDialogOpen(false);
            fetchArtists();
            resetForm();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to save artist", variant: "destructive" });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will delete all their music too!")) return;
        try {
            const { error } = await db.artists().delete().eq('id', id);
            if (error) throw error;
            toast({ title: "Success", description: "Artist deleted" });
            fetchArtists();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to delete artist", variant: "destructive" });
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            bio: "",
            image_url: "",
            is_verified: false,
            twitter_handle: "",
            instagram_handle: ""
        });
        setEditingArtist(null);
    };

    const openEdit = (artist: Artist) => {
        setEditingArtist(artist);
        setFormData(artist);
        setIsDialogOpen(true);
    };

    const filteredArtists = artists.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout title="Artists" subtitle="Manage artists and profiles">
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="relative w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search artists..."
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
                                Add Artist
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>{editingArtist ? 'Edit Artist' : 'Add New Artist'}</DialogTitle>
                                <DialogDescription>
                                    Create or update artist profile information.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Artist Name</Label>
                                    <Input
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. The Weeknd"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Bio</Label>
                                    <Textarea
                                        value={formData.bio || ''}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        placeholder="Artist biography..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Profile Image URL</Label>
                                    <Input
                                        value={formData.image_url || ''}
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="verified"
                                        checked={formData.is_verified}
                                        onCheckedChange={(checked) => setFormData({ ...formData, is_verified: !!checked })}
                                    />
                                    <Label htmlFor="verified">Verified Artist</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleSave} className="bg-brand-blue">Save Artist</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Artist</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8">Loading...</TableCell>
                                </TableRow>
                            ) : filteredArtists.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8">No artists found.</TableCell>
                                </TableRow>
                            ) : (
                                filteredArtists.map((artist) => (
                                    <TableRow key={artist.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
                                                    {artist.image_url ? (
                                                        <img src={artist.image_url} alt={artist.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Mic2 className="h-5 w-5 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{artist.name}</div>
                                                    <div className="text-xs text-gray-500 truncate max-w-[200px]">{artist.bio}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {artist.is_verified ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    Unverified
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(artist)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(artist.id)}>
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
