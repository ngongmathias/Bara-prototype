import { supabase } from './supabase';
import { optimizeImage, validateImage } from '@/utils/imageOptimization';

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

export const uploadImage = async (
  file: File,
  bucket: string = 'sponsored-banners',
  folder: string = 'banners',
  optimize: boolean = true
): Promise<string> => {
  try {
    // Validate image
    const validation = validateImage(file);
    if (validation !== true) {
      throw new Error(validation);
    }

    // Optimize image before upload to reduce bandwidth
    let fileToUpload = file;
    if (optimize) {
      fileToUpload = await optimizeImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
        maxSizeMB: 1
      });
    }

    // Generate unique filename
    const fileExt = fileToUpload.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload file to Supabase Storage with extended cache
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileToUpload, {
        cacheControl: '31536000', // 1 year cache to reduce bandwidth
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};


export const deleteImage = async (path: string, bucket: string = 'sponsored-banners'): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};

export const createBucket = async (bucketName: string): Promise<boolean> => {
  console.error(`Attempted to create bucket '${bucketName}'. Bucket creation must be done securely via the Supabase Dashboard or an Admin backend API. Client-side bucket creation is disabled.`);
  return false;
};