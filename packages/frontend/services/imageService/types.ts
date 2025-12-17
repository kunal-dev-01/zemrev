// ============================================================================
// BASE TYPES
// ============================================================================

export type OutputFormat =
  | "jpeg"
  | "jpg"
  | "png"
  | "webp"
  | "avif"
  | "tiff"
  | "heic"
  | "heif";

export type ResizeMode = "contain" | "cover" | "stretch" | "exact";

export type WatermarkPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center";

export type ToolType =
  | "converter"
  | "compressor"
  | "resizer"
  | "optimizer"
  | "cropper"
  | "watermark"
  | "palette"
  | "metadata";


export type FormDataParams = Record<string, string | number | boolean | undefined>;

// ============================================================================
// FILE SETTINGS (Shared across all tools)
// ============================================================================

export interface FileSettings {
  // Converter
  format?: OutputFormat;
  quality?: number;
  stripMetadata?: boolean;

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

  // Palette
  num_colors?: number;
}

// ============================================================================
// PROCESSED FILE (Frontend Worker / UI State)
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
// TOOL CONFIGURATION TYPES (Frontend Page Config)
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
// API REQUEST TYPES (STRICT — BACKEND SAFE)
// ============================================================================

export interface ConvertRequest extends FormDataParams {
  format: OutputFormat;
  quality: number;
  strip_metadata?: boolean;
}

export interface CompressRequest extends FormDataParams {
  quality: number;
  format?: OutputFormat;
}

export interface ResizeRequest extends FormDataParams {
  width?: number;
  height?: number;
  mode: ResizeMode;
  format?: OutputFormat;
}

export interface OptimizeRequest extends FormDataParams {
  stripExif: boolean;
  stripGps: boolean;
  fixOrientation: boolean;
}

export interface CropRequest extends FormDataParams {
  x: number;
  y: number;
  width: number;
  height: number;
  format?: OutputFormat;
}

export interface TextWatermarkRequest extends FormDataParams {
  text: string;
  fontSize: number;
  color: string;
  opacity: number;
  position: WatermarkPosition;
}

export interface ImageWatermarkRequest extends FormDataParams {
  scale: number;
  opacity: number;
  position: WatermarkPosition;
}

export interface PaletteRequest extends FormDataParams {
  num_colors?: number;
}

// ============================================================================
// PALETTE RESPONSE TYPES
// ============================================================================

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
    data: string; 
    size: number;
  };
}

// ============================================================================
// METADATA RESPONSE TYPES
// ============================================================================

export interface ExifCameraInfo {
  make?: string;
  model?: string;
  lens?: string;
}

export interface ExifSettingsInfo {
  iso?: number;
  exposure_time?: string;
  aperture?: string;
  focal_length?: string;
}

export interface ExifLocationInfo {
  latitude?: number;
  longitude?: number;
}

export interface ExifDatetimeInfo {
  original?: string;
  digitized?: string;
}

export interface ExifOtherInfo {
  [key: string]: string | number | boolean | null | undefined;
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
      camera: ExifCameraInfo;
      settings: ExifSettingsInfo;
      location: ExifLocationInfo;
      datetime: ExifDatetimeInfo;
      other: ExifOtherInfo;
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
// DYNAMIC PAGE TYPES
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
