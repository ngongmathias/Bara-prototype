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
    Plus, Search, Edit, Trash2, BookOpen, Star, Download, TrendingUp, Upload, Loader2, X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { AdminPageGuide } from "@/components/admin/AdminPageGuide";
import { COUNTRIES, LANGUAGES } from "@/lib/constants";

interface Ebook {
    id: string;
    title: string;
    author: string;
    description: string;
    genre: string;
    year: number;
    pages: number;
    language: string;
    country: string;
    cover_url: string;
    file_url: string;
    is_featured: boolean;
    is_free: boolean;
    price: number;
    download_count: number;
    created_at: string;
}

const GENRES = [
    "Fiction", "Non-Fiction", "Biography", "History", "Science",
    "Technology", "Business", "Self-Help", "Poetry", "Children",
    "Romance", "Thriller", "Fantasy", "African Literature", "Education",
];

const BUCKET = "ebooks";

async function uploadFile(file: File, folder: string): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage.from(BUCKET).upload(filePath, file);
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return publicUrl;
}

export const AdminEbooks = () => {
    const [ebooks, setEbooks] = useState<Ebook[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEbook, setEditingEbook] = useState<Ebook | null>(null);
    const [ebookToDelete, setEbookToDelete] = useState<string | null>(null);
    const [tableExists, setTableExists] = useState(true);
    const { toast } = useToast();

    // File states
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [ebookFile, setEbookFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "", author: "", description: "", genre: "Fiction",
        year: new Date().getFullYear(), pages: 0, language: "en",
        country: "", cover_url: "", file_url: "",
        is_featured: false, is_free: true, price: 0,
    });

    useEffect(() => { fetchEbooks(); }, []);

    const fetchEbooks = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from("ebooks").select("*").order("created_at", { ascending: false });
            if (error) {
                if (error.code === "42P01" || error.message?.includes("does not exist")) {
                    setTableExists(false);
                }
                console.error("Error fetching ebooks:", error);
                return;
            }
            setEbooks(data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.author) {
            toast({ title: "Error", description: "Title and author are required.", variant: "destructive" });
            return;
        }
        try {
            setUploading(true);
            const finalData = { ...formData };

            // Upload files
            const [coverUrl, fileUrl] = await Promise.all([
                coverFile ? uploadFile(coverFile, "covers") : null,
                ebookFile ? uploadFile(ebookFile, "files") : null,
            ]);

            if (coverUrl) finalData.cover_url = coverUrl;
            if (fileUrl) finalData.file_url = fileUrl;

            if (editingEbook) {
                const { error } = await supabase.from("ebooks").update(finalData).eq("id", editingEbook.id);
                if (error) throw error;
                toast({ title: "Updated", description: `"${finalData.title}" updated.` });
            } else {
                const { error } = await supabase.from("ebooks").insert([{ ...finalData, download_count: 0 }]);
                if (error) throw error;
                toast({ title: "Created", description: `"${finalData.title}" created.` });
            }
            setIsDialogOpen(false);
            resetForm();
            fetchEbooks();
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!ebookToDelete) return;
        try {
            const { error } = await supabase.from("ebooks").delete().eq("id", ebookToDelete);
            if (error) throw error;
            toast({ title: "Deleted", description: "Ebook deleted." });
            setEbookToDelete(null);
            fetchEbooks();
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        }
    };

    const openEdit = (e: Ebook) => {
        setEditingEbook(e);
        setFormData({
            title: e.title, author: e.author, description: e.description || "",
            genre: e.genre || "Fiction", year: e.year || new Date().getFullYear(),
            pages: e.pages || 0, language: e.language || "en", country: e.country || "",
            cover_url: e.cover_url || "", file_url: e.file_url || "",
            is_featured: e.is_featured || false, is_free: e.is_free ?? true,
            price: e.price || 0,
        });
        if (e.cover_url) setCoverPreview(e.cover_url);
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingEbook(null);
        setFormData({
            title: "", author: "", description: "", genre: "Fiction",
            year: new Date().getFullYear(), pages: 0, language: "en",
            country: "", cover_url: "", file_url: "",
            is_featured: false, is_free: true, price: 0,
        });
        setCoverFile(null);
        setEbookFile(null);
        setCoverPreview(null);
    };

    const filtered = ebooks.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.genre?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!tableExists) {
        return (
            <AdminLayout title="Ebooks" subtitle="Manage ebook library">
                <div className="p-6">
                    <Card>
                        <CardContent className="p-8 text-center">
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Ebooks Table Not Found</h3>
                            <p className="text-gray-500 text-sm mb-4">
                                The ebooks table hasn't been created yet. Run the migration SQL in your Supabase SQL Editor to create it.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Ebooks" subtitle="Manage ebook library and catalog">
            <div className="mb-4 w-full flex justify-end">
                <AdminPageGuide
                    title="Admin Ebooks"
                    description="Manage the BARA ebook library."
                    features={["Add/edit/delete ebooks", "Upload cover images & ebook files (PDF/EPUB)", "Feature ebooks on homepage", "Toggle free/paid with pricing"]}
                    workflow={["Add a new ebook with title, author, genre", "Upload cover image and ebook file", "Set free or paid with price in coins"]}
                />
            </div>
            <div className="p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Ebooks</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{ebooks.length}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Featured</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{ebooks.filter(e => e.is_featured).length}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
                            <Download className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{ebooks.reduce((a, e) => a + (e.download_count || 0), 0).toLocaleString()}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Free Ebooks</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{ebooks.filter(e => e.is_free).length}</div></CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Search ebooks..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                    </div>
                    <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                        <Plus className="h-4 w-4 mr-2" /> Add Ebook
                    </Button>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Genre</TableHead>
                                    <TableHead>Pages</TableHead>
                                    <TableHead>Downloads</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">Loading...</TableCell></TableRow>
                                ) : filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No ebooks found</TableCell></TableRow>
                                ) : filtered.map(e => (
                                    <TableRow key={e.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {e.cover_url ? (
                                                    <img loading="lazy" src={e.cover_url} alt={e.title} className="w-10 h-14 rounded object-cover" />
                                                ) : (
                                                    <div className="w-10 h-14 rounded bg-gray-200 flex items-center justify-center"><BookOpen className="h-4 w-4 text-gray-400" /></div>
                                                )}
                                                <span className="font-medium">{e.title}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{e.author}</TableCell>
                                        <TableCell><span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">{e.genre}</span></TableCell>
                                        <TableCell>{e.pages || "—"}</TableCell>
                                        <TableCell>{e.download_count?.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {e.is_featured && <span className="text-green-600 font-bold text-[10px]">FEATURED</span>}
                                                {e.is_free ? <span className="text-blue-600 text-[10px]">FREE</span> : <span className="text-orange-600 text-[10px]">PAID ({e.price} coins)</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => openEdit(e)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setEbookToDelete(e.id)}><Trash2 className="h-4 w-4" /></Button>
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
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingEbook ? "Edit Ebook" : "Add New Ebook"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Title *</Label><Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
                            <div><Label>Author *</Label><Input value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} /></div>
                        </div>
                        <div><Label>Description</Label><Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label>Genre</Label>
                                <Select value={formData.genre} onValueChange={v => setFormData({ ...formData, genre: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div><Label>Year</Label><Input type="number" value={formData.year} onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) || 2024 })} /></div>
                            <div><Label>Pages</Label><Input type="number" value={formData.pages} onChange={e => setFormData({ ...formData, pages: parseInt(e.target.value) || 0 })} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Country</Label>
                                <Select value={formData.country} onValueChange={v => setFormData({ ...formData, country: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                                    <SelectContent>
                                        {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
                                        <img loading="lazy" src={coverPreview} alt="Cover preview" className="w-20 h-28 rounded object-cover border" />
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

                        {/* Ebook File Upload */}
                        <div>
                            <Label>Ebook File (PDF / EPUB)</Label>
                            <div className="mt-1">
                                <label className="flex items-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-gray-400 transition">
                                    <Upload className="h-5 w-5 text-gray-400" />
                                    <span className="text-sm text-gray-500">
                                        {ebookFile ? ebookFile.name : (editingEbook?.file_url ? "Upload new file to replace current" : "Click to upload ebook file")}
                                    </span>
                                    <input type="file" accept=".pdf,.epub,.mobi" className="hidden" onChange={e => { if (e.target.files?.[0]) setEbookFile(e.target.files[0]); }} />
                                </label>
                                {ebookFile && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-green-600">Ready: {ebookFile.name} ({(ebookFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                                        <button onClick={() => setEbookFile(null)} className="text-red-500 text-xs underline">Remove</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Checkbox checked={formData.is_featured} onCheckedChange={(v) => setFormData({ ...formData, is_featured: !!v })} id="ebook-featured" />
                                <Label htmlFor="ebook-featured">Featured</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox checked={formData.is_free} onCheckedChange={(v) => setFormData({ ...formData, is_free: !!v, price: v ? 0 : formData.price })} id="ebook-free" />
                                <Label htmlFor="ebook-free">Free</Label>
                            </div>
                        </div>
                        {!formData.is_free && (
                            <div>
                                <Label>Price (in Bara Coins)</Label>
                                <Input type="number" min="0" value={formData.price} onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} placeholder="e.g. 50" />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={uploading}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={uploading}>
                            {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</> : (editingEbook ? "Update" : "Create")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!ebookToDelete} onOpenChange={() => setEbookToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Ebook?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete this ebook. This action cannot be undone.</AlertDialogDescription>
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
