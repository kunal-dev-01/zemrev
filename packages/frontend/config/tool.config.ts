// ============================================================================
// FILE: src/config/toolConfigs.ts
// PURPOSE: Configuration for each tool (colors, settings, defaults)
// ============================================================================

import type { ToolConfig } from "@/services/imageService/types";

export const TOOL_CONFIGS: Record<string, ToolConfig> = {
  converter: {
    type: "converter",
    title: "Image Converter",
    description: "Convert images between formats",
    acceptedFormats: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/bmp",
      "image/tiff",
      "image/avif",
      "image/heic",
      "image/heif",
    ],
    maxFiles: 5,
    showPreview: false,
    primaryColor: "#3b82f6", // blue-500
    dropzoneColor: "#dbeafe", // blue-100
    defaultSettings: {
      format: "webp",
      quality: 75,
    },
  },

  compressor: {
    type: "compressor",
    title: "Image Compressor",
    description: "Compress images to reduce file size",
    acceptedFormats: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ],
    maxFiles: 5,
    showPreview: false,
    primaryColor: "#10b981", // green-500
    dropzoneColor: "#d1fae5", // green-100
    defaultSettings: {
      quality: 75,
    },
  },

  resizer: {
    type: "resizer",
    title: "Image Resizer",
    description: "Resize images to specific dimensions",
    acceptedFormats: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ],
    maxFiles: 5,
    showPreview: false,
    primaryColor: "#8b5cf6", // violet-500
    dropzoneColor: "#ede9fe", // violet-100
    defaultSettings: {
      mode: "contain",
      width: 1920,
      height: 1080,
    },
  },

  optimizer: {
    type: "optimizer",
    title: "Image Optimizer",
    description: "Optimize images and remove metadata",
    acceptedFormats: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ],
    maxFiles: 5,
    showPreview: false,
    primaryColor: "#f59e0b", // amber-500
    dropzoneColor: "#fef3c7", // amber-100
    defaultSettings: {
      stripExif: true,
      stripGps: true,
      fixOrientation: true,
    },
  },

  cropper: {
    type: "cropper",
    title: "Image Cropper",
    description: "Crop images to desired area",
    acceptedFormats: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ],
    maxFiles: 1,
    showPreview: true,
    primaryColor: "#ec4899", // pink-500
    dropzoneColor: "#fce7f3", // pink-100
    defaultSettings: {
      x: 0,
      y: 0,
      cropWidth: 500,
      cropHeight: 500,
    },
  },

  watermark: {
    type: "watermark",
    title: "Image Watermark",
    description: "Add text or image watermarks",
    acceptedFormats: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ],
    maxFiles: 1,
    showPreview: true,
    primaryColor: "#06b6d4", // cyan-500
    dropzoneColor: "#cffafe", // cyan-100
    defaultSettings: {
      text: "Watermark",
      fontSize: 48,
      color: "#FFFFFF",
      opacity: 0.5,
      position: "bottom-right",
    },
  },
};

// ============================================================================
// FORMAT MAPPINGS
// ============================================================================

export const FORMAT_EXTENSIONS: Record<string, string[]> = {
  jpeg: [".jpg", ".jpeg"],
  png: [".png"],
  webp: [".webp"],
  avif: [".avif"],
  gif: [".gif"],
  bmp: [".bmp"],
  tiff: [".tiff", ".tif"],
  heic: [".heic"],
  heif: [".heif"],
};

export const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/bmp": "bmp",
  "image/tiff": "tiff",
  "image/avif": "avif",
  "image/heic": "heic",
  "image/heif": "heif",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getToolConfig = (toolType: string): ToolConfig | undefined => {
  return TOOL_CONFIGS[toolType];
};

export const getAcceptString = (toolType: string): string => {
  const config = getToolConfig(toolType);
  return config?.acceptedFormats.join(",") || "";
};

export const detectFormatFromFilename = (filename: string): string | null => {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext) return null;

  for (const [format, extensions] of Object.entries(FORMAT_EXTENSIONS)) {
    if (extensions.some((e) => e === `.${ext}`)) {
      return format;
    }
  }

  return null;
};

export const getOutputFilename = (
  originalName: string,
  newFormat: string
): string => {
  const baseName = originalName.replace(/\.[^/.]+$/, "");
  return `${baseName}.${newFormat}`;
};