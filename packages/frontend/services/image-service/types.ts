// services/image-service/types.ts

// ==================== ENUMS ====================

export enum OutputFormat {
  JPEG = "jpeg",
  JPG = "jpg",
  PNG = "png",
  WEBP = "webp",
  AVIF = "avif",
  HEIC = "heic",
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

export enum ToolType {
  CONVERT = "convert",
  COMPRESS = "compress",
  RESIZE = "resize",
  OPTIMIZE = "optimize",
  CROP = "crop",
  WATERMARK_TEXT = "watermark_text",
  WATERMARK_IMAGE = "watermark_image",
}

// ==================== REQUEST TYPES ====================

export interface ConvertRequest {
  file?: File;
  url?: string;
  format: OutputFormat;
  quality: number; // 1-100
}

export interface CompressRequest {
  file?: File;
  url?: string;
  quality: number; // 1-100
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
  font_size: number; // 10-200
  color: string; // Hex color
  opacity: number; // 0.0-1.0
  position: WatermarkPosition;
}

export interface ImageWatermarkRequest {
  file?: File;
  url?: string;
  watermark: File;
  scale: number; // 0.01-1.0
  opacity: number; // 0.0-1.0
  position: WatermarkPosition;
}

// ==================== RESPONSE TYPES ====================

export interface ToolResponse {
  status: string;
  message: string;
  data: {
    filename: string;
    original_size: number;
    output_size: number;
    processing_time: number;
    download_url?: string;
  };
}


// ==================== STATE TYPES ====================

export interface ImageState {
  currentTool: ImageType | null;
  isProcessing: boolean;
  progress: number; // 0-100
  result: ToolResponse | null;
  error: string | null;
  history: ToolHistoryItem[];
}

export interface ToolHistoryItem {
  id: string;
  tool: ToolType;
  timestamp: number;
  filename: string;
  success: boolean;
  error?: string;
}

// ==================== ERROR TYPES ====================

export interface ToolError {
  status: string;
  message: string;
  error?: string;
  statusCode?: number;
}