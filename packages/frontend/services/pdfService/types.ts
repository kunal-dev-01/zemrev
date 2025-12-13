// ============================================================================
// FILE: src/services/pdfService/types.ts
// PURPOSE: Strongly typed definitions for all PDF tools (23 tools)
// ============================================================================

// ============================================================================
// BASE TYPES
// ============================================================================

export type PdfToolType =
  | "pdf-merge"
  | "pdf-split"
  | "pdf-rotate"
  | "pdf-encrypt"
  | "pdf-decrypt"
  | "pdf-to-images"
  | "images-to-pdf"
  | "extract-text"
  | "extract-images"
  | "add-watermark"
  | "optimize-pdf"
  | "compress-pdf"
  | "flatten-pdf"
  | "ocr-searchable"
  | "sign-pdf"
  | "crop-pdf"
  | "convert-pdfa"

export type ImageFormat = "png" | "jpeg" | "jpg";
export type CompressionLevel = "screen" | "ebook" | "printer" | "prepress";
export type WatermarkPosition = "center" | "top_left" | "top_right" | "bottom_left" | "bottom_right";
export type PdfAVersion = "1b" | "2b" | "3b";

export type FormDataParams = Record<string, string | number | boolean | undefined>;

// ============================================================================
// FILE SETTINGS
// ============================================================================

export interface PdfFileSettings {
  // Split
  pages?: string;
  
  // Rotate
  rotations?: string;
  
  // Encrypt
  user_password?: string;
  owner_password?: string;
  
  // Decrypt
  password?: string;
  
  // PDF to Images
  format?: ImageFormat;
  dpi?: number;
  page_range?: string;
  
  // Extract Text
  preserve_layout?: boolean;
  
  // Extract Images
  min_width?: number;
  min_height?: number;
  
  // Watermark
  text?: string;
  opacity?: number;
  position?: WatermarkPosition;
  font_size?: number;
  rotation?: number;
  color?: string;
  watermarkFile?: File;
  
  // Optimize
  remove_metadata?: boolean;
  remove_annotations?: boolean;
  remove_javascript?: boolean;
  remove_links?: boolean;
  compress_images?: boolean;
  
  // Compress (Ghostscript)
  level?: CompressionLevel;

  // Sign PDF
  signature_text?: string;
  signatureFile?: File;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  page?: number;
  
  // Crop PDF
  crop_x?: number;
  crop_y?: number;
  crop_width?: number;
  crop_height?: number;
  
  // PDF/A
  version?: PdfAVersion;
  
  // OCR
  language?: string;
}

// ============================================================================
// PROCESSED FILE
// ============================================================================

export interface PdfProcessedFile {
  id: string;
  originalFile: File | null;
  name: string;
  size: number;
  type: string;
  settings: PdfFileSettings;
  status: "pending" | "processing" | "completed" | "error";
  error?: string;
  resultBlob?: Blob;
  resultName?: string;
}

// ============================================================================
// SESSION STORAGE
// ============================================================================

export interface PdfStoredFile {
  id: string;
  name: string;
  blob?: string;
  timestamp: number;
  size: number;
  toolType: PdfToolType;
}

export interface PdfSessionStorageData {
  files: PdfStoredFile[];
  totalSize: number;
  lastUpdated: number;
}

// ============================================================================
// TOOL CONFIGURATION
// ============================================================================

export interface PdfToolConfig {
  type: PdfToolType;
  title: string;
  description: string;
  acceptedFormats: string[];
  maxFiles: number;
  showPreview: boolean;
  primaryColor: string;
  dropzoneColor: string;
  dropzoneColorDark: string;
  defaultSettings: Partial<PdfFileSettings>;
}

// ============================================================================
// API REQUEST TYPES
// ============================================================================

// pypdf
export interface MergePdfRequest extends FormDataParams {
  // files array handled separately
}

export interface SplitPdfRequest extends FormDataParams {
  pages: string;
}

export interface RotatePdfRequest extends FormDataParams {
  rotations: string;
}

export interface EncryptPdfRequest extends FormDataParams {
  user_password?: string;
  owner_password?: string;
}

export interface DecryptPdfRequest extends FormDataParams {
  password: string;
}

// PyMuPDF
export interface PdfToImagesRequest extends FormDataParams {
  format: ImageFormat;
  dpi: number;
  page_range?: string;
}

export interface ImagesToPdfRequest extends FormDataParams {
  // files array handled separately
}

export interface ExtractTextRequest extends FormDataParams {
  page_range?: string;
  preserve_layout: boolean;
}

export interface ExtractImagesRequest extends FormDataParams {
  page_range?: string;
  min_width: number;
  min_height: number;
}

export interface AddWatermarkRequest extends FormDataParams {
  text?: string;
  opacity: number;
  position: WatermarkPosition;
  font_size?: number;
  rotation?: number;
  color?: string;
}

export interface OptimizePdfRequest extends FormDataParams {
  remove_metadata: boolean;
  remove_annotations: boolean;
  remove_javascript: boolean;
  remove_links: boolean;
  compress_images: boolean;
}

// Ghostscript
export interface CompressPdfRequest extends FormDataParams {
  level: CompressionLevel;
}

export interface FlattenPdfRequest extends FormDataParams {
  // no params
}

// NEW: Sign PDF
export interface SignPdfRequest extends FormDataParams {
  signature_text?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

// NEW: Crop PDF
export interface CropPdfRequest extends FormDataParams {
  x: number;
  y: number;
  width: number;
  height: number;
}

// NEW: Convert to PDF/A
export interface ConvertToPdfARequest extends FormDataParams {
  version: PdfAVersion;
}


// OCR
export interface OcrPdfRequest extends FormDataParams {
  language: string;
  dpi: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ExtractTextResponse {
  text: string;
  page_count: number;
  char_count: number;
}

export interface OptimizePdfResponse {
  original_size_kb: number;
  optimized_size_kb: number;
  reduction_percent: number;
}

export interface CompressPdfResponse {
  original_size_kb: number;
  compressed_size_kb: number;
  reduction_percent: number;
  compression_level: string;
}