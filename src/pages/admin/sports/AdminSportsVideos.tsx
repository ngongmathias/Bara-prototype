import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Loader2, Trash2, Plus, Video } from "lucide-react";
import { toast } from "sonner";
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';


export default function AdminSportsVideos() {
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [duration, setDuration] = useState("");
    const [league, setLeague] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('sports_videos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching videos:', error);
            toast.error('Failed to load videos');
        } else {
            setVideos(data || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const { error } = await supabase
            .from('sports_videos')
            .insert([{
                title,
                duration,
                league,
                video_url: 'https://youtube.com', // Placeholder
                is_live: false
            }]);

        if (error) {
            toast.error('Failed to add video');
            console.error(error);
        } else {
            toast.success('Video added successfully');
            setTitle("");
            setDuration("");
            setLeague("");
            fetchVideos();
        }
        setSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this video?')) return;

        const { error } = await supabase
            .from('sports_videos')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error('Failed to delete video');
        } else {
            toast.success('Video deleted');
            setVideos(videos.filter(v => v.id !== id));
        }
    };

    return (
        <AdminLayout title="Manage Videos" subtitle="Add and manage sports highlights">
        <div className="mb-4 w-full flex justify-end">
          <AdminPageGuide 
            title="Sports Highlights"
            description="Manage YouTube and MP4 embeds for sports replays."
            features={["Review video links", "Delete dead links", "Tag teams or leagues"]}
            workflow={["Click broken link report", "Update URL or Delete the video entry"]}
          />
        </div>
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Add New Video</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Video Title</Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Highlights: CHE vs ARS"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Duration</Label>
                                <Input
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    placeholder="e.g. 10:24"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>League / Competition</Label>
                                <Input
                                    value={league}
                                    onChange={(e) => setLeague(e.target.value)}
                                    placeholder="e.g. Premier League"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" /> Add Video</>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* List */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Videos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                        ) : videos.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No videos found.</p>
                        ) : (
                            <div className="space-y-4">
                                {videos.map((item) => (
                                    <div key={item.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50">
                                        <div className="flex gap-4">
                                            <div className="w-24 h-16 bg-gray-200 rounded flex items-center justify-center">
                                                <Video className="text-gray-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{item.title}</h3>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {item.league} • {item.duration}
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
