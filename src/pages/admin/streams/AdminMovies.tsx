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
    Plus, Search, Edit, Trash2, Film, Star, Eye, TrendingUp, Upload, Loader2, X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { AdminPageGuide } from "@/components/admin/AdminPageGuide";
import { COUNTRIES, LANGUAGES } from "@/lib/constants";

interface Movie {
    id: string;
    title: string;
    description: string;
    genre: string;
    year: number;
    duration_minutes: number;
    rating: number;
    poster_url: string;
    backdrop_url: string;
    trailer_url: string;
    stream_url: string;
    director: string;
    producers: string;
    writers: string;
    actors: string;
    country: string;
    language: string;
    is_featured: boolean;
    is_free: boolean;
    view_count: number;
    created_at: string;
}

const GENRES = [
    "Action", "Comedy", "Drama", "Documentary", "Horror",
    "Romance", "Thriller", "Sci-Fi", "Animation", "Short Film",
];

const BUCKET = "movies";

async function uploadFile(file: File, folder: string): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage.from(BUCKET).upload(filePath, file);
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return publicUrl;
}

export const AdminMovies = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
    const [movieToDelete, setMovieToDelete] = useState<string | null>(null);
    const [tableExists, setTableExists] = useState(true);
    const { toast } = useToast();

    // File states
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [backdropFile, setBackdropFile] = useState<File | null>(null);
    const [trailerFile, setTrailerFile] = useState<File | null>(null);
    const [movieFile, setMovieFile] = useState<File | null>(null);

    // Preview states
    const [posterPreview, setPosterPreview] = useState<string | null>(null);
    const [backdropPreview, setBackdropPreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "", description: "", genre: "Drama", year: new Date().getFullYear(),
        duration_minutes: 90, rating: 0, poster_url: "", backdrop_url: "",
        trailer_url: "", stream_url: "", director: "", producers: "", writers: "", actors: "",
        country: "", language: "en", is_featured: false, is_free: true,
    });

    useEffect(() => { fetchMovies(); }, []);

    const fetchMovies = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from("movies").select("*").order("created_at", { ascending: false });
            if (error) {
                if (error.code === "42P01" || error.message?.includes("does not exist")) {
                    setTableExists(false);
                }
                console.error("Error fetching movies:", error);
                return;
            }
            setMovies(data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSubmit = async () => {
        if (!formData.title) {
            toast({ title: "Error", description: "Title is required.", variant: "destructive" });
            return;
        }
        try {
            setUploading(true);
            const finalData = { ...formData };

            // Upload files in parallel
            const uploads = await Promise.all([
                posterFile ? uploadFile(posterFile, "posters") : null,
                backdropFile ? uploadFile(backdropFile, "backdrops") : null,
                trailerFile ? uploadFile(trailerFile, "trailers") : null,
                movieFile ? uploadFile(movieFile, "videos") : null,
            ]);

            if (uploads[0]) finalData.poster_url = uploads[0];
            if (uploads[1]) finalData.backdrop_url = uploads[1];
            if (uploads[2]) finalData.trailer_url = uploads[2];
            if (uploads[3]) finalData.stream_url = uploads[3];

            if (editingMovie) {
                const { error } = await supabase.from("movies").update(finalData).eq("id", editingMovie.id);
                if (error) throw error;
                toast({ title: "Updated", description: `"${finalData.title}" updated.` });
            } else {
                const { error } = await supabase.from("movies").insert([{ ...finalData, view_count: 0 }]);
                if (error) throw error;
                toast({ title: "Created", description: `"${finalData.title}" created.` });
            }
            setIsDialogOpen(false);
            resetForm();
            fetchMovies();
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!movieToDelete) return;
        try {
            const { error } = await supabase.from("movies").delete().eq("id", movieToDelete);
            if (error) throw error;
            toast({ title: "Deleted", description: "Movie deleted." });
            setMovieToDelete(null);
            fetchMovies();
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        }
    };

    const openEdit = (m: Movie) => {
        setEditingMovie(m);
        setFormData({
            title: m.title, description: m.description || "", genre: m.genre || "Drama",
            year: m.year || new Date().getFullYear(), duration_minutes: m.duration_minutes || 90,
            rating: m.rating || 0, poster_url: m.poster_url || "", backdrop_url: m.backdrop_url || "",
            trailer_url: m.trailer_url || "", stream_url: m.stream_url || "",
            director: m.director || "", producers: m.producers || "", writers: m.writers || "", actors: m.actors || "",
            country: m.country || "", language: m.language || "en",
            is_featured: m.is_featured || false, is_free: m.is_free ?? true,
        });
        if (m.poster_url) setPosterPreview(m.poster_url);
        if (m.backdrop_url) setBackdropPreview(m.backdrop_url);
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingMovie(null);
        setFormData({
            title: "", description: "", genre: "Drama", year: new Date().getFullYear(),
            duration_minutes: 90, rating: 0, poster_url: "", backdrop_url: "",
            trailer_url: "", stream_url: "", director: "", producers: "", writers: "", actors: "",
            country: "", language: "en", is_featured: false, is_free: true,
        });
        setPosterFile(null);
        setBackdropFile(null);
        setTrailerFile(null);
        setMovieFile(null);
        setPosterPreview(null);
        setBackdropPreview(null);
    };

    const handleImageSelect = (
        e: React.ChangeEvent<HTMLInputElement>,
        setFile: (f: File | null) => void,
        setPreview: (u: string | null) => void,
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const filtered = movies.filter(m =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.genre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.director?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDuration = (min: number) => {
        const h = Math.floor(min / 60);
        const m = min % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    if (!tableExists) {
        return (
            <AdminLayout title="Movies" subtitle="Manage movie content">
                <div className="p-6">
                    <Card>
                        <CardContent className="p-8 text-center">
                            <Film className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Movies Table Not Found</h3>
                            <p className="text-gray-500 text-sm mb-4">
                                The movies table hasn't been created yet. Run the DDL SQL in your Supabase SQL Editor to create it.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Movies" subtitle="Manage movie content and catalog">
            <div className="mb-4 w-full flex justify-end">
                <AdminPageGuide
                    title="Admin Movies"
                    description="Manage the BARA movie catalog."
                    features={["Add/edit/delete movies", "Upload posters, trailers & full movies", "Feature movies on homepage", "Toggle free/premium"]}
                    workflow={["Add a new movie with title, genre, upload poster", "Upload trailer and movie file", "Set featured flag for homepage visibility"]}
                />
            </div>
            <div className="p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Movies</CardTitle>
                            <Film className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{movies.length}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Featured</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{movies.filter(m => m.is_featured).length}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{movies.reduce((a, m) => a + (m.view_count || 0), 0).toLocaleString()}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Free Movies</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{movies.filter(m => m.is_free).length}</div></CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Search movies..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                    </div>
                    <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                        <Plus className="h-4 w-4 mr-2" /> Add Movie
                    </Button>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Genre</TableHead>
                                    <TableHead>Year</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Views</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">Loading...</TableCell></TableRow>
                                ) : filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">No movies found</TableCell></TableRow>
                                ) : filtered.map(m => (
                                    <TableRow key={m.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {m.poster_url ? (
                                                    <img loading="lazy" src={m.poster_url} alt={m.title} className="w-10 h-14 rounded object-cover" />
                                                ) : (
                                                    <div className="w-10 h-14 rounded bg-gray-200 flex items-center justify-center"><Film className="h-4 w-4 text-gray-400" /></div>
                                                )}
                                                <div>
                                                    <span className="font-medium block">{m.title}</span>
                                                    {m.director && <span className="text-xs text-gray-500">{m.director}</span>}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell><span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">{m.genre}</span></TableCell>
                                        <TableCell>{m.year}</TableCell>
                                        <TableCell>{formatDuration(m.duration_minutes)}</TableCell>
                                        <TableCell><span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" fill="currentColor" />{m.rating}</span></TableCell>
                                        <TableCell>{m.view_count?.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {m.is_featured && <span className="text-green-600 font-bold text-[10px]">FEATURED</span>}
                                                {m.is_free ? <span className="text-blue-600 text-[10px]">FREE</span> : <span className="text-orange-600 text-[10px]">PREMIUM</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => openEdit(m)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setMovieToDelete(m.id)}><Trash2 className="h-4 w-4" /></Button>
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
                        <DialogTitle>{editingMovie ? "Edit Movie" : "Add New Movie"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div><Label>Title *</Label><Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
                        <div><Label>Description</Label><Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
                        <div className="grid grid-cols-2 gap-4">
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
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Duration (min)</Label><Input type="number" value={formData.duration_minutes} onChange={e => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 90 })} /></div>
                            <div><Label>Rating (0-5)</Label><Input type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={e => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })} /></div>
                        </div>
                        <div><Label>Director</Label><Input value={formData.director} onChange={e => setFormData({ ...formData, director: e.target.value })} placeholder="e.g. Kunle Afolayan" /></div>
                        <div><Label>Producer(s)</Label><Input value={formData.producers} onChange={e => setFormData({ ...formData, producers: e.target.value })} placeholder="Comma-separated, e.g. John Doe, Jane Smith" /></div>
                        <div><Label>Writer(s)</Label><Input value={formData.writers} onChange={e => setFormData({ ...formData, writers: e.target.value })} placeholder="Comma-separated" /></div>
                        <div><Label>Actors / Cast</Label><Textarea value={formData.actors} onChange={e => setFormData({ ...formData, actors: e.target.value })} placeholder="Comma-separated, e.g. Omotola Jalade, John Boyega, Lupita Nyong'o" rows={2} /></div>
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

                        {/* Poster Upload */}
                        <div>
                            <Label>Poster Image</Label>
                            <div className="mt-1">
                                {posterPreview ? (
                                    <div className="relative inline-block">
                                        <img loading="lazy" src={posterPreview} alt="Poster preview" className="w-24 h-36 rounded object-cover border" />
                                        <button onClick={() => { setPosterFile(null); setPosterPreview(null); setFormData({ ...formData, poster_url: "" }); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X className="h-3 w-3" /></button>
                                    </div>
                                ) : (
                                    <label className="flex items-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-gray-400 transition">
                                        <Upload className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm text-gray-500">Click to upload poster image</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={e => handleImageSelect(e, setPosterFile, setPosterPreview)} />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Backdrop Upload */}
                        <div>
                            <Label>Backdrop Image</Label>
                            <div className="mt-1">
                                {backdropPreview ? (
                                    <div className="relative inline-block">
                                        <img loading="lazy" src={backdropPreview} alt="Backdrop preview" className="w-40 h-20 rounded object-cover border" />
                                        <button onClick={() => { setBackdropFile(null); setBackdropPreview(null); setFormData({ ...formData, backdrop_url: "" }); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X className="h-3 w-3" /></button>
                                    </div>
                                ) : (
                                    <label className="flex items-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-gray-400 transition">
                                        <Upload className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm text-gray-500">Click to upload backdrop image</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={e => handleImageSelect(e, setBackdropFile, setBackdropPreview)} />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Trailer Upload */}
                        <div>
                            <Label>Trailer Video</Label>
                            <div className="mt-1">
                                <label className="flex items-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-gray-400 transition">
                                    <Upload className="h-5 w-5 text-gray-400" />
                                    <span className="text-sm text-gray-500">
                                        {trailerFile ? trailerFile.name : (editingMovie?.trailer_url ? "Upload new trailer to replace current" : "Click to upload trailer video")}
                                    </span>
                                    <input type="file" accept="video/*" className="hidden" onChange={e => { if (e.target.files?.[0]) setTrailerFile(e.target.files[0]); }} />
                                </label>
                                {trailerFile && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-green-600">Ready: {trailerFile.name} ({(trailerFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                                        <button onClick={() => setTrailerFile(null)} className="text-red-500 text-xs underline">Remove</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Movie File Upload */}
                        <div>
                            <Label>Movie File</Label>
                            <div className="mt-1">
                                <label className="flex items-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-gray-400 transition">
                                    <Upload className="h-5 w-5 text-gray-400" />
                                    <span className="text-sm text-gray-500">
                                        {movieFile ? movieFile.name : (editingMovie?.stream_url ? "Upload new movie file to replace current" : "Click to upload movie file")}
                                    </span>
                                    <input type="file" accept="video/*" className="hidden" onChange={e => { if (e.target.files?.[0]) setMovieFile(e.target.files[0]); }} />
                                </label>
                                {movieFile && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-green-600">Ready: {movieFile.name} ({(movieFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                                        <button onClick={() => setMovieFile(null)} className="text-red-500 text-xs underline">Remove</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Checkbox checked={formData.is_featured} onCheckedChange={(v) => setFormData({ ...formData, is_featured: !!v })} id="movie-featured" />
                                <Label htmlFor="movie-featured">Featured</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox checked={formData.is_free} onCheckedChange={(v) => setFormData({ ...formData, is_free: !!v })} id="movie-free" />
                                <Label htmlFor="movie-free">Free to watch</Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={uploading}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={uploading}>
                            {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</> : (editingMovie ? "Update" : "Create")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!movieToDelete} onOpenChange={() => setMovieToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Movie?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete this movie. This action cannot be undone.</AlertDialogDescription>
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
