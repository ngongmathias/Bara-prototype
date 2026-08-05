import { supabase } from '@/lib/supabase';

// Shared storage hygiene for songs (STREAMS_MASTER_PLAN.md §E2). Deleting a
// song's DB row never cleaned up its audio/cover objects in the `music`
// bucket — this is the one place that does, so creator and admin delete
// paths can't drift out of sync with each other again.
const BUCKET = 'music';

function storagePathFromPublicUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    const marker = `/object/public/${BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    try {
        return decodeURIComponent(url.slice(idx + marker.length));
    } catch {
        return url.slice(idx + marker.length);
    }
}

// Best-effort: storage cleanup failing should never block the DB delete the
// caller already committed to. Errors are logged, not thrown.
export async function deleteSongStorageFiles(song: { file_url?: string | null; cover_url?: string | null }): Promise<void> {
    const paths = [song.file_url, song.cover_url]
        .map(storagePathFromPublicUrl)
        .filter((p): p is string => !!p);
    if (paths.length === 0) return;
    try {
        const { error } = await supabase.storage.from(BUCKET).remove(paths);
        if (error) console.warn('Song storage cleanup failed:', error.message, paths);
    } catch (err) {
        console.warn('Song storage cleanup failed:', err, paths);
    }
}
