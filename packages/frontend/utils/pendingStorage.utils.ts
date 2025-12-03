// ============================================================================
// FILE: src/utils/pendingStorage.utils.ts
// PURPOSE: Pending uploads for all tools (20 min TTL + refresh-safe)
// ============================================================================

import { set, get, del } from "idb-keyval";
import type { ToolType } from "@/services/imageService/types";

const TTL = 20 * 60 * 1000; // 20 minutes

// Metadata keys per tool
const PENDING_META: Record<ToolType, string> = {
  converter: "zemrev_pending_converter",
  compressor: "zemrev_pending_compressor",
  optimizer: "zemrev_pending_optimizer",
  resizer: "zemrev_pending_resizer",
  cropper: "zemrev_pending_cropper",
  watermark: "zemrev_pending_watermark",
};

export interface PendingMeta {
  id: string;
  name: string;
  size: number;
  type: string;
  timestamp: number;  // for TTL
}

export const pendingStorage = {
  // SAVE PENDING FILE
  async save(tool: ToolType, file: File): Promise<string> {
    const id = `${tool}_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    // Save blob in IndexedDB
    await set(`pending/${tool}/${id}`, file);

    // Save metadata
    const list: PendingMeta[] = JSON.parse(
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

  // RESTORE ALL VALID PENDING FILES
  async restore(tool: ToolType): Promise<{ id: string; file: File }[]> {
    const now = Date.now();
    const list: PendingMeta[] = JSON.parse(
      localStorage.getItem(PENDING_META[tool]) || "[]"
    );

    const valid: { id: string; file: File }[] = [];
    const newMeta: PendingMeta[] = [];

    for (const meta of list) {
      const expired = now - meta.timestamp > TTL;
      
      if (expired) {
        await del(`pending/${tool}/${meta.id}`);
        continue;
      }

      const blob = await get(`pending/${tool}/${meta.id}`);
      if (!blob) continue;

      const file = new File([blob], meta.name, { type: meta.type });

      valid.push({ id: meta.id, file });
      newMeta.push(meta);
    }

    // Save cleaned metadata
    localStorage.setItem(PENDING_META[tool], JSON.stringify(newMeta));

    return valid;
  },

  // DELETE AFTER PROCESS COMPLETE
  async delete(tool: ToolType, id: string): Promise<void> {
    await del(`pending/${tool}/${id}`);

    const list: PendingMeta[] = JSON.parse(
      localStorage.getItem(PENDING_META[tool]) || "[]"
    );

    const filtered = list.filter((m) => m.id !== id);

    localStorage.setItem(PENDING_META[tool], JSON.stringify(filtered));
  },

  // CLEAR TOOL PENDING STORAGE
  async clearTool(tool: ToolType): Promise<void> {
    const list: PendingMeta[] = JSON.parse(
      localStorage.getItem(PENDING_META[tool]) || "[]"
    );

    for (const meta of list) {
      await del(`pending/${tool}/${meta.id}`);
    }

    localStorage.removeItem(PENDING_META[tool]);
  },
};
