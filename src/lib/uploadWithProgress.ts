import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as defaultClient } from './supabase';

/**
 * Upload a file to the `music` bucket with REAL progress, by PUTting it to a
 * Supabase signed upload URL via XHR (which exposes upload.onprogress). If the
 * signed-URL path fails for any reason, it falls back to the standard
 * storage.upload so uploads never break — just without granular progress.
 * Returns the public URL.
 *
 * §K2 — the `music` bucket's storage policies are path-scoped to the caller's
 * JWT sub, so pass an authenticated client (from useAuthedSupabase) here or
 * uploads will be rejected once the bucket lockdown migration lands.
 */
export async function uploadToMusicWithProgress(
  path: string,
  file: File,
  onProgress: (fraction: number) => void,
  client: SupabaseClient = defaultClient
): Promise<string> {
  try {
    const { data, error } = await client.storage.from('music').createSignedUploadUrl(path);
    if (error || !data?.signedUrl) throw error || new Error('no-signed-url');

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', data.signedUrl, true);
      if (file.type) xhr.setRequestHeader('content-type', file.type);
      xhr.setRequestHeader('x-upsert', 'true');
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(e.loaded / e.total);
      };
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`));
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(file);
    });

    return client.storage.from('music').getPublicUrl(path).data.publicUrl;
  } catch {
    // Fallback: standard upload (no granular progress).
    onProgress(0.5);
    const { error } = await client.storage.from('music').upload(path, file, {
      contentType: file.type,
      upsert: true,
    });
    if (error) throw error;
    onProgress(1);
    return client.storage.from('music').getPublicUrl(path).data.publicUrl;
  }
}
