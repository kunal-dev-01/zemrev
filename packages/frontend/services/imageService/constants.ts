// ============================================================================
// FILE: src/services/imageService/constants.ts
// PURPOSE: Constants for image service
// COMMIT: feat: add constants for image operations
// ============================================================================

export const IMAGE_CONSTANTS = {
  MAX_BATCH_SIZE: 5,
  MAX_FILE_SIZE: 52428800, // 50MB
  ACCEPTED_FORMATS: [
    "image/jpeg",
    "image/jpg", 
    "image/png",
    "image/webp",
    "image/avif",
    "image/heic",
    "image/heif",
    "image/tiff",
    "image/gif",
    "image/bmp",
  ],
  ACCEPTED_EXTENSIONS: ".jpg,.jpeg,.png,.webp,.avif,.heic,.tiff,.gif,.bmp,.heif",
} as const;

export const BATCH_TOOLS: readonly string[] = ["convert", "compress", "resize", "optimize"] as const;

export const SINGLE_TOOLS: readonly string[] = ["crop", "watermark"] as const;