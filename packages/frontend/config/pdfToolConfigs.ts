// ============================================================================
// FILE: src/config/pdfToolConfigs.ts
// PURPOSE: Configuration for each PDF tool (colors, settings, defaults)
// ============================================================================

import type { PdfToolConfig } from "@/services/pdfService/types";

export const PDF_TOOL_CONFIGS: Record<string, PdfToolConfig> = {
  "pdf-compressor": {
    type: "compress-pdf",
    title: "PDF Compressor",
    description: "Compress PDFs using Ghostscript",
    acceptedFormats: ["application/pdf"],
    maxFiles: 5,
    showPreview: false,
    primaryColor: "#ef4444",
    dropzoneColor: "#fef2f2",
    dropzoneColorDark: "#ef44441A",
    defaultSettings: {
      level: "ebook",
    },
  },

  "pdf-merge": {
    type: "pdf-merge",
    title: "PDF Merger",
    description: "Combine multiple PDFs into one",
    acceptedFormats: ["application/pdf"],
    maxFiles: 10,
    showPreview: false,
    primaryColor: "#9333ea",
    dropzoneColor: "#faf5ff",
    dropzoneColorDark: "#9333ea1A",
    defaultSettings: {},
  },

  "pdf-split": {
    type: "pdf-split",
    title: "PDF Splitter",
    description: "Split PDF into separate pages",
    acceptedFormats: ["application/pdf"],
    maxFiles: 1,
    showPreview: false,
    primaryColor: "#0891b2",
    dropzoneColor: "#ecfeff",
    dropzoneColorDark: "#0891b21A",
    defaultSettings: {
      pages: "1-3",
    },
  },

  "pdf-to-images": {
    type: "pdf-to-images",
    title: "PDF to Images",
    description: "Convert PDF pages to images",
    acceptedFormats: ["application/pdf"],
    maxFiles: 1,
    showPreview: false,
    primaryColor: "#14b8a6",
    dropzoneColor: "#f0fdfa",
    dropzoneColorDark: "#14b8a61A",
    defaultSettings: {
      format: "png",
      dpi: 150,
    },
  },

  "images-to-pdf": {
    type: "images-to-pdf",
    title: "Images to PDF",
    description: "Combine images into PDF",
    acceptedFormats: ["image/jpeg", "image/png", "image/webp", "image/jpg"],
    maxFiles: 10,
    showPreview: false,
    primaryColor: "#f97316",
    dropzoneColor: "#fff7ed",
    dropzoneColorDark: "#f973161A",
    defaultSettings: {},
  },

  "pdf-extract-text": {
    type: "extract-text",
    title: "Extract Text from PDF",
    description: "Extract text content from PDF",
    acceptedFormats: ["application/pdf"],
    maxFiles: 1,
    showPreview: false,
    primaryColor: "#84cc16",
    dropzoneColor: "#f7fee7",
    dropzoneColorDark: "#84cc161A",
    defaultSettings: {
      preserve_layout: false,
    },
  },

  "pdf-extract-images": {
    type: "extract-images",
    title: "Extract Images from PDF",
    description: "Extract all images from PDF",
    acceptedFormats: ["application/pdf"],
    maxFiles: 1,
    showPreview: false,
    primaryColor: "#3b82f6",
    dropzoneColor: "#eff6ff",
    dropzoneColorDark: "#3b82f61A",
    defaultSettings: {
      min_width: 100,
      min_height: 100,
    },
  },

  "pdf-watermark": {
    type: "add-watermark",
    title: "Add Watermark to PDF",
    description: "Add text or image watermark",
    acceptedFormats: ["application/pdf"],
    maxFiles: 1,
    showPreview: true,
    primaryColor: "#d946ef",
    dropzoneColor: "#fdf4ff",
    dropzoneColorDark: "#d946ef1A",
    defaultSettings: {
      text: "CONFIDENTIAL",
      opacity: 0.3,
      position: "center",
      font_size: 50,
      rotation: 45,
      color: "gray",
    },
  },

  "pdf-rotate": {
    type: "pdf-rotate",
    title: "Rotate PDF Pages",
    description: "Rotate specific PDF pages",
    acceptedFormats: ["application/pdf"],
    maxFiles: 1,
    showPreview: false,
    primaryColor: "#ec4899",
    dropzoneColor: "#fdf2f8",
    dropzoneColorDark: "#ec48991A",
    defaultSettings: {
      rotations: "1:90",
    },
  },

  "pdf-encrypt": {
    type: "pdf-encrypt",
    title: "Secure PDF",
    description: "Add password protection",
    acceptedFormats: ["application/pdf"],
    maxFiles: 1,
    showPreview: false,
    primaryColor: "#10b981",
    dropzoneColor: "#f0fdf4",
    dropzoneColorDark: "#10b9811A",
    defaultSettings: {
      user_password: "",
    },
  },

  "pdf-decrypt": {
    type: "pdf-decrypt",
    title: "Unlock PDF",
    description: "Remove password protection",
    acceptedFormats: ["application/pdf"],
    maxFiles: 1,
    showPreview: false,
    primaryColor: "#eab308",
    dropzoneColor: "#fefce8",
    dropzoneColorDark: "#eab3081A",
    defaultSettings: {
      password: "",
    },
  },

  "pdf-optimize": {
    type: "optimize-pdf",
    title: "PDF Optimizer",
    description: "Remove metadata and optimize",
    acceptedFormats: ["application/pdf"],
    maxFiles: 1,
    showPreview: false,
    primaryColor: "#84cc16",
    dropzoneColor: "#f7fee7",
    dropzoneColorDark: "#84cc161A",
    defaultSettings: {
      remove_metadata: true,
      remove_annotations: true,
      remove_javascript: true,
      remove_links: true,
      compress_images: false,
    },
  },

  "pdf-flatten": {
    type: "flatten-pdf",
    title: "Flatten PDF",
    description: "Remove layers and transparency",
    acceptedFormats: ["application/pdf"],
    maxFiles: 1,
    showPreview: false,
    primaryColor: "#6366f1",
    dropzoneColor: "#eef2ff",
    dropzoneColorDark: "#6366f11A",
    defaultSettings: {},
  },

  // ========================================================================
  // NEW: SIGN PDF
  // ========================================================================
  "pdf-sign": {
    type: "sign-pdf",
    title: "Sign PDF",
    description: "Add signature to PDF document",
    acceptedFormats: ["application/pdf"],
    maxFiles: 1,
    showPreview: true,
    primaryColor: "#8b5cf6",
    dropzoneColor: "#f5f3ff",
    dropzoneColorDark: "#8b5cf61A",
    defaultSettings: {
      signature_text: "John Doe",
      x: 50,
      y: 700,
      width: 200,
      height: 80,
      page: 0,
    },
  },

  // ========================================================================
  // NEW: CROP PDF
  // ========================================================================
  "pdf-crop": {
    type: "crop-pdf",
    title: "Crop PDF Pages",
    description: "Crop all pages to specific dimensions",
    acceptedFormats: ["application/pdf"],
    maxFiles: 1,
    showPreview: false,
    primaryColor: "#06b6d4",
    dropzoneColor: "#ecfeff",
    dropzoneColorDark: "#06b6d41A",
    defaultSettings: {
      crop_x: 50,
      crop_y: 50,
      crop_width: 500,
      crop_height: 700,
    },
  },

  // ========================================================================
  // NEW: CONVERT TO PDF/A
  // ========================================================================
  "pdf-to-pdfa": {
    type: "convert-pdfa",
    title: "Convert to PDF/A",
    description: "Convert to archival PDF/A format",
    acceptedFormats: ["application/pdf"],
    maxFiles: 1,
    showPreview: false,
    primaryColor: "#64748b",
    dropzoneColor: "#f8fafc",
    dropzoneColorDark: "#64748b1A",
    defaultSettings: {
      version: "2b",
    },
  },

  "ocr-searchable": {
    type: "ocr-searchable",
    title: "OCR: Make Searchable",
    description: "Convert scanned PDF to searchable",
    acceptedFormats: ["application/pdf"],
    maxFiles: 1,
    showPreview: false,
    primaryColor: "#a855f7",
    dropzoneColor: "#faf5ff",
    dropzoneColorDark: "#a855f71A",
    defaultSettings: {
      language: "eng",
      dpi: 300,
    },
  },

  
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getPdfToolConfig = (toolSlug: string): PdfToolConfig | undefined => {
  return PDF_TOOL_CONFIGS[toolSlug];
};

export const getPdfAcceptString = (toolSlug: string): string => {
  const config = getPdfToolConfig(toolSlug);
  return config?.acceptedFormats.join(",") || "";
};