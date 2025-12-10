// ============================================================================
// FILE: src/hooks/pdfHooks/useWordToPdf.hook.ts
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import { useWordToPdfMutation } from "@/services/pdfService/pdf.api";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import type { PdfProcessedFile } from "@/services/pdfService/types";

export const useWordToPdf = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [converting, setConverting] = useState(false);
  const [wordToPdf] = useWordToPdfMutation();

  useEffect(() => {
    const restore = async () => {
      const restored = await pdfPendingStorage.restore("word-to-pdf");
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
      const id = await pdfPendingStorage.save("word-to-pdf", file);
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
    await pdfPendingStorage.delete("word-to-pdf", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const convertSingleFile = useCallback(
    async (file: PdfProcessedFile) => {
      try {
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "processing" } : f))
        );

        const blob = await wordToPdf({
          file: file.originalFile as File,
        }).unwrap();

        const outputName = file.name.replace(/\.(docx?|odt|rtf)$/i, ".pdf");
        await pdfSessionStorage.saveFile(blob, outputName, "word-to-pdf");

        await pdfPendingStorage.delete("word-to-pdf", file.id);
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
    [wordToPdf]
  );

  const convertAllFiles = useCallback(async () => {
    setConverting(true);
    for (const file of files.filter((f) => f.status === "pending")) {
      await convertSingleFile(file);
    }
    setConverting(false);
  }, [files, convertSingleFile]);

  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("word-to-pdf");
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