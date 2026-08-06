import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { refreshRSSFeeds, fetchAndParseRSSFeed } from '@/lib/rssService';
import {
  RefreshCw,
  Newspaper,
  Loader2,
  Globe,
  Calendar,
  Search,
  AlertTriangle,
  Plus,
  Trash2,
  FlaskConical,
  Check,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';

interface Source {
  id: string;
  name: string;
  url: string;
  country_code: string | null;
  country_name: string | null;
  category: string | null;
  is_active: boolean;
  last_fetched_at: string | null;
  last_fetch_status: string | null;
  last_fetch_error: string | null;
  last_fetch_items: number | null;
}

// A source that reports `ok` while returning zero items is the exact failure
// mode that hid a 41-feed outage for months — the status column was green the
// whole time. `empty` is therefore treated as a first-class problem state,
// not a success.
type Health = 'ok' | 'empty' | 'error' | 'never' | 'inactive';

function sourceHealth(s: Source): Health {
  if (!s.is_active) return 'inactive';
  if (s.last_fetch_status === 'error') return 'error';
  if (!s.last_fetched_at) return 'never';
  if (!s.last_fetch_items) return 'empty';
  return 'ok';
}

const HEALTH_LABEL: Record<Health, string> = {
  ok: 'Healthy',
  empty: 'Returning nothing',
  error: 'Failing',
  never: 'Never fetched',
  inactive: 'Inactive',
};

// Problems first — a source that needs attention should never be below one
// that doesn't.
const HEALTH_ORDER: Record<Health, number> = { error: 0, empty: 1, never: 2, ok: 3, inactive: 4 };

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function HealthDot({ health }: { health: Health }) {
  const cls =
    health === 'ok' ? 'bg-green-600'
    : health === 'inactive' ? 'bg-gray-300'
    : health === 'error' ? 'bg-red-600'
    : 'bg-gray-900';
  return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${cls}`} aria-hidden />;
}

export const AdminRSSFeeds = () => {
  const { toast } = useToast();
  const [sources, setSources] = useState<Source[]>([]);
  const [feeds, setFeeds] = useState<any[]>([]);
  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);
  const [articleCounts, setArticleCounts] = useState<Record<string, number>>({});
  const [panAfricaCount, setPanAfricaCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sourceSearch, setSourceSearch] = useState('');
  const [articleSearch, setArticleSearch] = useState('');

  // Inline edit + test state, keyed by source id
  const [editingUrl, setEditingUrl] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [testing, setTesting] = useState<Record<string, 'running' | number | 'failed'>>({});
  const [deleteTarget, setDeleteTarget] = useState<Source | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newSource, setNewSource] = useState({ name: '', url: '', country_code: '' });
  const [adding, setAdding] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sourcesRes, feedsRes, countriesRes] = await Promise.all([
        supabase.from('rss_feed_sources').select('*').order('country_name'),
        supabase.from('rss_feeds').select('*').order('pub_date', { ascending: false }).limit(50),
        supabase.from('countries').select('code, name').eq('is_active', true).order('name'),
      ]);

      if (sourcesRes.error) throw sourcesRes.error;

      // Coverage counts must page explicitly: PostgREST caps an unbounded
      // select() at 1000 rows and returns them silently, which made this
      // panel under-report — it showed 0 Africa-wide articles when there
      // were 823. Only the code column is fetched, so the pages are small.
      const counts: Record<string, number> = {};
      let panAfrica = 0;
      const PAGE = 1000;
      for (let from = 0; ; from += PAGE) {
        const { data, error } = await supabase
          .from('rss_feeds')
          .select('country_code')
          .range(from, from + PAGE - 1);
        if (error) throw error;
        (data || []).forEach((r: any) => {
          if (r.country_code) counts[r.country_code] = (counts[r.country_code] || 0) + 1;
          else panAfrica += 1;
        });
        if (!data || data.length < PAGE) break;
      }

      setSources((sourcesRes.data as Source[]) || []);
      setFeeds(feedsRes.data || []);
      setCountries(countriesRes.data || []);
      setArticleCounts(counts);
      setPanAfricaCount(panAfrica);
    } catch (error) {
      console.error('Error fetching RSS data:', error);
      toast({ title: 'Error', description: 'Failed to fetch RSS data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshFeeds = async () => {
    try {
      setRefreshing(true);
      toast({ title: 'Refreshing feeds', description: 'Fetching latest news from all sources…' });

      const { data, error } = await supabase.functions.invoke('refresh-news-feeds', { body: { force: true } });

      let itemsAdded: number;
      let errors: string[] | undefined;
      if (!error && data?.success) {
        itemsAdded = data.itemsAdded ?? 0;
        errors = data.errors;
        if (data.skipped === 'cooldown') {
          toast({ title: 'Already refreshed', description: 'Feeds were refreshed less than 2 minutes ago.' });
          fetchData();
          return;
        }
      } else {
        console.warn('Edge function refresh failed, falling back to client-side refresh', error, data);
        const result = await refreshRSSFeeds(true);
        if (!result.success) throw new Error('Client-side refresh failed');
        itemsAdded = result.itemsAdded;
      }

      toast({
        title: 'Refreshed',
        description: `Added ${itemsAdded} new articles` + (errors?.length ? ` · ${errors.length} sources failed` : ''),
      });
      if (errors?.length) console.warn('Sources that failed to refresh:', errors);
      fetchData();
    } catch (error) {
      console.error('Error refreshing feeds:', error);
      toast({ title: 'Error', description: 'Failed to refresh RSS feeds', variant: 'destructive' });
    } finally {
      setRefreshing(false);
    }
  };

  const toggleSourceActive = async (source: Source) => {
    const { error } = await supabase
      .from('rss_feed_sources')
      .update({ is_active: !source.is_active })
      .eq('id', source.id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update source', variant: 'destructive' });
      return;
    }
    toast({ title: source.is_active ? 'Deactivated' : 'Activated', description: source.name });
    fetchData();
  };

  // Verify a URL actually returns items BEFORE it is saved. This is the step
  // that turns "test the feeds for every country" from a developer task into
  // a click.
  const testFeed = async (id: string, url: string, name: string) => {
    setTesting((t) => ({ ...t, [id]: 'running' }));
    try {
      const items = await fetchAndParseRSSFeed(url, name);
      setTesting((t) => ({ ...t, [id]: items.length }));
      toast({
        title: items.length ? `${items.length} articles found` : 'Feed returned nothing',
        description: items.length
          ? 'This URL is working.'
          : 'The URL responds but contains no articles — it will silently serve an empty page.',
        variant: items.length ? undefined : 'destructive',
      });
    } catch {
      setTesting((t) => ({ ...t, [id]: 'failed' }));
      toast({ title: 'Could not reach the feed', description: 'The URL failed to load.', variant: 'destructive' });
    }
  };

  const saveUrl = async (source: Source) => {
    const url = (editingUrl[source.id] ?? '').trim();
    if (!url) return;
    setSavingId(source.id);
    try {
      const { error } = await supabase.from('rss_feed_sources').update({ url }).eq('id', source.id);
      if (error) throw error;
      toast({ title: 'URL updated', description: `${source.name} — refresh to pull articles from it.` });
      setEditingUrl((m) => { const next = { ...m }; delete next[source.id]; return next; });
      fetchData();
    } catch (e: any) {
      toast({ title: 'Could not save', description: e.message, variant: 'destructive' });
    } finally {
      setSavingId(null);
    }
  };

  const addSource = async () => {
    if (!newSource.name.trim() || !newSource.url.trim()) {
      toast({ title: 'Name and URL are required', variant: 'destructive' });
      return;
    }
    setAdding(true);
    try {
      const country = countries.find((c) => c.code === newSource.country_code);
      const { error } = await supabase.from('rss_feed_sources').insert({
        name: newSource.name.trim(),
        url: newSource.url.trim(),
        country_code: newSource.country_code || null,
        country_name: country?.name || null,
        is_active: true,
      });
      if (error) throw error;
      toast({ title: 'Source added', description: `${newSource.name} — run a refresh to pull its articles.` });
      setNewSource({ name: '', url: '', country_code: '' });
      setShowAdd(false);
      fetchData();
    } catch (e: any) {
      toast({ title: 'Could not add source', description: e.message, variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  };

  const deleteSource = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('rss_feed_sources').delete().eq('id', deleteTarget.id);
    if (error) {
      toast({ title: 'Could not delete', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Source deleted', description: deleteTarget.name });
      fetchData();
    }
    setDeleteTarget(null);
  };

  const formatDate = (d: string) => new Date(d).toLocaleString();

  const withHealth = useMemo(
    () => sources.map((s) => ({ ...s, health: sourceHealth(s) })),
    [sources]
  );

  const problems = useMemo(
    () => withHealth.filter((s) => s.health === 'empty' || s.health === 'error'),
    [withHealth]
  );

  // Two codes pointing at the same country page, or one code serving two
  // different countries, both silently misroute articles.
  const duplicateCodes = useMemo(() => {
    const seen: Record<string, string[]> = {};
    withHealth.filter((s) => s.is_active && s.country_code).forEach((s) => {
      seen[s.country_code!] = [...(seen[s.country_code!] || []), s.name];
    });
    return Object.entries(seen).filter(([, names]) => names.length > 1);
  }, [withHealth]);

  const emptyCountries = useMemo(
    () => countries.filter((c) => !articleCounts[c.code]),
    [countries, articleCounts]
  );

  const filteredSources = useMemo(() => {
    const q = sourceSearch.toLowerCase();
    return withHealth
      .filter((s) => s.name.toLowerCase().includes(q) || (s.country_name || '').toLowerCase().includes(q))
      .sort((a, b) => HEALTH_ORDER[a.health] - HEALTH_ORDER[b.health] || a.name.localeCompare(b.name));
  }, [withHealth, sourceSearch]);

  const filteredFeeds = feeds.filter((f) =>
    f.title?.toLowerCase().includes(articleSearch.toLowerCase()) ||
    f.source?.toLowerCase().includes(articleSearch.toLowerCase())
  );

  const activeCount = sources.filter((s) => s.is_active).length;

  return (
    <AdminLayout title="RSS Feeds" subtitle="News sources, feed health and country coverage">
      <div className="mb-4 w-full flex justify-end">
        <AdminPageGuide
          title="RSS Feed Aggregator"
          description="Manage the news sources that populate country pages and the landing page."
          features={['Add, edit and remove source URLs', 'Test a feed before saving it', 'See which countries have no news']}
          workflow={['Check "Needs attention" first', 'Test a URL to confirm it returns articles', 'Save it, then Refresh to pull them in']}
        />
      </div>

      <div className="space-y-6">
        {/* Health summary — coverage first, because that is what users feel */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className={emptyCountries.length ? 'border-gray-900 border-2' : ''}>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 font-roboto">Countries with no news</p>
              <p className="text-3xl font-comfortaa font-bold">
                {emptyCountries.length}
                <span className="text-base text-gray-400 font-normal"> / {countries.length}</span>
              </p>
            </CardContent>
          </Card>
          <Card className={problems.length ? 'border-gray-900 border-2' : ''}>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 font-roboto">Feeds needing attention</p>
              <p className="text-3xl font-comfortaa font-bold">{problems.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-roboto">Active sources</p>
                <p className="text-3xl font-comfortaa font-bold">{activeCount}<span className="text-base text-gray-400 font-normal"> / {sources.length}</span></p>
              </div>
              <Globe className="w-7 h-7 text-gray-300" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-roboto">Africa-wide articles</p>
                <p className="text-3xl font-comfortaa font-bold">{panAfricaCount}</p>
              </div>
              <Newspaper className="w-7 h-7 text-gray-300" />
            </CardContent>
          </Card>
        </div>

        {/* Needs attention — only rendered when there is something to do */}
        {!loading && (problems.length > 0 || duplicateCodes.length > 0) && (
          <Card className="border-gray-900 border-2">
            <CardHeader>
              <CardTitle className="font-comfortaa flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Needs attention
              </CardTitle>
              <CardDescription className="font-roboto">
                A feed can report success while returning zero articles — those are listed here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {problems.map((s) => {
                const d = daysSince(s.last_fetched_at);
                return (
                  <div key={s.id} className="flex items-center justify-between gap-3 p-3 border rounded-lg">
                    <div className="min-w-0">
                      <p className="font-comfortaa font-semibold truncate">{s.name}</p>
                      <p className="text-xs text-gray-600 font-roboto">
                        {s.health === 'error'
                          ? `Failing — ${s.last_fetch_error || 'unknown error'}`
                          : `Returned 0 articles${d != null ? ` · last checked ${d === 0 ? 'today' : `${d}d ago`}` : ''}`}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => testFeed(s.id, s.url, s.name)} className="shrink-0">
                      {testing[s.id] === 'running'
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <><FlaskConical className="w-4 h-4 mr-1" /> Test</>}
                    </Button>
                  </div>
                );
              })}
              {duplicateCodes.map(([code, names]) => (
                <div key={code} className="p-3 border rounded-lg">
                  <p className="text-sm font-roboto">
                    <span className="font-bold">{code}</span> has {names.length} active sources — articles may be
                    attributed to whichever fetches first: {names.join(', ')}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Refresh */}
        <Card>
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-comfortaa font-semibold mb-1">Refresh all feeds</h3>
              <p className="text-sm text-gray-600 font-roboto">Pull the latest articles from every active source.</p>
            </div>
            <Button onClick={handleRefreshFeeds} disabled={refreshing} className="bg-gray-900 hover:bg-black">
              {refreshing
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Refreshing…</>
                : <><RefreshCw className="w-4 h-4 mr-2" /> Refresh now</>}
            </Button>
          </CardContent>
        </Card>

        {/* Sources */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="font-comfortaa">Sources</CardTitle>
                <CardDescription className="font-roboto">Problems are listed first.</CardDescription>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search sources…"
                    className="pl-9 font-roboto"
                    value={sourceSearch}
                    onChange={(e) => setSourceSearch(e.target.value)}
                  />
                </div>
                <Button onClick={() => setShowAdd((v) => !v)} variant="outline" className="shrink-0">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {showAdd && (
              <div className="mb-4 p-4 border-2 border-gray-900 rounded-lg space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    placeholder="Source name"
                    value={newSource.name}
                    onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                  />
                  <Input
                    placeholder="Feed URL"
                    className="sm:col-span-2"
                    value={newSource.url}
                    onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                  />
                </div>
                <select
                  className="w-full h-10 rounded-md border border-gray-200 px-3 text-sm"
                  value={newSource.country_code}
                  onChange={(e) => setNewSource({ ...newSource, country_code: e.target.value })}
                >
                  <option value="">Africa-wide (no country)</option>
                  {countries.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
                </select>
                <div className="flex gap-2">
                  <Button onClick={addSource} disabled={adding} className="bg-gray-900 hover:bg-black">
                    {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add source'}
                  </Button>
                  <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 font-roboto">Loading sources…</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSources.map((source) => {
                  const isEditing = editingUrl[source.id] !== undefined;
                  const testResult = testing[source.id];
                  const d = daysSince(source.last_fetched_at);
                  return (
                    <div key={source.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <HealthDot health={source.health} />
                            <h4 className="font-comfortaa font-semibold">{source.name}</h4>
                            {source.country_name && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-roboto">
                                {source.country_name}
                              </span>
                            )}
                            <span className="text-xs text-gray-500 font-roboto">{HEALTH_LABEL[source.health]}</span>
                          </div>

                          {isEditing ? (
                            <div className="flex flex-col sm:flex-row gap-2 mt-2">
                              <Input
                                value={editingUrl[source.id]}
                                onChange={(e) => setEditingUrl((m) => ({ ...m, [source.id]: e.target.value }))}
                                className="font-roboto text-xs flex-1"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => testFeed(source.id, editingUrl[source.id], source.name)}
                                >
                                  {testResult === 'running'
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <><FlaskConical className="w-4 h-4 mr-1" /> Test</>}
                                </Button>
                                <Button size="sm" onClick={() => saveUrl(source)} disabled={savingId === source.id} className="bg-gray-900 hover:bg-black">
                                  {savingId === source.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingUrl((m) => { const n = { ...m }; delete n[source.id]; return n; })}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingUrl((m) => ({ ...m, [source.id]: source.url }))}
                              className="block text-left text-xs text-gray-500 font-roboto mt-1 hover:text-gray-900 hover:underline break-all"
                              title="Click to edit"
                            >
                              {source.url}
                            </button>
                          )}

                          <p className="text-xs text-gray-400 font-roboto mt-1">
                            {source.last_fetched_at
                              ? `Last fetched ${d === 0 ? 'today' : `${d}d ago`} · ${source.last_fetch_items ?? 0} items`
                              : 'Never fetched'}
                            {typeof testResult === 'number' && (
                              <span className="text-gray-900 font-bold"> · test found {testResult}</span>
                            )}
                            {testResult === 'failed' && <span className="text-red-600"> · test failed</span>}
                          </p>
                        </div>

                        <div className="flex gap-1 shrink-0">
                          {!isEditing && (
                            <Button variant="outline" size="sm" onClick={() => testFeed(source.id, source.url, source.name)}>
                              {testResult === 'running'
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <FlaskConical className="w-4 h-4" />}
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => toggleSourceActive(source)}>
                            {source.is_active ? 'Off' : 'On'}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(source)} className="text-gray-400 hover:text-gray-900">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Country coverage */}
        <Card>
          <CardHeader>
            <CardTitle className="font-comfortaa">Country coverage</CardTitle>
            <CardDescription className="font-roboto">
              Articles currently available per country page. Empty countries fall back to Africa-wide news.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto my-6" />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {[...countries]
                  .sort((a, b) => (articleCounts[a.code] || 0) - (articleCounts[b.code] || 0))
                  .map((c) => {
                    const n = articleCounts[c.code] || 0;
                    return (
                      <div
                        key={c.code}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-roboto ${
                          n === 0 ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
                        }`}
                      >
                        <span className="truncate text-gray-700">{c.name}</span>
                        <span className={`font-bold ${n === 0 ? 'text-gray-900' : 'text-gray-400'}`}>{n}</span>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent articles */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="font-comfortaa">Recent articles</CardTitle>
                <CardDescription className="font-roboto">Latest 50 cached articles</CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search articles…"
                  className="pl-9 font-roboto"
                  value={articleSearch}
                  onChange={(e) => setArticleSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto my-6" />
            ) : feeds.length === 0 ? (
              <div className="text-center py-8">
                <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-roboto mb-4">No articles cached yet</p>
                <Button onClick={handleRefreshFeeds} disabled={refreshing}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Fetch articles
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFeeds.map((feed) => (
                  <div key={feed.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-roboto">{feed.source}</span>
                          {feed.country_name && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-roboto">{feed.country_name}</span>
                          )}
                        </div>
                        <h4 className="font-comfortaa font-semibold mb-1">{feed.title}</h4>
                        <p className="text-sm text-gray-600 font-roboto mb-2 line-clamp-2">{feed.description}</p>
                        <span className="flex items-center text-xs text-gray-400 font-roboto">
                          <Calendar className="w-3 h-3 mr-1" /> {formatDate(feed.pub_date)}
                        </span>
                      </div>
                      <a
                        href={feed.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 hover:underline text-sm font-roboto shrink-0"
                      >
                        View →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this source?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name} will be removed. Articles already cached from it stay, but nothing new
              will be pulled. To pause it instead, use the On/Off toggle.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteSource} className="bg-gray-900 hover:bg-black">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};
