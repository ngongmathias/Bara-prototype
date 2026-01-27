/**
 * Image Optimization Utilities
 * Reduces bandwidth usage by compressing and resizing images before upload
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

/**
 * Compress and resize an image file
 * @param file - Original image file
 * @param options - Optimization options
 * @returns Optimized image file
 */
export const optimizeImage = async (
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxSizeMB = 1
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            
            // Check if size is acceptable
            const sizeMB = blob.size / (1024 * 1024);
            
            if (sizeMB > maxSizeMB) {
              // If still too large, reduce quality further
              const newQuality = Math.max(0.5, quality * (maxSizeMB / sizeMB));
              canvas.toBlob(
                (newBlob) => {
                  if (!newBlob) {
                    reject(new Error('Failed to create compressed blob'));
                    return;
                  }
                  
                  const optimizedFile = new File(
                    [newBlob],
                    file.name,
                    { type: 'image/jpeg' }
                  );
                  
                  console.log(`Image optimized: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(optimizedFile.size / 1024 / 1024).toFixed(2)}MB`);
                  resolve(optimizedFile);
                },
                'image/jpeg',
                newQuality
              );
            } else {
              const optimizedFile = new File(
                [blob],
                file.name,
                { type: 'image/jpeg' }
              );
              
              console.log(`Image optimized: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(optimizedFile.size / 1024 / 1024).toFixed(2)}MB`);
              resolve(optimizedFile);
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Create thumbnail version of an image
 * @param file - Original image file
 * @returns Thumbnail image file
 */
export const createThumbnail = async (file: File): Promise<File> => {
  return optimizeImage(file, {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.7,
    maxSizeMB: 0.2
  });
};

/**
 * Validate image file
 * @param file - File to validate
 * @returns true if valid, error message if invalid
 */
export const validateImage = (file: File): string | true => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (!validTypes.includes(file.type)) {
    return 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.';
  }
  
  const maxSize = 10 * 1024 * 1024; // 10MB before optimization
  if (file.size > maxSize) {
    return 'File too large. Maximum size is 10MB.';
  }
  
  return true;
};

/**
 * Batch optimize multiple images
 * @param files - Array of image files
 * @param options - Optimization options
 * @returns Array of optimized files
 */
export const optimizeImages = async (
  files: File[],
  options?: ImageOptimizationOptions
): Promise<File[]> => {
  return Promise.all(files.map(file => optimizeImage(file, options)));
};
