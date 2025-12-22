import type { PdfToolConfig } from "@/services/pdfService/types";

export const PDF_TOOL_CONFIGS: Record<string, PdfToolConfig> = {
  "pdf-compressor": {
    type: "compress-pdf",
    title: "PDF Compressor",
    description: "Compress PDFs using Ghostscript",
    acceptedFormats: ["application/pdf"],
    maxFiles: 5,
    maxSize: 80,
    maxPages: 250,
    showPreview: false,
    primaryColor: "#DC2626",
    dropzoneColor: "#FEF2F2",
    dropzoneColorDark: "#DC26261A",
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
    maxSize: 150,
    maxPages: 400,
    showPreview: false,
    primaryColor: "#9333EA",
    dropzoneColor: "#FAF5FF",
    dropzoneColorDark: "#9333EA1A",
    defaultSettings: {},
  },

  "pdf-split": {
    type: "pdf-split",
    title: "PDF Splitter",
    description: "Split PDF into separate pages",
    acceptedFormats: ["application/pdf"],
    maxFiles: 1,
    maxSize: 150,
    maxPages: 400,
    showPreview: false,
    primaryColor: "#0891B2",
    dropzoneColor: "#ECFEFF",
    dropzoneColorDark: "#0891B21A",
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
    maxSize: 60,
    maxPages: 300,
    showPreview: false,
    primaryColor: "#0D9488",
    dropzoneColor: "#F0FDFA",
    dropzoneColorDark: "#0D94881A",
    defaultSettings: {
      format: "jpeg",
      dpi: 150,
    },
  },

  "images-to-pdf": {
    type: "images-to-pdf",
    title: "Images to PDF",
    description: "Combine images into PDF",
    acceptedFormats: ["image/jpeg", "image/png", "image/webp", "image/jpg"],
    maxFiles: 10,
    maxSize: 60,
    maxPages: 300,
    showPreview: false,
    primaryColor: "#EA580C",
    dropzoneColor: "#FFF7ED",
    dropzoneColorDark: "#EA580C1A",
    defaultSettings: {},
  },

  "pdf-extract-text": {
    type: "extract-text",
    title: "Extract Text from PDF",
    description: "Extract text content from PDF",
    acceptedFormats: ["application/pdf"],
    maxFiles: 1,
    maxSize: 60,
    maxPages: 300,
    showPreview: false,
    primaryColor: "#7C3AED",
    dropzoneColor: "#F5F3FF",
    dropzoneColorDark: "#7C3AED1A",
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
    maxSize: 60,
    maxPages: 300,
    showPreview: false,
    primaryColor: "#2563EB",
    dropzoneColor: "#EFF6FF",
    dropzoneColorDark: "#2563EB1A",
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
    maxSize: 60,
    maxPages: 300,
    showPreview: true,
    primaryColor: "#C026D3",
    dropzoneColor: "#FDF4FF",
    dropzoneColorDark: "#C026D31A",
    defaultSettings: {
      signatures: [],
    },
  },

  "pdf-rotate": {
    type: "pdf-rotate",
    title: "Rotate PDF Pages",
    description: "Rotate specific PDF pages",
    acceptedFormats: ["application/pdf"],
    maxFiles: 1,
    maxSize: 150,
    maxPages: 400,
    showPreview: false,
    primaryColor: "#DB2777",
    dropzoneColor: "#FDF2F8",
    dropzoneColorDark: "#DB27771A",
    defaultSettings: {
      rotations: "1:0",
    },
  },

  "pdf-encrypt": {
    type: "pdf-encrypt",
    title: "Secure PDF",
    description: "Add password protection",
    acceptedFormats: ["application/pdf"],
    maxFiles: 1,
    maxSize: 150,
    maxPages: 400,
    showPreview: false,
    primaryColor: "#059669",
    dropzoneColor: "#ECFDF5",
    dropzoneColorDark: "#0596691A",
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
    maxSize: 150,
    maxPages: 400,
    showPreview: false,
    primaryColor: "#CA8A04",
    dropzoneColor: "#FEFCE8",
    dropzoneColorDark: "#CA8A041A",
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
    maxSize: 60,
    maxPages: 300,
    showPreview: false,
    primaryColor: "#65A30D",
    dropzoneColor: "#F7FEE7",
    dropzoneColorDark: "#65A30D1A",
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
    maxSize: 80,
    maxPages: 250,
    showPreview: false,
    primaryColor: "#0284C7",
    dropzoneColor: "#F0F9FF",
    dropzoneColorDark: "#0284C71A",
    defaultSettings: {},
  },

  "pdf-sign": {
    type: "sign-pdf",
    title: "Sign PDF",
    description: "Add signature to PDF document",
    acceptedFormats: ["application/pdf"],
    maxFiles: 1,
    maxSize: 60,
    maxPages: 300,
    showPreview: true,
    primaryColor: "#B45309",
    dropzoneColor: "#FFFBEB",
    dropzoneColorDark: "#B453091A",
    defaultSettings: {
      signatures: [],
    },
  },


  "pdf-crop": {
    type: "crop-pdf",
    title: "Crop PDF Pages",
    description: "Crop all pages to specific dimensions",
    acceptedFormats: ["application/pdf"],
    maxFiles: 1,
    maxSize: 60,
    maxPages: 300,
    showPreview: false,
    primaryColor: "#4D7C0F",
    dropzoneColor: "#F7FEE7",
    dropzoneColorDark: "#4D7C0F1A",
    defaultSettings: {
      crop_x: 50,
      crop_y: 50,
      crop_width: 500,
      crop_height: 700,
      crop_page_range: undefined,
    },
  },


  "pdf-to-pdfa": {
    type: "convert-pdfa",
    title: "Convert to PDF/A",
    description: "Convert to archival PDF/A format",
    acceptedFormats: ["application/pdf"],
    maxFiles: 1,
    maxSize: 80,
    maxPages: 250,
    showPreview: false,
    primaryColor: "#0F766E",
    dropzoneColor: "#F0FDFA",
    dropzoneColorDark: "#0F766E1A",
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
    maxSize: 10,
    maxPages: 40,
    showPreview: false,
    primaryColor: "#4F46E5",
    dropzoneColor: "#EEF2FF",
    dropzoneColorDark: "#4F46E51A",
    defaultSettings: {
      language: "eng",
      dpi: 300,
    },
  },

  "pdf-remove-pages": {
    type: "pdf-remove-pages",
    title: "Remove PDF Pages",
    description: "Remove specific pages from PDF",
    acceptedFormats: ["application/pdf"],
    maxFiles: 1,
    maxSize: 60,
    maxPages: 300,
    showPreview: false,
    primaryColor: "#475569", 
    dropzoneColor: "#F8FAFC",
    dropzoneColorDark: "rgba(71, 85, 105, 0.10)",
    defaultSettings: {
      pages_to_remove: "", 
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