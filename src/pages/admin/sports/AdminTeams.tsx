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
    Plus, Search, Edit, Trash2, Users, Star, Trophy, Upload, Loader2, X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { COUNTRIES } from "@/lib/constants";

interface Team {
    id: string;
    name: string;
    short_name: string;
    logo_url: string;
    sport: string;
    league_id: string | null;
    country: string;
    stadium: string;
    founded_year: number | null;
    description: string;
    website: string;
    social_links: Record<string, string>;
    is_featured: boolean;
    created_at: string;
}

interface League {
    id: string;
    name: string;
    sport: string;
}

const SPORTS = ["Football", "Basketball", "Rugby", "Tennis", "Cricket", "Athletics", "Swimming", "Boxing", "Volleyball", "Handball"];

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

export const AdminTeams = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [leagues, setLeagues] = useState<League[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
    const [tableExists, setTableExists] = useState(true);
    const { toast } = useToast();

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "", short_name: "", sport: "Football", league_id: "",
        country: "", stadium: "", founded_year: null as number | null,
        description: "", website: "", is_featured: false,
        social_twitter: "", social_instagram: "", social_facebook: "",
    });

    useEffect(() => { fetchTeams(); fetchLeagues(); }, []);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("teams")
                .select("*, leagues(name)")
                .order("created_at", { ascending: false });
            if (error) {
                if (error.code === "42P01" || error.message?.includes("does not exist")) {
                    setTableExists(false);
                }
                console.error(error);
                return;
            }
            setTeams(data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchLeagues = async () => {
        try {
            const { data } = await supabase.from("leagues").select("id, name, sport").order("name");
            if (data) setLeagues(data);
        } catch {}
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast({ title: "Error", description: "Team name is required.", variant: "destructive" });
            return;
        }
        try {
            setUploading(true);
            let logoUrl = editingTeam?.logo_url || "";
            if (logoFile) logoUrl = await uploadFile(logoFile, "team-logos");

            const teamData = {
                name: formData.name,
                short_name: formData.short_name,
                logo_url: logoUrl,
                sport: formData.sport,
                league_id: formData.league_id || null,
                country: formData.country,
                stadium: formData.stadium,
                founded_year: formData.founded_year,
                description: formData.description,
                website: formData.website,
                is_featured: formData.is_featured,
                social_links: {
                    twitter: formData.social_twitter,
                    instagram: formData.social_instagram,
                    facebook: formData.social_facebook,
                },
            };

            if (editingTeam) {
                const { error } = await supabase.from("teams").update(teamData).eq("id", editingTeam.id);
                if (error) throw error;
                toast({ title: "Updated", description: `"${teamData.name}" updated.` });
            } else {
                const { error } = await supabase.from("teams").insert([teamData]);
                if (error) throw error;
                toast({ title: "Created", description: `"${teamData.name}" created.` });
            }
            setIsDialogOpen(false);
            resetForm();
            fetchTeams();
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!teamToDelete) return;
        try {
            const { error } = await supabase.from("teams").delete().eq("id", teamToDelete);
            if (error) throw error;
            toast({ title: "Deleted", description: "Team deleted." });
            setTeamToDelete(null);
            fetchTeams();
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        }
    };

    const openEdit = (t: Team) => {
        setEditingTeam(t);
        setFormData({
            name: t.name, short_name: t.short_name || "", sport: t.sport || "Football",
            league_id: t.league_id || "", country: t.country || "", stadium: t.stadium || "",
            founded_year: t.founded_year, description: t.description || "", website: t.website || "",
            is_featured: t.is_featured || false,
            social_twitter: t.social_links?.twitter || "",
            social_instagram: t.social_links?.instagram || "",
            social_facebook: t.social_links?.facebook || "",
        });
        if (t.logo_url) setLogoPreview(t.logo_url);
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingTeam(null);
        setFormData({
            name: "", short_name: "", sport: "Football", league_id: "",
            country: "", stadium: "", founded_year: null,
            description: "", website: "", is_featured: false,
            social_twitter: "", social_instagram: "", social_facebook: "",
        });
        setLogoFile(null);
        setLogoPreview(null);
    };

    const filteredLeagues = leagues.filter(l => l.sport === formData.sport);

    const filtered = teams.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.sport?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!tableExists) {
        return (
            <AdminLayout title="Teams" subtitle="Manage sports teams">
                <div className="p-6">
                    <Card><CardContent className="p-8 text-center">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Teams Table Not Found</h3>
                        <p className="text-gray-500 text-sm">Run the sports management migration SQL in your Supabase SQL Editor.</p>
                    </CardContent></Card>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Teams" subtitle="Manage sports teams and clubs">
            <div className="p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{teams.length}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Featured</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{teams.filter(t => t.is_featured).length}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sports</CardTitle>
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{new Set(teams.map(t => t.sport)).size}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Countries</CardTitle>
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{new Set(teams.map(t => t.country).filter(Boolean)).size}</div></CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Search teams..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                    </div>
                    <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                        <Plus className="h-4 w-4 mr-2" /> Add Team
                    </Button>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Team</TableHead>
                                    <TableHead>Sport</TableHead>
                                    <TableHead>League</TableHead>
                                    <TableHead>Country</TableHead>
                                    <TableHead>Stadium</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">Loading...</TableCell></TableRow>
                                ) : filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No teams found</TableCell></TableRow>
                                ) : filtered.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {t.logo_url ? (
                                                    <img loading="lazy" src={t.logo_url} alt={t.name} className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><Users className="h-4 w-4 text-gray-400" /></div>
                                                )}
                                                <div>
                                                    <span className="font-medium">{t.name}</span>
                                                    {t.short_name && <span className="text-xs text-gray-400 ml-1">({t.short_name})</span>}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell><span className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">{t.sport}</span></TableCell>
                                        <TableCell>{(t as any).leagues?.name || "—"}</TableCell>
                                        <TableCell>{t.country || "—"}</TableCell>
                                        <TableCell className="text-sm text-gray-500">{t.stadium || "—"}</TableCell>
                                        <TableCell>
                                            {t.is_featured && <span className="text-green-600 font-bold text-[10px]">FEATURED</span>}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => openEdit(t)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setTeamToDelete(t.id)}><Trash2 className="h-4 w-4" /></Button>
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
                        <DialogTitle>{editingTeam ? "Edit Team" : "Add New Team"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Team Name *</Label><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                            <div><Label>Short Name</Label><Input value={formData.short_name} onChange={e => setFormData({ ...formData, short_name: e.target.value })} placeholder="e.g. MAN UTD" /></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Sport</Label>
                                <Select value={formData.sport} onValueChange={v => setFormData({ ...formData, sport: v, league_id: "" })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {SPORTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>League</Label>
                                <Select value={formData.league_id} onValueChange={v => setFormData({ ...formData, league_id: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select league" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No League</SelectItem>
                                        {filteredLeagues.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
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
                            <div><Label>Stadium</Label><Input value={formData.stadium} onChange={e => setFormData({ ...formData, stadium: e.target.value })} /></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Founded Year</Label><Input type="number" value={formData.founded_year || ""} onChange={e => setFormData({ ...formData, founded_year: parseInt(e.target.value) || null })} placeholder="e.g. 1902" /></div>
                            <div><Label>Website</Label><Input value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} placeholder="https://..." /></div>
                        </div>

                        <div><Label>Description</Label><Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>

                        {/* Logo Upload */}
                        <div>
                            <Label>Team Logo</Label>
                            <div className="mt-1">
                                {logoPreview ? (
                                    <div className="relative inline-block">
                                        <img loading="lazy" src={logoPreview} alt="Logo preview" className="w-16 h-16 rounded-full object-cover border" />
                                        <button onClick={() => { setLogoFile(null); setLogoPreview(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X className="h-3 w-3" /></button>
                                    </div>
                                ) : (
                                    <label className="flex items-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-gray-400 transition">
                                        <Upload className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm text-gray-500">Click to upload team logo</span>
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

                        {/* Social Links */}
                        <div>
                            <Label className="text-sm font-medium mb-2 block">Social Media Links</Label>
                            <div className="grid grid-cols-3 gap-3">
                                <Input value={formData.social_twitter} onChange={e => setFormData({ ...formData, social_twitter: e.target.value })} placeholder="Twitter/X URL" />
                                <Input value={formData.social_instagram} onChange={e => setFormData({ ...formData, social_instagram: e.target.value })} placeholder="Instagram URL" />
                                <Input value={formData.social_facebook} onChange={e => setFormData({ ...formData, social_facebook: e.target.value })} placeholder="Facebook URL" />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox checked={formData.is_featured} onCheckedChange={(v) => setFormData({ ...formData, is_featured: !!v })} id="team-featured" />
                            <Label htmlFor="team-featured">Featured Team</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={uploading}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={uploading}>
                            {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</> : (editingTeam ? "Update" : "Create")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!teamToDelete} onOpenChange={() => setTeamToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Team?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete this team and remove it from all leagues and tournaments.</AlertDialogDescription>
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
