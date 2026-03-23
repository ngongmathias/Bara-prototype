import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Download, DollarSign, Trash2, Eye } from "lucide-react";

interface MyEbook {
  id: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  cover_url: string;
  is_free: boolean;
  price: number;
  download_count: number;
  created_at: string;
}

export const UserMyEbooks = () => {
  const { user } = useUser();
  const [ebooks, setEbooks] = useState<MyEbook[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

      if (error) {
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          setLoading(false);
          return;
        }
        throw error;
      }
      setEbooks(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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

  const totalDownloads = ebooks.reduce((a, e) => a + (e.download_count || 0), 0);
  const paidEbooks = ebooks.filter(e => !e.is_free);
  const estimatedRevenue = paidEbooks.reduce((a, e) => a + (e.price || 0) * (e.download_count || 0) * 0.8, 0); // 80% after 20% commission

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Ebooks</h2>
          <p className="text-sm text-gray-500">Manage your published ebooks</p>
        </div>
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
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalDownloads.toLocaleString()}</div></CardContent>
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
              Revenue shown is estimated based on downloads of paid content.
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
              <p className="text-xs text-gray-400">Contact admin to publish, or use the Creator Portal when available.</p>
            </div>
          ) : (
            <div className="divide-y">
              {ebooks.map(ebook => (
                <div key={ebook.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                  <div className="h-16 w-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                    {ebook.cover_url ? (
                      <img src={ebook.cover_url} alt={ebook.title} className="h-full w-full object-cover" />
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
                      <Download className="h-3 w-3" /> {ebook.download_count || 0}
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
    </div>
  );
};
