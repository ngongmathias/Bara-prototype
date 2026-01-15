import { supabase } from '@/lib/supabase';

/**
 * Upload an image to Supabase storage
 * @param file - The image file to upload
 * @param bucket - The storage bucket name (default: 'marketplace')
 * @returns The public URL of the uploaded image or null if upload fails
 */
export const uploadImage = async (
  file: File,
  bucket: string = 'marketplace'
): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    return null;
  }
};

/**
 * Delete an image from Supabase storage
 * @param url - The public URL of the image to delete
 * @param bucket - The storage bucket name (default: 'marketplace')
 * @returns True if deletion was successful, false otherwise
 */
export const deleteImage = async (
  url: string,
  bucket: string = 'marketplace'
): Promise<boolean> => {
  try {
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];

    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteImage:', error);
    return false;
  }
};
