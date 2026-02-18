import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { Loader2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function AdminSportsNews() {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("General");
    const [author, setAuthor] = useState("Bara Sports");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('sports_news')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching news:', error);
            toast.error('Failed to load news');
        } else {
            setNews(data || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const { error } = await supabase
            .from('sports_news')
            .insert([{ title, category, author }]);

        if (error) {
            toast.error('Failed to add news');
            console.error(error);
        } else {
            toast.success('News added successfully');
            setTitle("");
            fetchNews();
        }
        setSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this news item?')) return;

        const { error } = await supabase
            .from('sports_news')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error('Failed to delete news');
        } else {
            toast.success('News deleted');
            setNews(news.filter(n => n.id !== id));
        }
    };

    return (
        <AdminLayout title="Manage News" subtitle="Add and manage sports news articles">
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Add News Article</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter headline"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full p-2 border rounded-md bg-transparent"
                                >
                                    <option value="General">General</option>
                                    <option value="PSL">PSL</option>
                                    <option value="EPL">EPL</option>
                                    <option value="UCL">Champions League</option>
                                    <option value="Transfers">Transfers</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Author</Label>
                                <Input
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    placeholder="Author Name"
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" /> Publish News</>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* List */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent News</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                        ) : news.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No news articles yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {news.map((item) => (
                                    <div key={item.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50">
                                        <div>
                                            <h3 className="font-semibold">{item.title}</h3>
                                            <div className="text-sm text-gray-500 mt-1">
                                                <span className="text-red-500 font-medium">{item.category}</span> • {item.author} • {new Date(item.created_at).toLocaleDateString()}
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
