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
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Plus, Search, Edit, Trash2, Trophy, Calendar, Users, Upload, Loader2, X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Tournament {
    id: string;
    name: string;
    logo_url: string;
    sport: string;
    format: string;
    start_date: string | null;
    end_date: string | null;
    prize_info: string;
    status: string;
    description: string;
    created_at: string;
    team_count?: number;
}

interface Team {
    id: string;
    name: string;
    logo_url: string;
}

interface TournamentTeam {
    id: string;
    team_id: string;
    group_name: string;
    seed: number | null;
    teams: Team;
}

const SPORTS = ["Football", "Basketball", "Rugby", "Tennis", "Cricket", "Athletics", "Swimming", "Boxing", "Volleyball", "Handball"];
const FORMATS = ["knockout", "league", "group_stage", "round_robin", "swiss", "double_elimination"];
const STATUSES = ["upcoming", "in_progress", "completed", "cancelled"];

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

export const AdminTournaments = () => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [allTeams, setAllTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isTeamsDialogOpen, setIsTeamsDialogOpen] = useState(false);
    const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
    const [tournamentToDelete, setTournamentToDelete] = useState<string | null>(null);
    const [tableExists, setTableExists] = useState(true);
    const { toast } = useToast();

    // Teams management for a tournament
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
    const [tournamentTeams, setTournamentTeams] = useState<TournamentTeam[]>([]);
    const [addTeamId, setAddTeamId] = useState("");
    const [addGroupName, setAddGroupName] = useState("");
    const [addSeed, setAddSeed] = useState<number | null>(null);

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "", sport: "Football", format: "knockout",
        start_date: "", end_date: "", prize_info: "",
        status: "upcoming", description: "",
    });

    useEffect(() => { fetchTournaments(); fetchAllTeams(); }, []);

    const fetchTournaments = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from("tournaments").select("*").order("created_at", { ascending: false });
            if (error) {
                if (error.code === "42P01" || error.message?.includes("does not exist")) setTableExists(false);
                console.error(error);
                return;
            }

            // Get team counts
            const { data: teamCounts } = await supabase
                .from("tournament_teams")
                .select("tournament_id");

            const countMap: Record<string, number> = {};
            teamCounts?.forEach(tc => {
                countMap[tc.tournament_id] = (countMap[tc.tournament_id] || 0) + 1;
            });

            setTournaments((data || []).map(t => ({ ...t, team_count: countMap[t.id] || 0 })));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchAllTeams = async () => {
        try {
            const { data } = await supabase.from("teams").select("id, name, logo_url").order("name");
            if (data) setAllTeams(data);
        } catch {}
    };

    const fetchTournamentTeams = async (tournamentId: string) => {
        try {
            const { data } = await supabase
                .from("tournament_teams")
                .select("id, team_id, group_name, seed, teams(id, name, logo_url)")
                .eq("tournament_id", tournamentId)
                .order("group_name");
            setTournamentTeams((data as any) || []);
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast({ title: "Error", description: "Tournament name is required.", variant: "destructive" });
            return;
        }
        try {
            setUploading(true);
            let logoUrl = editingTournament?.logo_url || "";
            if (logoFile) logoUrl = await uploadFile(logoFile, "tournament-logos");

            const tournamentData = {
                ...formData,
                logo_url: logoUrl,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
            };

            if (editingTournament) {
                const { error } = await supabase.from("tournaments").update(tournamentData).eq("id", editingTournament.id);
                if (error) throw error;
                toast({ title: "Updated", description: `"${tournamentData.name}" updated.` });
            } else {
                const { error } = await supabase.from("tournaments").insert([tournamentData]);
                if (error) throw error;
                toast({ title: "Created", description: `"${tournamentData.name}" created.` });
            }
            setIsDialogOpen(false);
            resetForm();
            fetchTournaments();
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!tournamentToDelete) return;
        try {
            const { error } = await supabase.from("tournaments").delete().eq("id", tournamentToDelete);
            if (error) throw error;
            toast({ title: "Deleted", description: "Tournament deleted." });
            setTournamentToDelete(null);
            fetchTournaments();
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        }
    };

    const handleAddTeam = async () => {
        if (!selectedTournament || !addTeamId) return;
        try {
            const { error } = await supabase.from("tournament_teams").insert([{
                tournament_id: selectedTournament.id,
                team_id: addTeamId,
                group_name: addGroupName || null,
                seed: addSeed,
            }]);
            if (error) throw error;
            toast({ title: "Added", description: "Team added to tournament." });
            setAddTeamId("");
            setAddGroupName("");
            setAddSeed(null);
            fetchTournamentTeams(selectedTournament.id);
            fetchTournaments();
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        }
    };

    const handleRemoveTeam = async (ttId: string) => {
        if (!selectedTournament) return;
        try {
            const { error } = await supabase.from("tournament_teams").delete().eq("id", ttId);
            if (error) throw error;
            toast({ title: "Removed", description: "Team removed from tournament." });
            fetchTournamentTeams(selectedTournament.id);
            fetchTournaments();
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        }
    };

    const openTeamsDialog = (t: Tournament) => {
        setSelectedTournament(t);
        fetchTournamentTeams(t.id);
        setIsTeamsDialogOpen(true);
    };

    const openEdit = (t: Tournament) => {
        setEditingTournament(t);
        setFormData({
            name: t.name, sport: t.sport || "Football", format: t.format || "knockout",
            start_date: t.start_date || "", end_date: t.end_date || "",
            prize_info: t.prize_info || "", status: t.status || "upcoming",
            description: t.description || "",
        });
        if (t.logo_url) setLogoPreview(t.logo_url);
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingTournament(null);
        setFormData({
            name: "", sport: "Football", format: "knockout",
            start_date: "", end_date: "", prize_info: "",
            status: "upcoming", description: "",
        });
        setLogoFile(null);
        setLogoPreview(null);
    };

    const statusColor = (s: string) => {
        switch (s) {
            case "upcoming": return "bg-blue-50 text-blue-700";
            case "in_progress": return "bg-green-50 text-green-700";
            case "completed": return "bg-gray-100 text-gray-600";
            case "cancelled": return "bg-red-50 text-red-600";
            default: return "bg-gray-100 text-gray-600";
        }
    };

    const filtered = tournaments.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.sport?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!tableExists) {
        return (
            <AdminLayout title="Tournaments" subtitle="Manage tournaments & cups">
                <div className="p-6">
                    <Card><CardContent className="p-8 text-center">
                        <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Tournaments Table Not Found</h3>
                        <p className="text-gray-500 text-sm">Run the sports management migration SQL in your Supabase SQL Editor.</p>
                    </CardContent></Card>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Tournaments" subtitle="Manage tournaments, cups, and competitions">
            <div className="p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tournaments</CardTitle>
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{tournaments.length}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{tournaments.filter(t => t.status === "upcoming").length}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{tournaments.filter(t => t.status === "in_progress").length}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{tournaments.reduce((a, t) => a + (t.team_count || 0), 0)}</div></CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Search tournaments..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                    </div>
                    <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                        <Plus className="h-4 w-4 mr-2" /> Add Tournament
                    </Button>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tournament</TableHead>
                                    <TableHead>Sport</TableHead>
                                    <TableHead>Format</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Teams</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">Loading...</TableCell></TableRow>
                                ) : filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No tournaments found</TableCell></TableRow>
                                ) : filtered.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {t.logo_url ? (
                                                    <img loading="lazy" src={t.logo_url} alt={t.name} className="w-8 h-8 rounded object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center"><Trophy className="h-4 w-4 text-gray-400" /></div>
                                                )}
                                                <span className="font-medium">{t.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell><span className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">{t.sport}</span></TableCell>
                                        <TableCell className="capitalize">{t.format?.replace("_", " ")}</TableCell>
                                        <TableCell className="text-sm text-gray-500">
                                            {t.start_date ? new Date(t.start_date).toLocaleDateString() : "TBD"}
                                            {t.end_date && ` — ${new Date(t.end_date).toLocaleDateString()}`}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" className="text-xs" onClick={() => openTeamsDialog(t)}>
                                                <Users className="h-3 w-3 mr-1" /> {t.team_count || 0}
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(t.status)}`}>
                                                {t.status?.replace("_", " ").toUpperCase()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => openEdit(t)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setTournamentToDelete(t.id)}><Trash2 className="h-4 w-4" /></Button>
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
                        <DialogTitle>{editingTournament ? "Edit Tournament" : "Add New Tournament"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div><Label>Tournament Name *</Label><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>

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
                                <Label>Format</Label>
                                <Select value={formData.format} onValueChange={v => setFormData({ ...formData, format: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {FORMATS.map(f => <SelectItem key={f} value={f}>{f.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Start Date</Label><Input type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} /></div>
                            <div><Label>End Date</Label><Input type="date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} /></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Status</Label>
                                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div><Label>Prize Info</Label><Input value={formData.prize_info} onChange={e => setFormData({ ...formData, prize_info: e.target.value })} placeholder="e.g. $1M prize pool" /></div>
                        </div>

                        <div><Label>Description</Label><Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>

                        {/* Logo Upload */}
                        <div>
                            <Label>Tournament Logo</Label>
                            <div className="mt-1">
                                {logoPreview ? (
                                    <div className="relative inline-block">
                                        <img loading="lazy" src={logoPreview} alt="Logo preview" className="w-16 h-16 rounded object-cover border" />
                                        <button onClick={() => { setLogoFile(null); setLogoPreview(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X className="h-3 w-3" /></button>
                                    </div>
                                ) : (
                                    <label className="flex items-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-gray-400 transition">
                                        <Upload className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm text-gray-500">Click to upload tournament logo</span>
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
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={uploading}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={uploading}>
                            {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</> : (editingTournament ? "Update" : "Create")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manage Tournament Teams Dialog */}
            <Dialog open={isTeamsDialogOpen} onOpenChange={setIsTeamsDialogOpen}>
                <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Teams in {selectedTournament?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {/* Add Team */}
                        <div className="border rounded-lg p-3 space-y-3 bg-gray-50">
                            <Label className="text-sm font-medium">Add Team</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <Select value={addTeamId} onValueChange={setAddTeamId}>
                                    <SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger>
                                    <SelectContent>
                                        {allTeams
                                            .filter(t => !tournamentTeams.find(tt => tt.team_id === t.id))
                                            .map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Input value={addGroupName} onChange={e => setAddGroupName(e.target.value)} placeholder="Group (A, B...)" />
                                <Input type="number" value={addSeed || ""} onChange={e => setAddSeed(parseInt(e.target.value) || null)} placeholder="Seed #" />
                            </div>
                            <Button size="sm" onClick={handleAddTeam} disabled={!addTeamId}>
                                <Plus className="h-3 w-3 mr-1" /> Add
                            </Button>
                        </div>

                        {/* Current Teams */}
                        <div className="space-y-2">
                            {tournamentTeams.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No teams added yet</p>
                            ) : tournamentTeams.map(tt => (
                                <div key={tt.id} className="flex items-center justify-between border rounded-lg p-2">
                                    <div className="flex items-center gap-2">
                                        {tt.teams?.logo_url ? (
                                            <img loading="lazy" src={tt.teams.logo_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-gray-200" />
                                        )}
                                        <span className="text-sm font-medium">{tt.teams?.name}</span>
                                        {tt.group_name && <Badge variant="outline" className="text-[10px]">Group {tt.group_name}</Badge>}
                                        {tt.seed && <span className="text-[10px] text-gray-400">Seed {tt.seed}</span>}
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-red-500 h-7 w-7 p-0" onClick={() => handleRemoveTeam(tt.id)}>
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!tournamentToDelete} onOpenChange={() => setTournamentToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Tournament?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete this tournament and all its team registrations.</AlertDialogDescription>
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
