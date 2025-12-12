// ============================================================================
// FILE: src/utils/pdfSessionStorage.utils.ts
// PURPOSE: PDF session storage (200MB shared, 2-hour TTL)
// ============================================================================

import { set, get, del } from "idb-keyval";
import type { PdfStoredFile, PdfSessionStorageData, PdfToolType } from "@/services/pdfService/types";

const MAX_GLOBAL_SIZE = 200 * 1024 * 1024; // 200MB
const TTL = 2 * 60 * 60 * 1000; // 2 hours

// Metadata keys per tool
const META_KEYS: Record<PdfToolType, string> = {
  "pdf-merge": "zemrev_pdf_meta_merge",
  "pdf-split": "zemrev_pdf_meta_split",
  "pdf-rotate": "zemrev_pdf_meta_rotate",
  "pdf-encrypt": "zemrev_pdf_meta_encrypt",
  "pdf-decrypt": "zemrev_pdf_meta_decrypt",
  
  "pdf-to-images": "zemrev_pdf_meta_to_images",
  "images-to-pdf": "zemrev_pdf_meta_from_images",
  "extract-text": "zemrev_pdf_meta_extract_text",
  "extract-images": "zemrev_pdf_meta_extract_images",
  "add-watermark": "zemrev_pdf_meta_watermark",
  "optimize-pdf": "zemrev_pdf_meta_optimize",
  "compress-pdf": "zemrev_pdf_meta_compress",
  "flatten-pdf": "zemrev_pdf_meta_flatten",
  "ocr-searchable": "zemrev_pdf_meta_ocr_searchable",
  "ocr-extract-text": "zemrev_pdf_meta_ocr_extract",
};

// ============================================================================
// META HELPERS
// ============================================================================

const getMeta = (tool: PdfToolType): PdfSessionStorageData => {
  if (typeof window === "undefined") 
    return { files: [], totalSize: 0, lastUpdated: Date.now() };

  try {
    const raw = localStorage.getItem(META_KEYS[tool]);
    return raw ? JSON.parse(raw) : { files: [], totalSize: 0, lastUpdated: Date.now() };
  } catch {
    return { files: [], totalSize: 0, lastUpdated: Date.now() };
  }
};

const setMeta = (tool: PdfToolType, data: PdfSessionStorageData): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(META_KEYS[tool], JSON.stringify(data));
};

// ============================================================================
// GET TOTAL USED SIZE
// ============================================================================

const getTotalUsedSize = (): number => {
  const tools = Object.keys(META_KEYS) as PdfToolType[];
  return tools.reduce((acc, tool) => acc + getMeta(tool).totalSize, 0);
};

// ============================================================================
// TTL CLEAN
// ============================================================================

const cleanExpired = async (): Promise<void> => {
  const tools = Object.keys(META_KEYS) as PdfToolType[];
  const now = Date.now();

  for (const tool of tools) {
    const meta = getMeta(tool);
    const valid: PdfStoredFile[] = [];

    for (const file of meta.files) {
      const expired = now - file.timestamp > TTL;
      if (expired) {
        await del(`pdf_file/${file.id}`);
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
// GLOBAL CLEAR
// ============================================================================

const clearGlobal = async (): Promise<void> => {
  const tools = Object.keys(META_KEYS) as PdfToolType[];

  for (const tool of tools) {
    const meta = getMeta(tool);

    for (const file of meta.files) {
      await del(`pdf_file/${file.id}`);
    }

    setMeta(tool, { files: [], totalSize: 0, lastUpdated: Date.now() });
  }
};

// ============================================================================
// MAIN API
// ============================================================================

export const pdfSessionStorage = {
  saveFile: async (blob: Blob, name: string, tool: PdfToolType): Promise<string> => {
    await cleanExpired();

    const newFileSize = blob.size;
    const currentSize = getTotalUsedSize();

    if (currentSize + newFileSize > MAX_GLOBAL_SIZE) {
      await clearGlobal();
    }

    const id = `${tool}_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    await set(`pdf_file/${id}`, blob);

    const meta = getMeta(tool);

    const fileMeta: PdfStoredFile = {
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

  getFiles: (tool: PdfToolType): PdfStoredFile[] => {
    cleanExpired();
    return getMeta(tool).files;
  },

  getFile: (tool: PdfToolType, id: string): PdfStoredFile | null => {
    cleanExpired();
    return getMeta(tool).files.find((f) => f.id === id) || null;
  },

  getBlob: async (id: string): Promise<Blob | null> => {
    await cleanExpired();
    return (await get(`pdf_file/${id}`)) || null;
  },

  deleteFile: async (tool: PdfToolType, id: string): Promise<void> => {
    const meta = getMeta(tool);
    const index = meta.files.findIndex((f) => f.id === id);

    if (index !== -1) {
      meta.totalSize -= meta.files[index].size;
      meta.files.splice(index, 1);
      setMeta(tool, meta);
      await del(`pdf_file/${id}`);
    }
  },

  clearTool: async (tool: PdfToolType): Promise<void> => {
    const meta = getMeta(tool);

    for (const f of meta.files) {
      await del(`pdf_file/${f.id}`);
    }

    setMeta(tool, { files: [], totalSize: 0, lastUpdated: Date.now() });
  },

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