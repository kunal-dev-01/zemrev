// ============================================================================
// FILE: src/hooks/pdfHooks/useHtmlToPdf.hook.ts
// ============================================================================

import { useHtmlToPdfMutation } from "@/services/pdfService/pdf.api";
import { PdfProcessedFile } from "@/services/pdfService/types";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { useCallback, useEffect, useState } from "react";


export const useHtmlToPdf = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [converting, setConverting] = useState(false);
  const [htmlToPdf] = useHtmlToPdfMutation();

  useEffect(() => {
    const restore = async () => {
      const restored = await pdfPendingStorage.restore("html-to-pdf");
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
    for (const file of newFiles) {
      const id = await pdfPendingStorage.save("html-to-pdf", file);
      setFiles((prev) => [
        ...prev,
        {
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: {},
          status: "pending",
        },
      ]);
    }
  }, []);

  const removeFile = useCallback(async (id: string) => {
    await pdfPendingStorage.delete("html-to-pdf", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const convertSingleFile = useCallback(
    async (file: PdfProcessedFile) => {
      try {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "processing" } : f
          )
        );
        const blob = await htmlToPdf({
          file: file.originalFile as File,
        }).unwrap();
        const outputName = file.name.replace(/\.html?$/i, ".pdf");
        await pdfSessionStorage.saveFile(blob, outputName, "html-to-pdf");
        await pdfPendingStorage.delete("html-to-pdf", file.id);
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
    [htmlToPdf]
  );

  const convertAllFiles = useCallback(async () => {
    setConverting(true);
    for (const file of files.filter((f) => f.status === "pending"))
      await convertSingleFile(file);
    setConverting(false);
  }, [files, convertSingleFile]);

  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("html-to-pdf");
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
