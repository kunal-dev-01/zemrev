// ============================================================================
// FILE: src/services/imageService/types.ts
// PURPOSE: All TypeScript types
// ============================================================================

export type OutputFormat = 
  | "jpeg" | "jpg" | "png" | "webp" 
  | "avif" | "tiff" | "gif" | "bmp" 
  | "heic" | "heif";

export type UploadMethod = "device" | "url";
export type FileStatus = "pending" | "processing" | "completed" | "error";

export interface ConversionSettings {
  format: OutputFormat;
  quality: number;
}

export interface UploadedFile {
  id: string;
  file: File | null;
  url?: string;
  preview: string;
  name: string;
  size: number;
  type: string;
  uploadMethod: UploadMethod;
  status: FileStatus;
  error?: string;
}

export interface ConvertedFile {
  id: string;
  originalId: string;
  blob: Blob;
  filename: string;
  size: number;
  format: OutputFormat;
  downloadUrl: string;
  convertedAt: number;
}

export interface SessionStorageData {
  convertedFiles: ConvertedFile[];
  timestamp: number;
  settings: ConversionSettings;
}

export interface SlugData {
  slug: string;
  sourceFormat: OutputFormat;
  targetFormat: OutputFormat;
}