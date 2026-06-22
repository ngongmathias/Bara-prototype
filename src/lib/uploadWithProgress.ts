import { supabase } from './supabase';

/**
 * Upload a file to the `music` bucket with REAL progress, by PUTting it to a
 * Supabase signed upload URL via XHR (which exposes upload.onprogress). If the
 * signed-URL path fails for any reason, it falls back to the standard
 * storage.upload so uploads never break — just without granular progress.
 * Returns the public URL.
 */
export async function uploadToMusicWithProgress(
  path: string,
  file: File,
  onProgress: (fraction: number) => void
): Promise<string> {
  try {
    const { data, error } = await supabase.storage.from('music').createSignedUploadUrl(path);
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

    return supabase.storage.from('music').getPublicUrl(path).data.publicUrl;
  } catch {
    // Fallback: standard upload (no granular progress).
    onProgress(0.5);
    const { error } = await supabase.storage.from('music').upload(path, file, {
      contentType: file.type,
      upsert: true,
    });
    if (error) throw error;
    onProgress(1);
    return supabase.storage.from('music').getPublicUrl(path).data.publicUrl;
  }
}
