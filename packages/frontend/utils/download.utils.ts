// ============================================================================
// FILE: src/utils/download.utils.ts
// PURPOSE: File download utilities
// ============================================================================

import { ConvertedFile } from "@/services/imageService/types";
import JSZip from "jszip";

export const downloadSingle = (file: ConvertedFile): void => {
  const a = document.createElement("a");
  a.href = file.downloadUrl;
  a.download = file.filename;
  a.click();
};

export const downloadAll = async (files: ConvertedFile[]): Promise<void> => {
  if (files.length === 0) return;
  
  if (files.length === 1) {
    downloadSingle(files[0]);
    return;
  }
  
  try {
    const zip = new JSZip();
    files.forEach(f => zip.file(f.filename, f.blob));
    
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted-images.zip";
    a.click();
    
    URL.revokeObjectURL(url);
  } catch {
    alert("❌ Failed to create ZIP");
  }
};