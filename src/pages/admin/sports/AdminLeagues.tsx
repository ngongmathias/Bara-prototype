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
    Plus, Search, Edit, Trash2, Trophy, Globe, Activity, Upload, Loader2, X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { COUNTRIES } from "@/lib/constants";

interface League {
    id: string;
    name: string;
    short_name: string;
    logo_url: string;
    sport: string;
    country: string;
    region: string;
    season: string;
    tier: number;
    description: string;
    is_active: boolean;
    created_at: string;
}

const SPORTS = ["Football", "Basketball", "Rugby", "Tennis", "Cricket", "Athletics", "Swimming", "Boxing", "Volleyball", "Handball"];
const REGIONS = ["Africa", "Europe", "North America", "South America", "Asia", "Oceania", "Global"];

const BUCKET = "sports";

async function uploadFile(file: File, folder: string): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    const { error } = await supabase.storage.from(BUCKET).upload(filePath, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return publicUrl;
}

export const AdminLeagues = () => {
    const [leagues, setLeagues] = useState<League[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLeague, setEditingLeague] = useState<League | null>(null);
    const [leagueToDelete, setLeagueToDelete] = useState<string | null>(null);
    const [tableExists, setTableExists] = useState(true);
    const { toast } = useToast();

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "", short_name: "", sport: "Football", country: "",
        region: "Africa", season: "", tier: 1, description: "", is_active: true,
    });

    useEffect(() => { fetchLeagues(); }, []);

    const fetchLeagues = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from("leagues").select("*").order("created_at", { ascending: false });
            if (error) {
                if (error.code === "42P01" || error.message?.includes("does not exist")) setTableExists(false);
                console.error(error);
                return;
            }
            setLeagues(data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast({ title: "Error", description: "League name is required.", variant: "destructive" });
            return;
        }
        try {
            setUploading(true);
            let logoUrl = editingLeague?.logo_url || "";
            if (logoFile) logoUrl = await uploadFile(logoFile, "league-logos");

            const leagueData = { ...formData, logo_url: logoUrl };

            if (editingLeague) {
                const { error } = await supabase.from("leagues").update(leagueData).eq("id", editingLeague.id);
                if (error) throw error;
                toast({ title: "Updated", description: `"${leagueData.name}" updated.` });
            } else {
                const { error } = await supabase.from("leagues").insert([leagueData]);
                if (error) throw error;
                toast({ title: "Created", description: `"${leagueData.name}" created.` });
            }
            setIsDialogOpen(false);
            resetForm();
            fetchLeagues();
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!leagueToDelete) return;
        try {
            const { error } = await supabase.from("leagues").delete().eq("id", leagueToDelete);
            if (error) throw error;
            toast({ title: "Deleted", description: "League deleted." });
            setLeagueToDelete(null);
            fetchLeagues();
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        }
    };

    const openEdit = (l: League) => {
        setEditingLeague(l);
        setFormData({
            name: l.name, short_name: l.short_name || "", sport: l.sport || "Football",
            country: l.country || "", region: l.region || "Africa",
            season: l.season || "", tier: l.tier || 1,
            description: l.description || "", is_active: l.is_active ?? true,
        });
        if (l.logo_url) setLogoPreview(l.logo_url);
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingLeague(null);
        setFormData({
            name: "", short_name: "", sport: "Football", country: "",
            region: "Africa", season: "", tier: 1, description: "", is_active: true,
        });
        setLogoFile(null);
        setLogoPreview(null);
    };

    const filtered = leagues.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.sport?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.country?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!tableExists) {
        return (
            <AdminLayout title="Leagues" subtitle="Manage leagues & competitions">
                <div className="p-6">
                    <Card><CardContent className="p-8 text-center">
                        <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Leagues Table Not Found</h3>
                        <p className="text-gray-500 text-sm">Run the sports management migration SQL in your Supabase SQL Editor.</p>
                    </CardContent></Card>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Leagues" subtitle="Manage leagues and competitions">
            <div className="p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Leagues</CardTitle>
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{leagues.length}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{leagues.filter(l => l.is_active).length}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sports</CardTitle>
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{new Set(leagues.map(l => l.sport)).size}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Regions</CardTitle>
                            <Globe className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{new Set(leagues.map(l => l.region).filter(Boolean)).size}</div></CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Search leagues..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                    </div>
                    <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                        <Plus className="h-4 w-4 mr-2" /> Add League
                    </Button>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>League</TableHead>
                                    <TableHead>Sport</TableHead>
                                    <TableHead>Country</TableHead>
                                    <TableHead>Region</TableHead>
                                    <TableHead>Season</TableHead>
                                    <TableHead>Tier</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">Loading...</TableCell></TableRow>
                                ) : filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">No leagues found</TableCell></TableRow>
                                ) : filtered.map(l => (
                                    <TableRow key={l.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {l.logo_url ? (
                                                    <img src={l.logo_url} alt={l.name} className="w-8 h-8 rounded object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center"><Trophy className="h-4 w-4 text-gray-400" /></div>
                                                )}
                                                <div>
                                                    <span className="font-medium">{l.name}</span>
                                                    {l.short_name && <span className="text-xs text-gray-400 ml-1">({l.short_name})</span>}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell><span className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">{l.sport}</span></TableCell>
                                        <TableCell>{l.country || "—"}</TableCell>
                                        <TableCell>{l.region || "—"}</TableCell>
                                        <TableCell>{l.season || "—"}</TableCell>
                                        <TableCell>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${l.tier === 1 ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                                Tier {l.tier}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`text-[10px] font-bold ${l.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                                {l.is_active ? "ACTIVE" : "INACTIVE"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => openEdit(l)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setLeagueToDelete(l.id)}><Trash2 className="h-4 w-4" /></Button>
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
                        <DialogTitle>{editingLeague ? "Edit League" : "Add New League"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>League Name *</Label><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                            <div><Label>Short Name</Label><Input value={formData.short_name} onChange={e => setFormData({ ...formData, short_name: e.target.value })} placeholder="e.g. EPL" /></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Sport</Label>
                                <Select value={formData.sport} onValueChange={v => setFormData({ ...formData, sport: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {SPORTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Country</Label>
                                <Select value={formData.country} onValueChange={v => setFormData({ ...formData, country: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                                    <SelectContent>
                                        {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label>Region</Label>
                                <Select value={formData.region} onValueChange={v => setFormData({ ...formData, region: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div><Label>Season</Label><Input value={formData.season} onChange={e => setFormData({ ...formData, season: e.target.value })} placeholder="e.g. 2025-26" /></div>
                            <div><Label>Tier</Label><Input type="number" min="1" max="5" value={formData.tier} onChange={e => setFormData({ ...formData, tier: parseInt(e.target.value) || 1 })} /></div>
                        </div>

                        <div><Label>Description</Label><Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>

                        {/* Logo Upload */}
                        <div>
                            <Label>League Logo</Label>
                            <div className="mt-1">
                                {logoPreview ? (
                                    <div className="relative inline-block">
                                        <img src={logoPreview} alt="Logo preview" className="w-16 h-16 rounded object-cover border" />
                                        <button onClick={() => { setLogoFile(null); setLogoPreview(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X className="h-3 w-3" /></button>
                                    </div>
                                ) : (
                                    <label className="flex items-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-gray-400 transition">
                                        <Upload className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm text-gray-500">Click to upload league logo</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setLogoFile(file);
                                                setLogoPreview(URL.createObjectURL(file));
                                            }
                                        }} />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: !!v })} id="league-active" />
                            <Label htmlFor="league-active">Active League</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={uploading}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={uploading}>
                            {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</> : (editingLeague ? "Update" : "Create")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!leagueToDelete} onOpenChange={() => setLeagueToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete League?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete this league. Teams in this league will have their league reference removed.</AlertDialogDescription>
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
