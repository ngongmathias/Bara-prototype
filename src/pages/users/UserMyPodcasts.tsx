import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Mic2, Users, Headphones, Plus, Trash2, Upload, Loader2, X, ListMusic } from "lucide-react";

interface MyPodcast {
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

interface Episode {
  id: string;
  podcast_id: string;
  title: string;
  description: string;
  audio_url: string;
  duration: number;
  episode_number: number;
  season_number: number;
  play_count: number;
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

export const UserMyPodcasts = () => {
  const { user } = useUser();
  const [podcasts, setPodcasts] = useState<MyPodcast[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Create podcast
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", category: "Entrepreneurship" });

  // Episode management
  const [managingPodcast, setManagingPodcast] = useState<MyPodcast | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [episodeToDelete, setEpisodeToDelete] = useState<string | null>(null);
  const [savingEpisode, setSavingEpisode] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [episodeForm, setEpisodeForm] = useState({ title: "", description: "", episode_number: 1, season_number: 1, duration: 0 });

  useEffect(() => {
    if (user?.id) fetchMyPodcasts();
  }, [user?.id]);

  const fetchMyPodcasts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .eq("uploaded_by", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPodcasts(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resetCreateForm = () => {
    setForm({ title: "", description: "", category: "Entrepreneurship" });
    setCoverFile(null);
    setCoverPreview(null);
  };

  const handleCreatePodcast = async () => {
    if (!user || !form.title) {
      toast({ title: "Error", description: "Title is required.", variant: "destructive" });
      return;
    }
    try {
      setCreating(true);
      const cover_url = coverFile ? await uploadFile(coverFile, "covers") : "";
      const { error } = await supabase.from("podcasts").insert([{
        title: form.title,
        host: user.fullName || user.username || "Unknown Host",
        description: form.description,
        category: form.category,
        cover_url,
        subscriber_count: 0,
        uploaded_by: user.id,
        is_seed: false,
      }]);
      if (error) throw error;
      toast({ title: "Show created", description: `"${form.title}" is live.` });
      setIsCreateOpen(false);
      resetCreateForm();
      fetchMyPodcasts();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this podcast? All episodes will also be deleted.")) return;
    try {
      const { error } = await supabase.from("podcasts").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Deleted", description: "Podcast removed." });
      fetchMyPodcasts();
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const openManageEpisodes = async (p: MyPodcast) => {
    setManagingPodcast(p);
    setEpisodesLoading(true);
    const { data } = await supabase.from("podcast_episodes").select("*").eq("podcast_id", p.id).order("episode_number", { ascending: false });
    setEpisodes(data || []);
    setEpisodesLoading(false);
  };

  const resetEpisodeForm = () => {
    setEpisodeForm({ title: "", description: "", episode_number: episodes.length + 1, season_number: 1, duration: 0 });
    setAudioFile(null);
  };

  const handleAddEpisode = async () => {
    if (!managingPodcast || !user || !episodeForm.title || !audioFile) {
      toast({ title: "Error", description: "Title and audio file are required.", variant: "destructive" });
      return;
    }
    try {
      setSavingEpisode(true);
      const audio_url = await uploadFile(audioFile, `episodes/${managingPodcast.id}`);
      const { error } = await supabase.from("podcast_episodes").insert([{
        podcast_id: managingPodcast.id,
        title: episodeForm.title,
        description: episodeForm.description,
        audio_url,
        duration: episodeForm.duration,
        episode_number: episodeForm.episode_number,
        season_number: episodeForm.season_number,
        uploaded_by: user.id,
      }]);
      if (error) throw error;
      toast({ title: "Episode added", description: `"${episodeForm.title}" uploaded.` });
      resetEpisodeForm();
      const { data } = await supabase.from("podcast_episodes").select("*").eq("podcast_id", managingPodcast.id).order("episode_number", { ascending: false });
      setEpisodes(data || []);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSavingEpisode(false);
    }
  };

  const handleDeleteEpisode = async () => {
    if (!episodeToDelete) return;
    try {
      const { error } = await supabase.from("podcast_episodes").delete().eq("id", episodeToDelete);
      if (error) throw error;
      setEpisodes(prev => prev.filter(e => e.id !== episodeToDelete));
      toast({ title: "Deleted", description: "Episode removed." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setEpisodeToDelete(null);
    }
  };

  const totalSubscribers = podcasts.reduce((a, p) => a + (p.subscriber_count || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Podcasts</h2>
          <p className="text-sm text-gray-500">Create shows and publish episodes to BARA Streams</p>
        </div>
        <Button onClick={() => { resetCreateForm(); setIsCreateOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> New Show
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Shows</CardTitle>
            <Mic2 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{podcasts.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalSubscribers.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Headphones className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{new Set(podcasts.map(p => p.category)).size}</div></CardContent>
        </Card>
      </div>

      {/* Podcasts List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading your podcasts...</div>
          ) : podcasts.length === 0 ? (
            <div className="p-8 text-center">
              <Mic2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700 mb-1">No podcasts yet</h3>
              <p className="text-sm text-gray-500 mb-4">Start your podcast journey on BARA</p>
              <Button onClick={() => { resetCreateForm(); setIsCreateOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Create Your First Show
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {podcasts.map(podcast => (
                <div key={podcast.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                  <div className="h-14 w-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {podcast.cover_url ? (
                      <img loading="lazy" src={podcast.cover_url} alt={podcast.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center"><Mic2 className="h-6 w-6 text-gray-300" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{podcast.title}</p>
                    <p className="text-sm text-gray-500">{podcast.category}</p>
                    <p className="text-xs text-gray-400 truncate">{podcast.description}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="h-3 w-3" /> {podcast.subscriber_count || 0}
                    </div>
                    <p className="text-[10px] text-gray-400">subscribers</p>
                  </div>
                  {podcast.is_featured && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">FEATURED</span>}
                  <Button variant="outline" size="sm" onClick={() => openManageEpisodes(podcast)}>
                    <ListMusic className="h-4 w-4 mr-1" /> Episodes
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(podcast.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Podcast Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Podcast Show</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cover Image</Label>
              <div className="mt-1">
                {coverPreview ? (
                  <div className="relative inline-block">
                    <img loading="lazy" src={coverPreview} alt="Cover preview" className="w-20 h-20 rounded-md object-cover border" />
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={creating}>Cancel</Button>
            <Button onClick={handleCreatePodcast} disabled={creating}>
              {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Show"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Episodes */}
      <Dialog open={!!managingPodcast} onOpenChange={(open) => { if (!open) { setManagingPodcast(null); resetEpisodeForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Episodes — {managingPodcast?.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {episodesLoading ? (
              <div className="text-center py-8 text-gray-500">Loading episodes...</div>
            ) : episodes.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">No episodes yet — add your first one below.</div>
            ) : (
              episodes.map(ep => (
                <div key={ep.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Headphones className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">S{ep.season_number}E{ep.episode_number} — {ep.title}</p>
                    <p className="text-xs text-gray-500">{ep.play_count?.toLocaleString() || 0} plays</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setEpisodeToDelete(ep.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-4 mt-2 space-y-3">
            <h4 className="font-semibold text-sm">Add Episode</h4>
            <div><Label>Title *</Label><Input value={episodeForm.title} onChange={e => setEpisodeForm({ ...episodeForm, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={episodeForm.description} onChange={e => setEpisodeForm({ ...episodeForm, description: e.target.value })} rows={2} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Season</Label><Input type="number" min={1} value={episodeForm.season_number} onChange={e => setEpisodeForm({ ...episodeForm, season_number: Number(e.target.value) })} /></div>
              <div><Label>Episode #</Label><Input type="number" min={1} value={episodeForm.episode_number} onChange={e => setEpisodeForm({ ...episodeForm, episode_number: Number(e.target.value) })} /></div>
              <div><Label>Duration (sec)</Label><Input type="number" min={0} value={episodeForm.duration} onChange={e => setEpisodeForm({ ...episodeForm, duration: Number(e.target.value) })} /></div>
            </div>
            <div>
              <Label>Audio File *</Label>
              <label className="flex items-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-gray-400 transition mt-1">
                <Upload className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-500">{audioFile ? audioFile.name : "Click to upload episode audio"}</span>
                <input type="file" accept="audio/*" className="hidden" onChange={e => setAudioFile(e.target.files?.[0] || null)} />
              </label>
            </div>
            <Button onClick={handleAddEpisode} disabled={savingEpisode} className="w-full">
              {savingEpisode ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</> : "Add Episode"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!episodeToDelete} onOpenChange={() => setEpisodeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Episode?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEpisode} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
