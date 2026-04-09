/**
 * Compress image using browser-image-compression
 * Max size: 1200px, 80% quality JPEG
 */
export async function compressImage(file: File): Promise<File> {
  // Dynamic import to avoid SSR issues
  const imageCompression = (await import("browser-image-compression")).default;

  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: "image/jpeg" as const,
    initialQuality: 0.8,
    alwaysKeepResolution: false,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log(
      `Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
    );
    return compressedFile;
  } catch (error) {
    console.error("Image compression failed:", error);
    return file; // Return original if compression fails
  }
}

/**
 * Get image dimensions
 */
export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Validate image file
 */
export function validateImageFile(
  file: File
): { valid: boolean; error?: string } {
  const validTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
    };
  }

  if (file.size > 20 * 1024 * 1024) {
    return {
      valid: false,
      error: "File too large. Maximum size is 20MB.",
    };
  }

  return { valid: true };
}

/**
 * Create object URL for image preview
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke object URL to free memory
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Read file as base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Generate unique file name
 */
export function generatePhotoFileName(workOrderId: string, type: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${workOrderId}/${type}_${timestamp}_${random}.jpg`;
}
