// ============================================================================
// FILE: src/hooks/pdfHooks/useFlattenPdf.hook.ts
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import { useFlattenPdfMutation } from "@/services/pdfService/pdf.api";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import type { PdfProcessedFile } from "@/services/pdfService/types";

export const useFlattenPdf = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [flattening, setFlattening] = useState(false);
  const [flattenPdf] = useFlattenPdfMutation();

  useEffect(() => {
    const restore = async () => {
      const restored = await pdfPendingStorage.restore("flatten-pdf");
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
      const id = await pdfPendingStorage.save("flatten-pdf", file);
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
    await pdfPendingStorage.delete("flatten-pdf", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const flattenSingleFile = useCallback(
    async (file: PdfProcessedFile) => {
      try {
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "processing" } : f))
        );

        const blob = await flattenPdf({
          file: file.originalFile as File,
        }).unwrap();

        const outputName = `flattened_${file.name}`;
        await pdfSessionStorage.saveFile(blob, outputName, "flatten-pdf");

        await pdfPendingStorage.delete("flatten-pdf", file.id);
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
    [flattenPdf]
  );

  const flattenAllFiles = useCallback(async () => {
    setFlattening(true);
    for (const file of files.filter((f) => f.status === "pending")) {
      await flattenSingleFile(file);
    }
    setFlattening(false);
  }, [files, flattenSingleFile]);

  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("flatten-pdf");
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
    flattening,
    stats,
    addFiles,
    removeFile,
    flattenSingleFile,
    flattenAllFiles,
    clearAll,
  };
};