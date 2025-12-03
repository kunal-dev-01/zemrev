// ============================================================================
// FILE: src/utils/sessionStorage.utils.ts
// PURPOSE: Persistent browser storage for converted files (IndexedDB based)
// Supports: 150–200MB storage + 2 hours TTL auto-clean
// ============================================================================

import { set, get, del } from "idb-keyval";
import type { StoredFile, SessionStorageData, ToolType } from "@/services/imageService/types";

// TTL = 2 hours
const TTL = 2 * 60 * 60 * 1000;

// Max 200MB logical limit
const MAX_STORAGE_SIZE = 200 * 1024 * 1024;

// Metadata stored in localStorage
const META_KEY = "zemrev_meta";

// ============================================================================
// Helpers: Get/Set Metadata
// ============================================================================

const getMeta = (): SessionStorageData => {
  if (typeof window === "undefined") {
    return { files: [], totalSize: 0, lastUpdated: Date.now() };
  }

  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : { files: [], totalSize: 0, lastUpdated: Date.now() };
  } catch {
    return { files: [], totalSize: 0, lastUpdated: Date.now() };
  }
};

const setMeta = (data: SessionStorageData): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(META_KEY, JSON.stringify(data));
};

// ============================================================================
// TTL Clean Up (remove old files > 2 hours)
// ============================================================================

const cleanExpiredFiles = async (): Promise<void> => {
  const meta = getMeta();
  const now = Date.now();

  const validFiles: StoredFile[] = [];

  for (const file of meta.files) {
    const expired = now - file.timestamp > TTL;

    if (expired) {
      await del(file.id);
    } else {
      validFiles.push(file);
    }
  }

  meta.files = validFiles;
  meta.totalSize = validFiles.reduce((sum, f) => sum + f.size, 0);
  meta.lastUpdated = Date.now();

  setMeta(meta);
};

// ============================================================================
// PUBLIC API
// ============================================================================

export const sessionStorageUtils = {
  /**
   * Save converted file (Blob)
   */
  saveFile: async (blob: Blob, name: string, toolType: ToolType): Promise<string> => {
    let meta = getMeta();
    await cleanExpiredFiles();

    const fileSize = blob.size;

    // Auto-clear if exceeding storage limit
    if (meta.totalSize + fileSize > MAX_STORAGE_SIZE) {
      await sessionStorageUtils.clearAll();
      meta = getMeta();
    }

    const id = `${toolType}_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    // Save blob in IndexedDB
    await set(id, blob);

    // Store metadata
    const fileMeta: StoredFile = {
      id,
      name,
      blob: "", // not used now, kept for compatibility
      timestamp: Date.now(),
      size: fileSize,
      toolType,
    };

    meta.files.push(fileMeta);
    meta.totalSize += fileSize;
    meta.lastUpdated = Date.now();

    setMeta(meta);
    return id;
  },

  /**
   * Get all stored file metadata
   */
  getFiles: (): StoredFile[] => {
    cleanExpiredFiles();
    return getMeta().files;
  },

  /**
   * Get filtered files by tool type
   */
  getFilesByTool: (toolType: ToolType): StoredFile[] => {
    cleanExpiredFiles();
    return getMeta().files.filter((f) => f.toolType === toolType);
  },

  /**
   * Get Blob by ID
   */
  getBlob: async (id: string): Promise<Blob | null> => {
    await cleanExpiredFiles();
    return (await get(id)) || null;
  },

  /**
   * Get single file metadata
   */
  getFile: (id: string): StoredFile | null => {
    cleanExpiredFiles();
    return getMeta().files.find((f) => f.id === id) || null;
  },

  /**
   * Delete single file
   */
  deleteFile: async (id: string): Promise<void> => {
    const meta = getMeta();
    const index = meta.files.findIndex((f) => f.id === id);

    if (index !== -1) {
      meta.totalSize -= meta.files[index].size;
      meta.files.splice(index, 1);
      meta.lastUpdated = Date.now();

      setMeta(meta);
      await del(id);
    }
  },

  /**
   * Clear all stored files
   */
  clearAll: async (): Promise<void> => {
    const meta = getMeta();

    for (const f of meta.files) {
      await del(f.id);
    }

    setMeta({ files: [], totalSize: 0, lastUpdated: Date.now() });
  },

  /**
   * Stats
   */
  getStats: () => {
    cleanExpiredFiles();
    const meta = getMeta();

    return {
      fileCount: meta.files.length,
      totalSize: meta.totalSize,
      maxSize: MAX_STORAGE_SIZE,
      usagePercent: Math.round((meta.totalSize / MAX_STORAGE_SIZE) * 100),
      lastUpdated: meta.lastUpdated,
    };
  },

  /**
   * Download single file
   */
  downloadFile: async (id: string): Promise<void> => {
    const file = sessionStorageUtils.getFile(id);
    if (!file) return;

    const blob = await sessionStorageUtils.getBlob(id);
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  },

  /**
   * Download all files
   */
  downloadAll: async (toolType?: ToolType): Promise<void> => {
    const files = toolType
      ? sessionStorageUtils.getFilesByTool(toolType)
      : sessionStorageUtils.getFiles();

    for (const file of files) {
      await sessionStorageUtils.downloadFile(file.id);
      await new Promise((res) => setTimeout(res, 500));
    }
  },
};
