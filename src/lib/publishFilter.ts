// Shared draft/publish + scheduled-release gate for songs (STREAMS_MASTER_PLAN.md §E4).
// Existing rows default to status='published', release_date=null, so this
// is a no-op for everything already in the catalog — it only hides songs an
// artist explicitly marked draft or scheduled for the future.
export interface PublishGated {
    status?: string | null;
    release_date?: string | null;
}

export function isPublished(row: PublishGated): boolean {
    if (row.status && row.status !== 'published') return false;
    if (row.release_date && new Date(row.release_date) > new Date()) return false;
    return true;
}

// Untyped `any[]` in, `any[]` out — matches this codebase's Supabase client,
// which isn't generated against a typed schema. Generic<T> inference here
// was collapsing result rows to just {status, release_date}, breaking every
// caller's downstream field access.
export function filterPublished(rows: any[] | null | undefined): any[] {
    return (rows || []).filter(isPublished);
}
