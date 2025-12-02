// ============================================================================
// FILE: services/imageService/types.ts
// PURPOSE: Complete type definitions for image tools
// ============================================================================

export type OutputFormat = 
  | "jpeg" | "jpg" | "png" | "webp" | "avif" 
  | "tiff" | "gif" | "bmp" | "heic" | "heif";

export type ResizeMode = "contain" | "cover" | "stretch" | "exact";

export type WatermarkPosition = 
  | "top-left" | "top-right" 
  | "bottom-left" | "bottom-right" 
  | "center";

export type ToolType = 
  | "converter" | "compressor" | "resizer" 
  | "optimizer" | "cropper" | "watermark";

// ============================================================================
// FILE PROCESSING TYPES
// ============================================================================

export interface ProcessedFile {
  id: string;
  originalFile: File;
  name: string;
  size: number;
  type: string;
  settings: FileSettings;
  status: "pending" | "processing" | "completed" | "error";
  error?: string;
  resultBlob?: Blob;
  resultName?: string;
}

export interface FileSettings {
  // Converter
  format?: OutputFormat;
  quality?: number;
  
  // Resizer
  width?: number;
  height?: number;
  mode?: ResizeMode;
  
  // Optimizer
  stripExif?: boolean;
  stripGps?: boolean;
  fixOrientation?: boolean;
  
  // Cropper
  x?: number;
  y?: number;
  cropWidth?: number;
  cropHeight?: number;
  
  // Watermark
  text?: string;
  fontSize?: number;
  color?: string;
  opacity?: number;
  position?: WatermarkPosition;
  watermarkFile?: File;
  scale?: number;
}

// ============================================================================
// SESSION STORAGE TYPES
// ============================================================================

export interface StoredFile {
  id: string;
  name: string;
  blob: string; // base64
  timestamp: number;
  size: number;
  toolType: ToolType;
}

export interface SessionStorageData {
  files: StoredFile[];
  totalSize: number;
  lastUpdated: number;
}

// ============================================================================
// TOOL CONFIG TYPES
// ============================================================================

export interface ToolConfig {
  type: ToolType;
  title: string;
  description: string;
  acceptedFormats: string[];
  maxFiles: number;
  showPreview: boolean;
  primaryColor: string;
  dropzoneColor: string;
  dropzoneColorDark: string;
  defaultSettings: Partial<FileSettings>;
}

// ============================================================================
// API REQUEST TYPES
// ============================================================================

export interface ConvertRequest {
  format: OutputFormat;
  quality: number;
  url?: string;
}

export interface CompressRequest {
  quality: number;
  format?: OutputFormat;
  url?: string;
}

export interface ResizeRequest {
  width?: number;
  height?: number;
  mode: ResizeMode;
  format?: OutputFormat;
  url?: string;
}

export interface OptimizeRequest {
  stripExif: boolean;
  stripGps: boolean;
  fixOrientation: boolean;
  url?: string;
}

export interface CropRequest {
  x: number;
  y: number;
  width: number;
  height: number;
  format?: OutputFormat;
  url?: string;
}

export interface TextWatermarkRequest {
  text: string;
  fontSize: number;
  color: string;
  opacity: number;
  position: WatermarkPosition;
  url?: string;
}

export interface ImageWatermarkRequest {
  scale: number;
  opacity: number;
  position: WatermarkPosition;
  url?: string;
}

// ============================================================================
// DYNAMIC DATA TYPES
// ============================================================================

export interface DynamicPageData {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
}

export interface ToolDynamicData {
  [slug: string]: DynamicPageData;
}