// ============================================================================
// FILE: src/utils/fileProcessor.utils.ts
// PURPOSE: File processing utilities
// ============================================================================

import { UploadedFile, ConvertedFile, OutputFormat } from "@/services/imageService/types";

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/bmp", "image/tiff", "image/avif", "image/heic", "image/heif"];
const MAX_SIZE = 10 * 1024 * 1024;

export const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const validateFile = (file: File): string | null => {
  if (!ALLOWED.includes(file.type)) return "Invalid file type";
  if (file.size > MAX_SIZE) return "File too large (Max 10MB)";
  return null;
};

export const createUploadedFile = (
  file: File,
  method: "device" | "url" = "device",
  url?: string
): UploadedFile | null => {
  const error = validateFile(file);
  if (error) {
    alert(`❌ ${error}`);
    return null;
  }
  
  return {
    id: generateId(),
    file: method === "device" ? file : null,
    url,
    preview: URL.createObjectURL(file),
    name: file.name,
    size: file.size,
    type: file.type,
    uploadMethod: method,
    status: "pending",
  };
};

export const createConvertedFile = (
  original: UploadedFile,
  blob: Blob,
  format: OutputFormat
): ConvertedFile => {
  const base = original.name.split(".").slice(0, -1).join(".");
  
  return {
    id: generateId(),
    originalId: original.id,
    blob,
    filename: `${base}.${format}`,
    size: blob.size,
    format,
    downloadUrl: URL.createObjectURL(blob),
    convertedAt: Date.now(),
  };
};

export const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};