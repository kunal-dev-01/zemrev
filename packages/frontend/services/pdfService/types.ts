// ============================================================================
// CORE ENUM / UNION TYPES
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
  | "convert-pdfa";

export type ImageFormat = "png" | "jpeg" | "jpg";
export type CompressionLevel = "screen" | "ebook" | "printer" | "prepress";
export type PdfAVersion = "1b" | "2b" | "3b";

export type FormDataParams = Record<
  string,
  string | number | boolean | undefined
>;

// ============================================================================
// FONT CONSTANTS
// ============================================================================

export const WATERMARK_FONTS = [
  { value: "Arial", label: "Arial" },
  { value: "Arial Black", label: "Arial Black (Bold)" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Courier New", label: "Courier New" },
  { value: "Impact", label: "Impact" },
  { value: "Comic Sans MS", label: "Comic Sans MS" },
  { value: "Georgia", label: "Georgia" },
  { value: "Verdana", label: "Verdana" },
] as const;

export const SIGNATURE_FONTS = [
  { value: "Arial", label: "Arial" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Courier New", label: "Courier New" },
  { value: "Georgia", label: "Georgia" },
  { value: "Verdana", label: "Verdana" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Brush Script MT", label: "Brush Script (Cursive)" },
  { value: "Lucida Handwriting", label: "Lucida Handwriting" },
] as const;

// ============================================================================
// SIGNATURE TYPES
// ============================================================================

export interface SignatureItem {
  id: string;
  type: "text" | "image";
  text?: string;
  font?: string;
  imageFile?: File;
  imagePreview?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  selected?: boolean;
}

// ============================================================================
// FILE-LEVEL SETTINGS (USED PER PDF)
// ============================================================================

export interface PdfFileSettings {
  // Split
  pages?: string;

  // Rotate
  rotations?: string;

  // Encrypt / Decrypt
  user_password?: string;
  owner_password?: string;
  password?: string;

  // PDF → Images
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
  font?: string;
  opacity?: number;
  font_size?: number;
  rotation?: number;
  color?: string;
  watermarkFile?: File;
  x?: number;
  y?: number;
  width?: number;
  height?: number;

  // Optimize
  remove_metadata?: boolean;
  remove_annotations?: boolean;
  remove_javascript?: boolean;
  remove_links?: boolean;
  compress_images?: boolean;

  // Compress
  level?: CompressionLevel;

  // Sign
  signatures?: SignatureItem[];

  // Crop
  crop_x?: number;
  crop_y?: number;
  crop_width?: number;
  crop_height?: number;
  crop_page_range?: string;

  // PDF/A
  version?: PdfAVersion;

  // OCR
  language?: string;
}

// ============================================================================
// PROCESSED FILE STATE
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
// API REQUEST PAYLOADS
// ============================================================================

// Split
export interface SplitPdfRequest extends FormDataParams {
  pages: string;
}

// Rotate
export interface RotatePdfRequest extends FormDataParams {
  rotations: string;
}

// Encrypt / Decrypt
export interface EncryptPdfRequest extends FormDataParams {
  user_password?: string;
  owner_password?: string;
}

export interface DecryptPdfRequest extends FormDataParams {
  password: string;
}

// PDF → Images
export interface PdfToImagesRequest extends FormDataParams {
  format: ImageFormat;
  dpi: number;
  page_range?: string;
}

// Extract
export interface ExtractTextRequest extends FormDataParams {
  page_range?: string;
  preserve_layout: boolean;
}

export interface ExtractImagesRequest extends FormDataParams {
  page_range?: string;
  min_width: number;
  min_height: number;
}

// Watermark
export interface AddWatermarkRequest extends FormDataParams {
  text?: string;
  font?: string;
  opacity: number;
  font_size?: number;
  rotation?: number;
  color?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// Optimize
export interface OptimizePdfRequest extends FormDataParams {
  remove_metadata: boolean;
  remove_annotations: boolean;
  remove_javascript: boolean;
  remove_links: boolean;
  compress_images: boolean;
}

// Compress
export interface CompressPdfRequest extends FormDataParams {
  level: CompressionLevel;
}

// Sign
export interface SignPdfRequest extends FormDataParams {
  signatures_json: string;
}

// Crop
export interface CropPdfRequest extends FormDataParams {
  x: number;
  y: number;
  width: number;
  height: number;
  page_range?: string;
}

// PDF/A
export interface ConvertToPdfARequest extends FormDataParams {
  version: PdfAVersion;
}

// OCR
export interface OcrPdfRequest extends FormDataParams {
  language: string;
  dpi: number;
}

// ============================================================================
// API RESPONSES
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
