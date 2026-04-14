export type RecentKind = 'event' | 'ad' | 'song';

export interface RecentItem {
  id: string;
  kind: RecentKind;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  href: string;
  viewedAt: number;
}

const STORAGE_KEY = 'bara.recentActivity';
const MAX_PER_KIND = 8;

const readAll = (): RecentItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeAll = (items: RecentItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
};

export const trackRecent = (item: Omit<RecentItem, 'viewedAt'>) => {
  const now = Date.now();
  const all = readAll();
  const filtered = all.filter((x) => !(x.kind === item.kind && x.id === item.id));
  filtered.unshift({ ...item, viewedAt: now });

  // Cap per kind
  const counts: Record<string, number> = {};
  const capped = filtered.filter((x) => {
    counts[x.kind] = (counts[x.kind] || 0) + 1;
    return counts[x.kind] <= MAX_PER_KIND;
  });
  writeAll(capped);
};

export const getRecent = (kind?: RecentKind, limit = 8): RecentItem[] => {
  const all = readAll();
  const filtered = kind ? all.filter((x) => x.kind === kind) : all;
  return filtered.sort((a, b) => b.viewedAt - a.viewedAt).slice(0, limit);
};

export const clearRecent = (kind?: RecentKind) => {
  if (!kind) { writeAll([]); return; }
  writeAll(readAll().filter((x) => x.kind !== kind));
};
