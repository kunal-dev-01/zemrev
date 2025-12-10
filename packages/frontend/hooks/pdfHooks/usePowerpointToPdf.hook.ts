// ============================================================================
// FILE: src/hooks/pdfHooks/usePowerpointToPdf.hook.ts
// ============================================================================

import { usePowerpointToPdfMutation } from "@/services/pdfService/pdf.api";
import { PdfProcessedFile } from "@/services/pdfService/types";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { useCallback, useEffect, useState } from "react";

export const usePowerpointToPdf = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [converting, setConverting] = useState(false);
  const [powerpointToPdf] = usePowerpointToPdfMutation();

  useEffect(() => {
    const restore = async () => {
      const restored = await pdfPendingStorage.restore("powerpoint-to-pdf");
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
      const id = await pdfPendingStorage.save("powerpoint-to-pdf", file);
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
    await pdfPendingStorage.delete("powerpoint-to-pdf", id);
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
        const blob = await powerpointToPdf({
          file: file.originalFile as File,
        }).unwrap();
        const outputName = file.name.replace(/\.pptx?$/i, ".pdf");
        await pdfSessionStorage.saveFile(blob, outputName, "powerpoint-to-pdf");
        await pdfPendingStorage.delete("powerpoint-to-pdf", file.id);
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
    [powerpointToPdf]
  );

  const convertAllFiles = useCallback(async () => {
    setConverting(true);
    for (const file of files.filter((f) => f.status === "pending"))
      await convertSingleFile(file);
    setConverting(false);
  }, [files, convertSingleFile]);

  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("powerpoint-to-pdf");
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
