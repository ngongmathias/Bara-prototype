import { createClient } from '@supabase/supabase-js';

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

// Create a separate Supabase client with service role key for storage operations
// This bypasses RLS policies since we're using Clerk for authentication
const getStorageClient = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables for storage operations');
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
};

export const uploadImage = async (
  file: File,
  bucket: string = 'sponsored-banners',
  folder: string = 'banners'
): Promise<string> => {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    console.log(`Uploading to bucket: ${bucket}, folder: ${folder}, file: ${fileName}`);

    // Use service role client for storage operations
    const storageClient = getStorageClient();
    
    // Upload file to Supabase Storage
    const { data, error } = await storageClient.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = storageClient.storage
      .from(bucket)
      .getPublicUrl(filePath);

    console.log(`Upload successful. Public URL: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};


export const deleteImage = async (path: string, bucket: string = 'sponsored-banners'): Promise<boolean> => {
  try {
    const storageClient = getStorageClient();
    const { error } = await storageClient.storage
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
  try {
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (error) {
      console.error('Bucket creation error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Bucket creation error:', error);
    return false;
  }
};