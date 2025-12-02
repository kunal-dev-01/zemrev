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
    primaryColor: "#10b981", 
    dropzoneColor: "#ecfdf5",
    dropzoneColorDark: "#10b9811A",
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
    primaryColor: "#3b82f6", 
    dropzoneColor: "#eff6ff",
    dropzoneColorDark: "#3b82f61A",
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
    primaryColor: "#6366f1",
    dropzoneColor: "#eef2ff",
    dropzoneColorDark: "#6366f11A",
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
    primaryColor: "#f43f5e",
    dropzoneColor: "#fff1f2",
    dropzoneColorDark: "#f43f5e1A",
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
    primaryColor: "#f59e0b",
    dropzoneColor: "#fffbeb",
    dropzoneColorDark: "#f59e0b1A",
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
    primaryColor: "#8b5cf6",
    dropzoneColor: "#f5f3ff",
    dropzoneColorDark: "#8b5cf61A",
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