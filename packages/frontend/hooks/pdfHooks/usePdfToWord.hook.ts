// ============================================================================
// FILE: src/hooks/pdfHooks/usePdfToWord.hook.ts
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import { usePdfToWordMutation } from "@/services/pdfService/pdf.api";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import type { PdfProcessedFile } from "@/services/pdfService/types";

export const usePdfToWord = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [converting, setConverting] = useState(false);
  const [pdfToWord] = usePdfToWordMutation();

  useEffect(() => {
    const restore = async () => {
      const restored = await pdfPendingStorage.restore("pdf-to-word");
      if (restored.length > 0) {
        setFiles(
          restored.map(({ id, file }) => ({
            id,
            originalFile: file,
            name: file.name,
            size: file.size,
            type: file.type,
            settings: {},
            status: "pending" as const,
          }))
        );
      }
    };
    restore();
  }, []);

  const addFiles = useCallback(async (newFiles: File[]) => {
    const processed: PdfProcessedFile[] = [];
    for (const file of newFiles) {
      const id = await pdfPendingStorage.save("pdf-to-word", file);
      processed.push({
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: {},
        status: "pending",
      });
    }
    setFiles((prev) => [...prev, ...processed]);
  }, []);

  const removeFile = useCallback(async (id: string) => {
    await pdfPendingStorage.delete("pdf-to-word", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const convertSingleFile = useCallback(
    async (file: PdfProcessedFile) => {
      try {
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "processing" } : f))
        );

        const blob = await pdfToWord({
          file: file.originalFile as File,
        }).unwrap();

        const outputName = file.name.replace(/\.pdf$/i, ".docx");
        await pdfSessionStorage.saveFile(blob, outputName, "pdf-to-word");

        await pdfPendingStorage.delete("pdf-to-word", file.id);
        setFiles((prev) => prev.filter((f) => f.id !== file.id));

        return { success: true };
      } catch (error) {
        const errorMsg = extractApiErrorMessage(error);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "error", error: errorMsg } : f
          )
        );
        return { success: false, error: errorMsg };
      }
    },
    [pdfToWord]
  );

  const convertAllFiles = useCallback(async () => {
    setConverting(true);
    for (const file of files.filter((f) => f.status === "pending")) {
      await convertSingleFile(file);
    }
    setConverting(false);
  }, [files, convertSingleFile]);

  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("pdf-to-word");
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
    converting,
    stats,
    addFiles,
    removeFile,
    convertSingleFile,
    convertAllFiles,
    clearAll,
  };
};