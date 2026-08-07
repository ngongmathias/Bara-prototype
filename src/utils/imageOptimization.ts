/**
 * Image Optimization Utilities
 * Reduces bandwidth usage by compressing and resizing images before upload
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
  /** Give up and use the original file after this long. Default 20s. */
  timeoutMs?: number;
}

/** Swap a filename's extension to match the bytes actually encoded. */
const renameForType = (name: string, mimeType: string): string => {
  const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const base = name.replace(/\.[^./\\]+$/, '') || 'photo';
  return `${base}.${ext}`;
};

const isHeic = (file: File): boolean =>
  /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);

/**
 * Convert an iPhone HEIC/HEIF photo to JPEG.
 *
 * HEIC is the default camera format on iPhone. Relying on the browser to
 * decode it does not work: Safari can, but Chrome and Firefox cannot, so a
 * HEIC shared to an Android phone — or opened on a desktop — would fail to
 * decode, fall back to the original bytes, and then be rejected by the
 * storage bucket, which only accepts jpeg/png/gif/webp. Decoding explicitly
 * makes the behaviour identical everywhere instead of depending on which
 * device the seller happens to be holding.
 *
 * heic2any bundles libheif (~2.7MB), so it is imported dynamically — it is
 * only fetched when someone actually picks a HEIC, and never lands in the
 * main bundle.
 */
async function heicToJpeg(file: File): Promise<File> {
  const { default: heic2any } = await import('heic2any');
  const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
  // heic2any returns Blob | Blob[] — multi-image HEICs yield several frames;
  // the first is the primary photo.
  const blob = Array.isArray(converted) ? converted[0] : converted;
  return new File([blob], renameForType(file.name, 'image/jpeg'), { type: 'image/jpeg' });
}

/**
 * Compress and resize an image file.
 *
 * Never rejects on a slow or undecodable image — it falls back to the original
 * file. The previous version could hang forever: if FileReader, Image.onload
 * or canvas.toBlob never fired (which happens with large photos in some mobile
 * WebViews) the promise never settled, Promise.all upstream never resolved,
 * and the submit button span indefinitely with no error. From the seller's
 * side that is indistinguishable from "nothing happens when I tap Submit".
 *
 * @param file - Original image file
 * @param options - Optimization options
 * @returns Optimized image file, or the original if optimization can't finish
 */
export const optimizeImage = async (
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxSizeMB = 1,
    timeoutMs = 20_000,
  } = options;

  // HEIC has to be decoded before the canvas path can touch it — most
  // browsers cannot draw one to a canvas at all.
  if (isHeic(file)) {
    try {
      file = await heicToJpeg(file);
    } catch (err) {
      console.warn('HEIC conversion failed, using original bytes', err);
      // Falls through: the canvas path will fail too and the original is
      // returned, which the bucket rejects with a clear message rather than
      // storing an image nothing can display.
    }
  }

  const work = new Promise<File>((resolve, reject) => {
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

        // Convert to blob with compression. Anything that isn't PNG — HEIC
        // included — comes out as JPEG, which is what makes iPhone photos
        // uploadable at all.
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

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
                    renameForType(file.name, outputType),
                    { type: outputType }
                  );

                  console.log(`Image optimized: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(optimizedFile.size / 1024 / 1024).toFixed(2)}MB`);
                  resolve(optimizedFile);
                },
                outputType,
                newQuality
              );
            } else {
              const optimizedFile = new File(
                [blob],
                renameForType(file.name, outputType),
                { type: outputType }
              );

              console.log(`Image optimized: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(optimizedFile.size / 1024 / 1024).toFixed(2)}MB`);
              resolve(optimizedFile);
            }
          },
          outputType,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

  // Whatever goes wrong — timeout, undecodable format, missing canvas — hand
  // back the original file rather than failing the whole submission. An
  // unoptimised upload is worse than an optimised one, and far better than a
  // seller losing their listing.
  const timeout = new Promise<File>((resolve) =>
    setTimeout(() => resolve(file), timeoutMs)
  );

  try {
    return await Promise.race([work, timeout]);
  } catch {
    return file;
  }
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
  // HEIC/HEIF is the DEFAULT camera format on iPhone, and the file inputs
  // that feed this use accept="image/*", so iOS offers those photos happily
  // and this then rejected them. On a platform whose traffic is overwhelmingly
  // mobile, that silently excluded a large share of sellers. optimizeImage
  // transcodes them to JPEG via canvas before upload.
  //
  // Some browsers also report an EMPTY type for camera-roll files. An empty
  // string is allowed through here and validated by whether it actually
  // decodes, which is the only reliable test anyway.
  const validTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'image/heic', 'image/heif',
  ];

  if (file.type && !validTypes.includes(file.type.toLowerCase())) {
    return 'That file type isn\'t supported. Please use a JPEG, PNG, WebP, GIF or iPhone photo.';
  }

  const maxSize = 10 * 1024 * 1024; // 10MB before optimization
  if (file.size > maxSize) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return `This photo is ${mb}MB — the limit is 10MB. Try a smaller one.`;
  }

  if (file.size === 0) {
    return 'That file appears to be empty.';
  }

  return true;
};

/**
 * File extension matching the encoded bytes.
 *
 * The upload path used to take the extension from the ORIGINAL filename, so a
 * HEIC transcoded to JPEG was stored as `.heic` containing JPEG bytes, and a
 * PNG re-encoded to JPEG kept `.png`. Browsers and CDNs that trust the
 * extension then mis-handle the file.
 */
export const extensionForType = (mimeType: string): string => {
  switch (mimeType.toLowerCase()) {
    case 'image/png': return 'png';
    case 'image/webp': return 'webp';
    case 'image/gif': return 'gif';
    default: return 'jpg';
  }
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
  const optimizedFiles: File[] = [];
  for (const file of files) {
    try {
      const optimized = await optimizeImage(file, options);
      optimizedFiles.push(optimized);
    } catch (e) {
      console.error(`Failed to optimize ${file.name}, using original`, e);
      optimizedFiles.push(file); // Fallback to original if optimization fails
    }
  }
  return optimizedFiles;
};
