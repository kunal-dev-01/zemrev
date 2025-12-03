// ============================================================================
// FILE: src/utils/sessionStorage.utils.ts
// PURPOSE: Shared 200MB persistent browser storage (IndexedDB-based)
// 2-hour TTL for all tools + tool-wise metadata separation
// ============================================================================

import { set, get, del } from "idb-keyval";
import type { StoredFile, SessionStorageData, ToolType } from "@/services/imageService/types";

// GLOBAL LIMIT = 200MB TOTAL (shared by all tools)
const MAX_GLOBAL_SIZE = 200 * 1024 * 1024;

// TTL = 2 hours
const TTL = 2 * 60 * 60 * 1000;

// Metadata keys per tool
const META_KEYS: Record<ToolType, string> = {
  converter: "zemrev_meta_converter",
  compressor: "zemrev_meta_compressor",
  optimizer: "zemrev_meta_optimizer",
  resizer: "zemrev_meta_resizer",
  cropper: "zemrev_meta_cropper",
  watermark: "zemrev_meta_watermark",
};

// ============================================================================
// Meta Helpers (each tool has its own metadata list)
// ============================================================================

const getMeta = (tool: ToolType): SessionStorageData => {
  if (typeof window === "undefined") return { files: [], totalSize: 0, lastUpdated: Date.now() };

  try {
    const raw = localStorage.getItem(META_KEYS[tool]);
    return raw ? JSON.parse(raw) : { files: [], totalSize: 0, lastUpdated: Date.now() };
  } catch {
    return { files: [], totalSize: 0, lastUpdated: Date.now() };
  }
};

const setMeta = (tool: ToolType, data: SessionStorageData): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(META_KEYS[tool], JSON.stringify(data));
};

// ============================================================================
// Helper: Get TOTAL used size across all tools
// ============================================================================

const getTotalUsedSize = (): number =>
  (["converter", "compressor", "optimizer", "resizer", "cropper", "watermark"] as ToolType[])
    .reduce((acc, tool) => acc + getMeta(tool).totalSize, 0);

// ============================================================================
// TTL CLEAN (delete files older than 2 hours)
// ============================================================================

const cleanExpired = async (): Promise<void> => {
  const tools = ["converter", "compressor", "optimizer", "resizer", "cropper", "watermark"] as ToolType[];
  const now = Date.now();

  for (const tool of tools) {
    const meta = getMeta(tool);
    const valid: StoredFile[] = [];

    for (const file of meta.files) {
      const expired = now - file.timestamp > TTL;
      if (expired) {
        await del(`file/${file.id}`); // global database key
      } else {
        valid.push(file);
      }
    }

    meta.files = valid;
    meta.totalSize = valid.reduce((s, f) => s + f.size, 0);
    meta.lastUpdated = Date.now();

    setMeta(tool, meta);
  }
};

// ============================================================================
// GLOBAL CLEAN (Remove all files from all tools)
// ============================================================================

const clearGlobal = async (): Promise<void> => {
  const tools = ["converter", "compressor", "optimizer", "resizer", "cropper", "watermark"] as ToolType[];

  for (const tool of tools) {
    const meta = getMeta(tool);

    for (const file of meta.files) {
      await del(`file/${file.id}`);
    }

    setMeta(tool, { files: [], totalSize: 0, lastUpdated: Date.now() });
  }
};

// ============================================================================
// MAIN API
// ============================================================================

export const sessionStorageUtils = {
  // Save a new file
  saveFile: async (blob: Blob, name: string, tool: ToolType): Promise<string> => {
    await cleanExpired();

    const newFileSize = blob.size;
    const currentSize = getTotalUsedSize();

    // If total exceeds 200MB → CLEAR EVERYTHING
    if (currentSize + newFileSize > MAX_GLOBAL_SIZE) {
      await clearGlobal();
    }

    const id = `${tool}_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    // Save blob in IDB (global shared)
    await set(`file/${id}`, blob);

    // Update tool metadata
    const meta = getMeta(tool);

    const fileMeta: StoredFile = {
      id,
      name,
      blob: "",
      timestamp: Date.now(),
      size: newFileSize,
      toolType: tool,
    };

    meta.files.push(fileMeta);
    meta.totalSize += newFileSize;
    meta.lastUpdated = Date.now();

    setMeta(tool, meta);

    return id;
  },

  // Get all files metadata for a tool
  getFiles: (tool: ToolType): StoredFile[] => {
    cleanExpired();
    return getMeta(tool).files;
  },

  // Get one file metadata
  getFile: (tool: ToolType, id: string): StoredFile | null => {
    cleanExpired();
    return getMeta(tool).files.find((f) => f.id === id) || null;
  },

  // Get one file blob
  getBlob: async (id: string): Promise<Blob | null> => {
    await cleanExpired();
    return (await get(`file/${id}`)) || null;
  },

  // Delete one file
  deleteFile: async (tool: ToolType, id: string): Promise<void> => {
    const meta = getMeta(tool);
    const index = meta.files.findIndex((f) => f.id === id);

    if (index !== -1) {
      meta.totalSize -= meta.files[index].size;
      meta.files.splice(index, 1);
      setMeta(tool, meta);
      await del(`file/${id}`);
    }
  },

  // Clear all files for a tool
  clearTool: async (tool: ToolType): Promise<void> => {
    const meta = getMeta(tool);

    for (const f of meta.files) {
      await del(`file/${f.id}`);
    }

    setMeta(tool, { files: [], totalSize: 0, lastUpdated: Date.now() });
  },

  // Get storage stats
  getStats: () => {
    cleanExpired();
    const totalUsed = getTotalUsedSize();

    return {
      totalUsed,
      maxSize: MAX_GLOBAL_SIZE,
      usagePercent: Math.round((totalUsed / MAX_GLOBAL_SIZE) * 100),
    };
  },
};
