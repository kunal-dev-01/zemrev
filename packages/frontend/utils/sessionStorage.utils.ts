// ============================================================================
// FILE: src/utils/sessionStorage.utils.ts
// PURPOSE: Browser session storage management for converted files
// ============================================================================

import type { StoredFile, SessionStorageData, ToolType } from "@/services/imageService/types";

const STORAGE_KEY = "zemrev_converted_files";
const MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB limit

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStorageData = (): SessionStorageData => {
  if (typeof window === "undefined") {
    return { files: [], totalSize: 0, lastUpdated: Date.now() };
  }

  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
    if (!data) {
      return { files: [], totalSize: 0, lastUpdated: Date.now() };
    }
    return JSON.parse(data);
  } catch {
    return { files: [], totalSize: 0, lastUpdated: Date.now() };
  }
};

const setStorageData = (data: SessionStorageData): void => {
  if (typeof window === "undefined") return;
  
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save to session storage:", error);
  }
};

// ============================================================================
// PUBLIC API
// ============================================================================

export const sessionStorageUtils = {
  /**
   * Save converted file to session storage
   */
  saveFile: async (
    blob: Blob,
    name: string,
    toolType: ToolType
  ): Promise<string> => {
    const data = getStorageData();
    
    // Convert blob to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]); // Remove data:image/...;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const fileSize = blob.size;
    const id = `${toolType}_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    // Check if adding this file exceeds storage limit
    if (data.totalSize + fileSize > MAX_STORAGE_SIZE) {
      // Auto-clear old files to make space
      sessionStorageUtils.clearAll();
    }

    const storedFile: StoredFile = {
      id,
      name,
      blob: base64,
      timestamp: Date.now(),
      size: fileSize,
      toolType,
    };

    data.files.push(storedFile);
    data.totalSize += fileSize;
    data.lastUpdated = Date.now();

    setStorageData(data);
    return id;
  },

  /**
   * Get all stored files
   */
  getFiles: (): StoredFile[] => {
    const data = getStorageData();
    return data.files;
  },

  /**
   * Get files by tool type
   */
  getFilesByTool: (toolType: ToolType): StoredFile[] => {
    const data = getStorageData();
    return data.files.filter((f: { toolType: ToolType; }) => f.toolType === toolType);
  },

  /**
   * Get single file by ID
   */
  getFile: (id: string): StoredFile | null => {
    const data = getStorageData();
    return data.files.find((f: { id: string; }) => f.id === id) || null;
  },

  /**
   * Convert stored file back to Blob
   */
  getBlob: async (id: string): Promise<Blob | null> => {
    const file = sessionStorageUtils.getFile(id);
    if (!file) return null;

    try {
      const response = await fetch(`data:application/octet-stream;base64,${file.blob}`);
      return await response.blob();
    } catch {
      return null;
    }
  },

  /**
   * Delete single file
   */
  deleteFile: (id: string): void => {
    const data = getStorageData();
    const index = data.files.findIndex((f: { id: string; }) => f.id === id);
    
    if (index !== -1) {
      const file = data.files[index];
      data.totalSize -= file.size;
      data.files.splice(index, 1);
      data.lastUpdated = Date.now();
      setStorageData(data);
    }
  },

  /**
   * Clear all stored files
   */
  clearAll: (): void => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Get storage stats
   */
  getStats: () => {
    const data = getStorageData();
    return {
      fileCount: data.files.length,
      totalSize: data.totalSize,
      maxSize: MAX_STORAGE_SIZE,
      usagePercent: Math.round((data.totalSize / MAX_STORAGE_SIZE) * 100),
      lastUpdated: data.lastUpdated,
    };
  },

  /**
   * Download file from session storage
   */
  downloadFile: async (id: string): Promise<void> => {
    const file = sessionStorageUtils.getFile(id);
    if (!file) return;

    const blob = await sessionStorageUtils.getBlob(id);
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Download all files as zip (future enhancement)
   */
  downloadAll: async (toolType?: ToolType): Promise<void> => {
    const files = toolType 
      ? sessionStorageUtils.getFilesByTool(toolType)
      : sessionStorageUtils.getFiles();

    // For now, download individually
    for (const file of files) {
      await sessionStorageUtils.downloadFile(file.id);
      // Add delay to prevent browser blocking multiple downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  },
};