// ============================================================================
// FILE: services/imageService/types.ts
// PURPOSE: Complete type definitions for image tools
// ============================================================================

export type OutputFormat = 
  | "jpeg" | "jpg" | "png" | "webp" | "avif" 
  | "tiff" | "heic" | "heif";

export type ResizeMode = "contain" | "cover" | "stretch" | "exact";

export type WatermarkPosition = 
  | "top-left" | "top-right" 
  | "bottom-left" | "bottom-right" 
  | "center";

export type ToolType = 
  | "converter" | "compressor" | "resizer" 
  | "optimizer" | "cropper" | "watermark"
  | "palette" | "metadata";

// ============================================================================
// FILE PROCESSING TYPES
// ============================================================================

export interface ProcessedFile {
  id: string;
  originalFile: File | null;
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

  num_colors?: number
}

// ============================================================================
// SESSION STORAGE TYPES
// ============================================================================

export interface StoredFile {
  id: string;
  name: string;
  blob?: string;
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

// PALETTE EXTRACTOR
export interface PaletteRequest {
  num_colors?: number;
  url?: string;
}

export interface ColorInfo {
  hex: string;
  rgb: [number, number, number];
  percentage: number;
}

export interface PaletteResponse {
  success: boolean;
  filename: string;
  palette: ColorInfo[];
  total_colors: number;
  preview_image: {
    filename: string;
    data: string; // base64
    size: number;
  };
}

// METADATA EXTRACTOR
export interface MetadataRequest {
  url?: string;
}

export interface MetadataResponse {
  success: boolean;
  filename: string;
  metadata: {
    file: {
      filename: string;
      size_bytes: number;
      size_kb: number;
      size_mb: number;
      format: string;
      mime_type: string;
      extension: string;
    };
    image: {
      width: number;
      height: number;
      dimensions: string;
      aspect_ratio: string;
      orientation: string;
      megapixels: number;
      bands: number;
      has_alpha: boolean;
      format: string;
    };
    exif: {
      has_exif: boolean;
      camera: Record<string, any>;
      settings: Record<string, any>;
      location: Record<string, any>;
      datetime: Record<string, any>;
      other: Record<string, any>;
    };
    technical: {
      color_space: string;
      bit_depth: number | string;
      coding: string;
      bands: number;
      format: string;
      x_resolution: number | null;
      y_resolution: number | null;
      x_offset: number;
      y_offset: number;
    };
    color: {
      has_alpha: boolean;
      is_grayscale: boolean;
      is_rgb: boolean;
      brightness?: {
        min: number;
        max: number;
        avg: number;
      };
    };
  };
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