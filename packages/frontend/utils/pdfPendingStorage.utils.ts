// ============================================================================
// FILE: src/utils/pdfPendingStorage.utils.ts
// PURPOSE: Pending PDF uploads (20 min TTL + refresh-safe)
// ============================================================================

import { set, get, del } from "idb-keyval";
import type { PdfToolType } from "@/services/pdfService/types";

const TTL = 20 * 60 * 1000; // 20 minutes

// Metadata keys per tool
const PENDING_META: Record<PdfToolType, string> = {
  "pdf-merge": "zemrev_pdf_pending_merge",
  "pdf-split": "zemrev_pdf_pending_split",
  "pdf-rotate": "zemrev_pdf_pending_rotate",
  "pdf-encrypt": "zemrev_pdf_pending_encrypt",
  "pdf-decrypt": "zemrev_pdf_pending_decrypt",
  
  "pdf-to-images": "zemrev_pdf_pending_to_images",
  "images-to-pdf": "zemrev_pdf_pending_from_images",
  "extract-text": "zemrev_pdf_pending_extract_text",
  "extract-images": "zemrev_pdf_pending_extract_images",
  "add-watermark": "zemrev_pdf_pending_watermark",
  "optimize-pdf": "zemrev_pdf_pending_optimize",
  "compress-pdf": "zemrev_pdf_pending_compress",
  "flatten-pdf": "zemrev_pdf_pending_flatten",
  "ocr-searchable": "zemrev_pdf_pending_ocr_searchable",
  "ocr-extract-text": "zemrev_pdf_pending_ocr_extract",
};

export interface PdfPendingMeta {
  id: string;
  name: string;
  size: number;
  type: string;
  timestamp: number;
}

export const pdfPendingStorage = {
  async save(tool: PdfToolType, file: File): Promise<string> {
    const id = `${tool}_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    await set(`pdf_pending/${tool}/${id}`, file);

    const list: PdfPendingMeta[] = JSON.parse(
      localStorage.getItem(PENDING_META[tool]) || "[]"
    );

    list.push({
      id,
      name: file.name,
      size: file.size,
      type: file.type,
      timestamp: Date.now(),
    });

    localStorage.setItem(PENDING_META[tool], JSON.stringify(list));

    return id;
  },

  async restore(tool: PdfToolType): Promise<{ id: string; file: File }[]> {
    const now = Date.now();
    const list: PdfPendingMeta[] = JSON.parse(
      localStorage.getItem(PENDING_META[tool]) || "[]"
    );

    const valid: { id: string; file: File }[] = [];
    const newMeta: PdfPendingMeta[] = [];

    for (const meta of list) {
      const expired = now - meta.timestamp > TTL;

      if (expired) {
        await del(`pdf_pending/${tool}/${meta.id}`);
        continue;
      }

      const blob = await get(`pdf_pending/${tool}/${meta.id}`);
      if (!blob) continue;

      const file = new File([blob], meta.name, { type: meta.type });

      valid.push({ id: meta.id, file });
      newMeta.push(meta);
    }

    localStorage.setItem(PENDING_META[tool], JSON.stringify(newMeta));

    return valid;
  },

  async delete(tool: PdfToolType, id: string): Promise<void> {
    await del(`pdf_pending/${tool}/${id}`);

    const list: PdfPendingMeta[] = JSON.parse(
      localStorage.getItem(PENDING_META[tool]) || "[]"
    );

    const filtered = list.filter((m) => m.id !== id);

    localStorage.setItem(PENDING_META[tool], JSON.stringify(filtered));
  },

  async clearTool(tool: PdfToolType): Promise<void> {
    const list: PdfPendingMeta[] = JSON.parse(
      localStorage.getItem(PENDING_META[tool]) || "[]"
    );

    for (const meta of list) {
      await del(`pdf_pending/${tool}/${meta.id}`);
    }

    localStorage.removeItem(PENDING_META[tool]);
  },
};