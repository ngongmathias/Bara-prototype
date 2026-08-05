import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, BookOpenCheck, DollarSign, Trash2, Plus, Upload, Loader2, X } from "lucide-react";

interface MyEbook {
  id: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  cover_url: string;
  file_url: string;
  is_free: boolean;
  price: number;
  read_count: number;
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

export const UserMyEbooks = () => {
  const { user } = useUser();
  const [ebooks, setEbooks] = useState<MyEbook[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "", author: "", description: "", genre: "African Literature",
    is_free: true, price: 0,
  });

  useEffect(() => {
    if (user?.id) fetchMyEbooks();
  }, [user?.id]);

  const fetchMyEbooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ebooks")
        .select("*")
        .eq("uploaded_by", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEbooks(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resetCreateForm = () => {
    setForm({ title: "", author: user?.fullName || user?.username || "", description: "", genre: "African Literature", is_free: true, price: 0 });
    setCoverFile(null);
    setCoverPreview(null);
    setEbookFile(null);
  };

  const handleCreateEbook = async () => {
    if (!user || !form.title || !form.author || !ebookFile) {
      toast({ title: "Error", description: "Title, author, and an ebook file are required.", variant: "destructive" });
      return;
    }
    try {
      setCreating(true);
      const [coverUrl, fileUrl] = await Promise.all([
        coverFile ? uploadFile(coverFile, "covers") : Promise.resolve(""),
        uploadFile(ebookFile, "files"),
      ]);
      const { error } = await supabase.from("ebooks").insert([{
        title: form.title,
        author: form.author,
        description: form.description,
        genre: form.genre,
        cover_url: coverUrl,
        file_url: fileUrl,
        is_free: form.is_free,
        price: form.is_free ? 0 : form.price,
        read_count: 0,
        uploaded_by: user.id,
      }]);
      if (error) throw error;
      toast({ title: "Published", description: `"${form.title}" is live.` });
      setIsCreateOpen(false);
      resetCreateForm();
      fetchMyEbooks();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this ebook? This cannot be undone.")) return;
    try {
      const { error } = await supabase.from("ebooks").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Deleted", description: "Ebook removed." });
      fetchMyEbooks();
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const totalReads = ebooks.reduce((a, e) => a + (e.read_count || 0), 0);
  const paidEbooks = ebooks.filter(e => !e.is_free);
  const estimatedRevenue = paidEbooks.reduce((a, e) => a + (e.price || 0) * (e.read_count || 0) * 0.8, 0); // 80% after 20% commission

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Ebooks</h2>
          <p className="text-sm text-gray-500">Publish and manage your ebooks on BARA</p>
        </div>
        <Button onClick={() => { resetCreateForm(); setIsCreateOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Publish Ebook
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <BookOpen className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{ebooks.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reads</CardTitle>
            <BookOpenCheck className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalReads.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Est. Revenue (coins)</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{Math.round(estimatedRevenue).toLocaleString()}</div></CardContent>
        </Card>
      </div>

      {/* Revenue info */}
      {paidEbooks.length > 0 && (
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">
              You earn <strong>80%</strong> of paid ebook sales. BARA takes a 20% platform commission.
              Revenue shown is estimated based on reads of paid content — purchases aren't live yet, so this is a preview of what you'd earn.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Ebooks List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading your ebooks...</div>
          ) : ebooks.length === 0 ? (
            <div className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700 mb-1">No ebooks yet</h3>
              <p className="text-sm text-gray-500 mb-4">Publish your first ebook on BARA</p>
              <Button onClick={() => { resetCreateForm(); setIsCreateOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Publish Your First Ebook
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {ebooks.map(ebook => (
                <div key={ebook.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                  <div className="h-16 w-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                    {ebook.cover_url ? (
                      <img loading="lazy" src={ebook.cover_url} alt={ebook.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center"><BookOpen className="h-5 w-5 text-gray-300" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{ebook.title}</p>
                    <p className="text-sm text-gray-500">{ebook.genre}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <BookOpenCheck className="h-3 w-3" /> {ebook.read_count || 0}
                    </div>
                  </div>
                  <div>
                    {ebook.is_free ? (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">FREE</span>
                    ) : (
                      <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{ebook.price} coins</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{new Date(ebook.created_at).toLocaleDateString()}</span>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(ebook.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Publish Ebook Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Publish an Ebook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Author *</Label><Input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div>
              <Label>Genre</Label>
              <Select value={form.genre} onValueChange={v => setForm({ ...form, genre: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cover Image</Label>
              <div className="mt-1">
                {coverPreview ? (
                  <div className="relative inline-block">
                    <img loading="lazy" src={coverPreview} alt="Cover preview" className="w-20 h-28 rounded object-cover border" />
                    <button onClick={() => { setCoverFile(null); setCoverPreview(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X className="h-3 w-3" /></button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-gray-400 transition">
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-500">Click to upload cover image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) { setCoverFile(file); setCoverPreview(URL.createObjectURL(file)); }
                    }} />
                  </label>
                )}
              </div>
            </div>
            <div>
              <Label>Ebook File (PDF / EPUB) *</Label>
              <label className="flex items-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-gray-400 transition mt-1">
                <Upload className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-500">{ebookFile ? ebookFile.name : "Click to upload your ebook file"}</span>
                <input type="file" accept=".pdf,.epub" className="hidden" onChange={e => setEbookFile(e.target.files?.[0] || null)} />
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={form.is_free} onCheckedChange={(v) => setForm({ ...form, is_free: !!v, price: v ? 0 : form.price })} id="ebook-free" />
              <Label htmlFor="ebook-free">Free to read</Label>
            </div>
            {!form.is_free && (
              <div>
                <Label>Price (in Bara Coins)</Label>
                <Input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: parseInt(e.target.value) || 0 })} placeholder="e.g. 50" />
                <p className="text-xs text-gray-400 mt-1">Purchases aren't live yet — this sets your price for when payments launch.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={creating}>Cancel</Button>
            <Button onClick={handleCreateEbook} disabled={creating}>
              {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Publishing...</> : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
