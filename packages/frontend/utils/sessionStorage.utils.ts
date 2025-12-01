// ============================================================================
// FILE: src/utils/sessionStorage.utils.ts
// PURPOSE: Browser session storage
// ============================================================================

import { ConvertedFile, SessionStorageData, ConversionSettings } from "@/services/imageService/types";

const KEY = "img_converter";
const EXPIRY = 60 * 60 * 1000; // 1 hour

export const saveSession = (files: ConvertedFile[], settings: ConversionSettings): void => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({
      convertedFiles: files,
      settings,
      timestamp: Date.now(),
    }));
  } catch {}
};

export const loadSession = (): SessionStorageData | null => {
  try {
    const data = sessionStorage.getItem(KEY);
    if (!data) return null;
    
    const parsed: SessionStorageData = JSON.parse(data);
    if (Date.now() - parsed.timestamp > EXPIRY) {
      clearSession();
      return null;
    }
    
    return {
      ...parsed,
      convertedFiles: parsed.convertedFiles.map(f => ({
        ...f,
        downloadUrl: URL.createObjectURL(f.blob),
      })),
    };
  } catch {
    return null;
  }
};

export const clearSession = (): void => {
  try {
    const data = sessionStorage.getItem(KEY);
    if (data) {
      const parsed: SessionStorageData = JSON.parse(data);
      parsed.convertedFiles.forEach(f => URL.revokeObjectURL(f.downloadUrl));
    }
    sessionStorage.removeItem(KEY);
  } catch {}
};