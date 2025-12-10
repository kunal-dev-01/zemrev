// ============================================================================
// FILE: src/hooks/pdfHooks/usePdfSplit.hook.ts
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import { useSplitPdfMutation } from "@/services/pdfService/pdf.api";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import type { PdfFileSettings, PdfProcessedFile } from "@/services/pdfService/types";

export const usePdfSplit = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [splitting, setSplitting] = useState(false);
  const [splitPdf] = useSplitPdfMutation();

  useEffect(() => {
    const restore = async () => {
      const restored = await pdfPendingStorage.restore("pdf-split");
      if (restored.length > 0) {
        setFiles(
          restored.map(({ id, file }) => ({
            id,
            originalFile: file,
            name: file.name,
            size: file.size,
            type: file.type,
            settings: { pages: "1-3" },
            status: "pending" as const,
          }))
        );
      }
    };
    restore();
  }, []);

  const addFiles = useCallback(async (newFiles: File[], defaultPages: string) => {
    const processed: PdfProcessedFile[] = [];
    for (const file of newFiles) {
      const id = await pdfPendingStorage.save("pdf-split", file);
      processed.push({
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: { pages: defaultPages },
        status: "pending",
      });
    }
    setFiles((prev) => [...prev, ...processed]);
  }, []);

  const removeFile = useCallback(async (id: string) => {
    await pdfPendingStorage.delete("pdf-split", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateFileSettings = useCallback((id: string, settings: PdfFileSettings) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, settings: { ...f.settings, ...settings } } : f))
    );
  }, []);

  const splitSingleFile = useCallback(
    async (file: PdfProcessedFile) => {
      try {
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "processing" } : f))
        );

        const blob = await splitPdf({
          file: file.originalFile as File,
          options: { pages: file.settings.pages as string },
        }).unwrap();

        const outputName = `split_${file.name}`;
        await pdfSessionStorage.saveFile(blob, outputName, "pdf-split");

        await pdfPendingStorage.delete("pdf-split", file.id);
        setFiles((prev) => prev.filter((f) => f.id !== file.id));

        return { success: true };
      } catch (error) {
        const errorMsg = extractApiErrorMessage(error);
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "error", error: errorMsg } : f))
        );
        return { success: false, error: errorMsg };
      }
    },
    [splitPdf]
  );

  const splitAllFiles = useCallback(async () => {
    setSplitting(true);
    for (const file of files.filter((f) => f.status === "pending")) {
      await splitSingleFile(file);
    }
    setSplitting(false);
  }, [files, splitSingleFile]);

  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("pdf-split");
    setFiles([]);
  }, []);

  const stats = {
    total: files.length,
    pending: files.filter((f) => f.status === "pending").length,
    processing: files.filter((f) => f.status === "processing").length,
    error: files.filter((f) => f.status === "error").length,
  };

  return {
    files,
    splitting,
    stats,
    addFiles,
    removeFile,
    updateFileSettings,
    splitSingleFile,
    splitAllFiles,
    clearAll,
  };
};