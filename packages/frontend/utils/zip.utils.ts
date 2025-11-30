// ============================================================================
// FILE: src/utils/zip.utils.ts
// PURPOSE: ZIP file creation utility
// COMMIT: feat: add ZIP utility for batch downloads
// ============================================================================

import JSZip from "jszip";
import type { ImageItem } from "@/services/imageService/types";

export const createZipFromImages = async (
  images: ImageItem[],
  zipName: string = "images.zip"
): Promise<void> => {
  const zip = new JSZip();

  const completedImages = images.filter(
    (img) => img.status === "completed" && img.result
  );

  if (completedImages.length === 0) {
    throw new Error("No completed images to download");
  }

  completedImages.forEach((img, index) => {
    if (img.result) {
      const fileName = img.name || `image_${index + 1}`;
      zip.file(fileName, img.result);
    }
  });

  const content = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const url = URL.createObjectURL(content);
  const link = document.createElement("a");
  link.href = url;
  link.download = zipName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadSingleImage = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};