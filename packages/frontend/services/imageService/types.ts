// ============================================================================
// FILE: src/services/imageService/types.ts
// PURPOSE: TypeScript types for image service
// COMMIT: feat: add TypeScript types for image operations
// ============================================================================

// ==================== ENUMS ====================

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

export enum ResizeMode {
  CONTAIN = "contain",
  COVER = "cover",
  STRETCH = "stretch",
  EXACT = "exact",
}

export enum WatermarkPosition {
  TOP_LEFT = "top-left",
  TOP_RIGHT = "top-right",
  BOTTOM_LEFT = "bottom-left",
  BOTTOM_RIGHT = "bottom-right",
  CENTER = "center",
}

export enum ImageStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export type ToolName = "convert" | "compress" | "resize" | "optimize" | "crop" | "watermark";

// ==================== REQUEST TYPES ====================

export interface ConvertRequest {
  file?: File;
  url?: string;
  format: OutputFormat;
  quality: number;
}

export interface CompressRequest {
  file?: File;
  url?: string;
  quality: number;
  format?: OutputFormat;
}

export interface ResizeRequest {
  file?: File;
  url?: string;
  width?: number;
  height?: number;
  mode: ResizeMode;
  format?: OutputFormat;
}

export interface OptimizeRequest {
  file?: File;
  url?: string;
  strip_exif: boolean;
  strip_gps: boolean;
  fix_orientation: boolean;
}

export interface CropRequest {
  file?: File;
  url?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  format?: OutputFormat;
}

export interface TextWatermarkRequest {
  file?: File;
  url?: string;
  text: string;
  font_size: number;
  color: string;
  opacity: number;
  position: WatermarkPosition;
}

export interface ImageWatermarkRequest {
  file?: File;
  url?: string;
  watermark: File;
  scale: number;
  opacity: number;
  position: WatermarkPosition;
}

// ==================== IMAGE STATE ====================

export interface ImageItem {
  id: string;
  file: File;
  name: string;
  size: number;
  preview: string;
  status: ImageStatus;
  result?: Blob;
  resultUrl?: string;
  error?: string;
  progress: number;
}

// ==================== BATCH STATE ====================

export interface BatchState {
  images: ImageItem[];
  isProcessing: boolean;
  completedCount: number;
  failedCount: number;
}

export interface BatchSettings {
  convert?: {
    format: OutputFormat;
    quality: number;
  };
  compress?: {
    quality: number;
    format?: OutputFormat;
  };
  resize?: {
    width?: number;
    height?: number;
    mode: ResizeMode;
    format?: OutputFormat;
  };
  optimize?: {
    strip_exif: boolean;
    strip_gps: boolean;
    fix_orientation: boolean;
  };
}