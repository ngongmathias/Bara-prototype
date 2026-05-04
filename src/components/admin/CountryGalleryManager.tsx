import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, ArrowUp, ArrowDown, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const MAX_DIMENSION = 1920;
const TARGET_BYTES = 500 * 1024;
const MAX_BYTES_HARD_LIMIT = 5 * 1024 * 1024;

interface GalleryPhoto {
    id: string;
    image_url: string;
    storage_path: string | null;
    caption: string | null;
    display_order: number;
}

interface CountryGalleryManagerProps {
    countryId: string;
    countryName: string;
}

/**
 * Resize an image to fit within MAX_DIMENSION on the longest side and compress
 * it to a JPEG with quality stepping down until under TARGET_BYTES (or quality
 * reaches 0.5). Returns a Blob.
 */
async function resizeAndCompress(file: File): Promise<Blob> {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = dataUrl;
    });

    const longest = Math.max(img.width, img.height);
    const scale = longest > MAX_DIMENSION ? MAX_DIMENSION / longest : 1;
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    ctx.drawImage(img, 0, 0, w, h);

    let quality = 0.85;
    let blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) throw new Error('Failed to encode JPEG');

    while (blob.size > TARGET_BYTES && quality > 0.5) {
        quality -= 0.1;
        blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
        if (!blob) break;
    }
    if (!blob) throw new Error('Compression failed');
    return blob;
}

export const CountryGalleryManager = ({ countryId, countryName }: CountryGalleryManagerProps) => {
    const { user } = useUser();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [savingCaptionId, setSavingCaptionId] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('country_gallery_photos')
            .select('id, image_url, storage_path, caption, display_order')
            .eq('country_id', countryId)
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: true });
        if (!error && data) setPhotos(data as GalleryPhoto[]);
        setLoading(false);
    };

    useEffect(() => { load(); }, [countryId]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        e.target.value = '';

        setUploading(true);
        let succeeded = 0;
        let failed = 0;

        for (const file of files) {
            if (file.size > MAX_BYTES_HARD_LIMIT) {
                toast({ title: `${file.name} is over 5 MB — skipping`, variant: 'destructive' });
                failed++;
                continue;
            }
            try {
                const blob = await resizeAndCompress(file);
                const ext = 'jpg';
                const filename = `${crypto.randomUUID()}.${ext}`;
                const storagePath = `${countryId}/${filename}`;

                const { error: uploadError } = await supabase.storage
                    .from('country-gallery')
                    .upload(storagePath, blob, { contentType: 'image/jpeg', upsert: false });
                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('country-gallery')
                    .getPublicUrl(storagePath);

                const nextOrder = (photos[photos.length - 1]?.display_order ?? -1) + 1 + succeeded;

                const { error: insertError } = await supabase
                    .from('country_gallery_photos')
                    .insert({
                        country_id: countryId,
                        image_url: publicUrl,
                        storage_path: storagePath,
                        display_order: nextOrder,
                        uploaded_by_clerk_id: user?.id ?? null,
                    });
                if (insertError) throw insertError;
                succeeded++;
            } catch (err: any) {
                console.error('Upload failed for', file.name, err);
                failed++;
            }
        }

        setUploading(false);
        if (succeeded > 0) toast({ title: `Uploaded ${succeeded} photo${succeeded === 1 ? '' : 's'}` });
        if (failed > 0) toast({ title: `${failed} upload${failed === 1 ? '' : 's'} failed`, variant: 'destructive' });
        await load();
    };

    const handleDelete = async (photo: GalleryPhoto) => {
        if (!confirm('Delete this photo? This cannot be undone.')) return;
        try {
            if (photo.storage_path) {
                await supabase.storage.from('country-gallery').remove([photo.storage_path]);
            }
            const { error } = await supabase
                .from('country_gallery_photos')
                .delete()
                .eq('id', photo.id);
            if (error) throw error;
            toast({ title: 'Photo deleted' });
            await load();
        } catch (err) {
            console.error(err);
            toast({ title: 'Delete failed', variant: 'destructive' });
        }
    };

    const handleReorder = async (idx: number, direction: -1 | 1) => {
        const target = idx + direction;
        if (target < 0 || target >= photos.length) return;
        const a = photos[idx];
        const b = photos[target];
        try {
            // Swap display_order on the two affected rows.
            const { error: errA } = await supabase
                .from('country_gallery_photos')
                .update({ display_order: b.display_order })
                .eq('id', a.id);
            if (errA) throw errA;
            const { error: errB } = await supabase
                .from('country_gallery_photos')
                .update({ display_order: a.display_order })
                .eq('id', b.id);
            if (errB) throw errB;
            await load();
        } catch (err) {
            console.error(err);
            toast({ title: 'Reorder failed', variant: 'destructive' });
        }
    };

    const handleCaptionBlur = async (photo: GalleryPhoto, value: string) => {
        const trimmed = value.trim();
        if ((photo.caption ?? '') === trimmed) return;
        setSavingCaptionId(photo.id);
        const { error } = await supabase
            .from('country_gallery_photos')
            .update({ caption: trimmed || null })
            .eq('id', photo.id);
        setSavingCaptionId(null);
        if (error) {
            console.error(error);
            toast({ title: 'Caption save failed', variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Gallery — {countryName}</h3>
                    <p className="text-xs text-gray-500">JPEG / PNG / WebP, max 5 MB per file. Auto-resized to 1920px and compressed.</p>
                </div>
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="bg-black hover:bg-gray-800 text-white"
                    >
                        {uploading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Upload size={16} className="mr-2" />}
                        {uploading ? 'Uploading…' : 'Upload photos'}
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="aspect-square bg-gray-100 rounded animate-pulse" />
                    ))}
                </div>
            ) : photos.length === 0 ? (
                <div className="border border-dashed border-gray-300 rounded-lg p-10 text-center">
                    <p className="text-sm text-gray-600">No photos yet. Upload some to start the gallery.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {photos.map((photo, idx) => (
                        <div key={photo.id} className="group relative bg-white border border-gray-200 rounded overflow-hidden">
                            <div className="aspect-square bg-gray-100">
                                <img
                                    src={photo.image_url}
                                    alt={photo.caption || ''}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-2 space-y-2">
                                <Input
                                    defaultValue={photo.caption ?? ''}
                                    placeholder="Caption (optional)"
                                    onBlur={(e) => handleCaptionBlur(photo, e.target.value)}
                                    className="text-xs h-7"
                                />
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-1">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 p-0"
                                            onClick={() => handleReorder(idx, -1)}
                                            disabled={idx === 0}
                                            aria-label="Move up"
                                        >
                                            <ArrowUp size={14} />
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 p-0"
                                            onClick={() => handleReorder(idx, 1)}
                                            disabled={idx === photos.length - 1}
                                            aria-label="Move down"
                                        >
                                            <ArrowDown size={14} />
                                        </Button>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDelete(photo)}
                                        aria-label="Delete photo"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                                {savingCaptionId === photo.id && (
                                    <p className="text-[10px] text-gray-400">Saving…</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CountryGalleryManager;
