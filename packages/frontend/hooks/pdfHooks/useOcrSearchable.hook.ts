// ============================================================================
// FILE: src/hooks/pdfHooks/useOcrSearchable.hook.ts
// ============================================================================


import { useOcrPdfToSearchableMutation } from "@/services/pdfService/pdf.api";
import { PdfFileSettings, PdfProcessedFile } from "@/services/pdfService/types";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { useCallback, useEffect, useState } from "react";


export const useOcrSearchable = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [ocrPdfToSearchable] = useOcrPdfToSearchableMutation();

  useEffect(() => {
    const restore = async () => {
      const restored = await pdfPendingStorage.restore("ocr-searchable");
      if (restored.length > 0) {
        setFiles(
          restored.map(({ id, file }) => ({
            id,
            originalFile: file,
            name: file.name,
            size: file.size,
            type: file.type,
            settings: { language: "eng", dpi: 300 },
            status: "pending" as const,
          }))
        );
      }
    };
    restore();
  }, []);

  const addFiles = useCallback(async (newFiles: File[]) => {
    for (const file of newFiles) {
      const id = await pdfPendingStorage.save("ocr-searchable", file);
      setFiles((prev) => [
        ...prev,
        {
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: { language: "eng", dpi: 300 },
          status: "pending",
        },
      ]);
    }
  }, []);

  const removeFile = useCallback(async (id: string) => {
    await pdfPendingStorage.delete("ocr-searchable", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateFileSettings = useCallback((id: string, settings: PdfFileSettings) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, settings: { ...f.settings, ...settings } } : f))
    );
  }, []);

  const processSingleFile = useCallback(
    async (file: PdfProcessedFile) => {
      try {
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "processing" } : f))
        );

        const blob = await ocrPdfToSearchable({
          file: file.originalFile as File,
          options: {
            language: file.settings.language as string,
            dpi: file.settings.dpi as number,
          },
        }).unwrap();

        const outputName = `searchable_${file.name}`;
        await pdfSessionStorage.saveFile(blob, outputName, "ocr-searchable");

        await pdfPendingStorage.delete("ocr-searchable", file.id);
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
    [ocrPdfToSearchable]
  );

  const processAllFiles = useCallback(async () => {
    setProcessing(true);
    for (const file of files.filter((f) => f.status === "pending")) {
      await processSingleFile(file);
    }
    setProcessing(false);
  }, [files, processSingleFile]);

  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("ocr-searchable");
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
    processing,
    stats,
    addFiles,
    removeFile,
    updateFileSettings,
    processSingleFile,
    processAllFiles,
    clearAll,
  };
};