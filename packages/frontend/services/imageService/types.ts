// ============================================================================
// FILE: src/services/imageService/types.ts
// PURPOSE: Types for image convert service
// COMMIT: feat: add types for image convert
// ============================================================================

export enum OutputFormat {
  JPEG = "jpeg",
  JPG = "jpg",
  PNG = "png",
  WEBP = "webp",
  AVIF = "avif",
  HEIC = "heic",
  HEIF = "heif",
  TIFF = "tiff",
  GIF = "gif",
  BMP = "bmp",
}

export enum ImageStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface ConvertRequest {
  file: File;
  format: OutputFormat;
  quality: number;
}

export interface ImageItem {
  id: string;
  file: File;
  name: string;
  size: number;
  preview: string;
  status: ImageStatus;
  progress: number;
  result?: Blob;
  resultUrl?: string;
  error?: string;
}

export interface ConvertState {
  images: ImageItem[];
  isProcessing: boolean;
  completedCount: number;
  failedCount: number;
}

export const MAX_IMAGES = 5;
export const MAX_FILE_SIZE = 52428800; // 50MB
export const ACCEPTED_FORMATS = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/gif", "image/bmp", "image/tiff", "image/heif"];