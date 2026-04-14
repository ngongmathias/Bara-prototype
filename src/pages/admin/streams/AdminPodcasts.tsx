import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Plus, Search, Edit, Trash2, Mic2, Headphones, Users, Eye, Upload, Loader2, X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { AdminPageGuide } from "@/components/admin/AdminPageGuide";
import { LANGUAGES } from "@/lib/constants";

interface Podcast {
    id: string;
    title: string;
    host: string;
    description: string;
    category: string;
    cover_url: string;
    language: string;
    is_featured: boolean;
    subscriber_count: number;
    created_at: string;
}

const CATEGORIES = [
    "Entrepreneurship", "Technology", "Culture", "True Crime",
    "Comedy", "Finance", "Sports", "Music", "Education", "Health",
];

const BUCKET = "podcasts";

async function uploadFile(file: File, folder: string): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage.from(BUCKET).upload(filePath, file);
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return publicUrl;
}

export const AdminPodcasts = () => {
    const [podcasts, setPodcasts] = useState<Podcast[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null);
    const [podcastToDelete, setPodcastToDelete] = useState<string | null>(null);
    const [tableExists, setTableExists] = useState(true);
    const { toast } = useToast();

    // File states
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "", host: "", description: "", category: "Entrepreneurship",
        cover_url: "", language: "en", is_featured: false,
    });

    useEffect(() => { fetchPodcasts(); }, []);

    const fetchPodcasts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from("podcasts").select("*").order("created_at", { ascending: false });
            if (error) {
                if (error.code === "42P01" || error.message?.includes("does not exist")) {
                    setTableExists(false);
                }
                console.error("Error fetching podcasts:", error);
                return;
            }
            setPodcasts(data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.host) {
            toast({ title: "Error", description: "Title and host are required.", variant: "destructive" });
            return;
        }
        try {
            setUploading(true);
            const finalData = { ...formData };

            if (coverFile) {
                finalData.cover_url = await uploadFile(coverFile, "covers");
            }

            if (editingPodcast) {
                const { error } = await supabase.from("podcasts").update(finalData).eq("id", editingPodcast.id);
                if (error) throw error;
                toast({ title: "Updated", description: `"${finalData.title}" updated.` });
            } else {
                const { error } = await supabase.from("podcasts").insert([{ ...finalData, subscriber_count: 0 }]);
                if (error) throw error;
                toast({ title: "Created", description: `"${finalData.title}" created.` });
            }
            setIsDialogOpen(false);
            resetForm();
            fetchPodcasts();
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!podcastToDelete) return;
        try {
            const { error } = await supabase.from("podcasts").delete().eq("id", podcastToDelete);
            if (error) throw error;
            toast({ title: "Deleted", description: "Podcast deleted." });
            setPodcastToDelete(null);
            fetchPodcasts();
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        }
    };

    const openEdit = (p: Podcast) => {
        setEditingPodcast(p);
        setFormData({
            title: p.title, host: p.host, description: p.description || "",
            category: p.category || "Entrepreneurship", cover_url: p.cover_url || "",
            language: p.language || "en", is_featured: p.is_featured || false,
        });
        if (p.cover_url) setCoverPreview(p.cover_url);
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingPodcast(null);
        setFormData({ title: "", host: "", description: "", category: "Entrepreneurship", cover_url: "", language: "en", is_featured: false });
        setCoverFile(null);
        setCoverPreview(null);
    };

    const filtered = podcasts.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!tableExists) {
        return (
            <AdminLayout title="Podcasts" subtitle="Manage podcast shows">
                <div className="p-6">
                    <Card>
                        <CardContent className="p-8 text-center">
                            <Mic2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Podcasts Table Not Found</h3>
                            <p className="text-gray-500 text-sm mb-4">
                                The podcasts table hasn't been created yet. Run the DDL SQL in your Supabase SQL Editor to create it.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Podcasts" subtitle="Manage podcast shows and episodes">
            <div className="mb-4 w-full flex justify-end">
                <AdminPageGuide
                    title="Admin Podcasts"
                    description="Manage podcast shows on the BARA platform."
                    features={["Add/edit/delete podcasts", "Upload cover images", "Feature shows on homepage", "Track subscriber counts"]}
                    workflow={["Add a new podcast with title, host, and category", "Upload cover image", "Toggle featured status for homepage visibility"]}
                />
            </div>
            <div className="p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Shows</CardTitle>
                            <Mic2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{podcasts.length}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Featured</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{podcasts.filter(p => p.is_featured).length}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{podcasts.reduce((a, p) => a + (p.subscriber_count || 0), 0).toLocaleString()}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Categories</CardTitle>
                            <Headphones className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{new Set(podcasts.map(p => p.category)).size}</div></CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Search podcasts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                    </div>
                    <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                        <Plus className="h-4 w-4 mr-2" /> Add Podcast
                    </Button>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Host</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Subscribers</TableHead>
                                    <TableHead>Featured</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Loading...</TableCell></TableRow>
                                ) : filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No podcasts found</TableCell></TableRow>
                                ) : filtered.map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {p.cover_url ? (
                                                    <img loading="lazy" src={p.cover_url} alt={p.title} className="w-10 h-10 rounded-md object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center"><Mic2 className="h-4 w-4 text-gray-400" /></div>
                                                )}
                                                <span className="font-medium">{p.title}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{p.host}</TableCell>
                                        <TableCell><span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">{p.category}</span></TableCell>
                                        <TableCell>{p.subscriber_count?.toLocaleString()}</TableCell>
                                        <TableCell>{p.is_featured ? <span className="text-green-600 font-bold text-xs">YES</span> : <span className="text-gray-400 text-xs">No</span>}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setPodcastToDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingPodcast ? "Edit Podcast" : "Add New Podcast"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div><Label>Title *</Label><Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
                        <div><Label>Host *</Label><Input value={formData.host} onChange={e => setFormData({ ...formData, host: e.target.value })} /></div>
                        <div><Label>Description</Label><Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Category</Label>
                                <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Language</Label>
                                <Select value={formData.language} onValueChange={v => setFormData({ ...formData, language: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                                    <SelectContent>
                                        {LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Cover Image Upload */}
                        <div>
                            <Label>Cover Image</Label>
                            <div className="mt-1">
                                {coverPreview ? (
                                    <div className="relative inline-block">
                                        <img loading="lazy" src={coverPreview} alt="Cover preview" className="w-20 h-20 rounded-md object-cover border" />
                                        <button onClick={() => { setCoverFile(null); setCoverPreview(null); setFormData({ ...formData, cover_url: "" }); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X className="h-3 w-3" /></button>
                                    </div>
                                ) : (
                                    <label className="flex items-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-gray-400 transition">
                                        <Upload className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm text-gray-500">Click to upload cover image</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setCoverFile(file);
                                                setCoverPreview(URL.createObjectURL(file));
                                            }
                                        }} />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox checked={formData.is_featured} onCheckedChange={(v) => setFormData({ ...formData, is_featured: !!v })} id="featured" />
                            <Label htmlFor="featured">Featured on homepage</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={uploading}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={uploading}>
                            {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</> : (editingPodcast ? "Update" : "Create")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!podcastToDelete} onOpenChange={() => setPodcastToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Podcast?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete this podcast and all its episodes. This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
};
