// ============================================================================
// FILE: src/utils/download.utils.ts
// PURPOSE: Download utilities for single and ZIP downloads
// COMMIT: feat: add download utilities
// ============================================================================

import JSZip from "jszip";
import type { ImageItem } from "@/services/imageService/types";

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const createZip = async (images: ImageItem[], zipName: string): Promise<void> => {
  const zip = new JSZip();

  images.forEach((img) => {
    if (img.result) {
      zip.file(img.name, img.result);
    }
  });

  const content = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  downloadBlob(content, zipName);
};