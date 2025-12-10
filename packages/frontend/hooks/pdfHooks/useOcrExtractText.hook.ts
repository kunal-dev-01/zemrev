// ============================================================================
// FILE: src/hooks/pdfHooks/useOcrExtractText.hook.ts
// ============================================================================

import { useOcrExtractTextMutation } from "@/services/pdfService/pdf.api";
import { PdfFileSettings, PdfProcessedFile } from "@/services/pdfService/types";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { useCallback, useEffect, useState } from "react";


export const useOcrExtractText = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [ocrExtractText] = useOcrExtractTextMutation();

  useEffect(() => {
    const restore = async () => {
      const restored = await pdfPendingStorage.restore("ocr-extract-text");
      if (restored.length > 0) {
        setFiles(
          restored.map(({ id, file }) => ({
            id,
            originalFile: file,
            name: file.name,
            size: file.size,
            type: file.type,
            settings: { language: "eng" },
            status: "pending" as const,
          }))
        );
      }
    };
    restore();
  }, []);

  const addFiles = useCallback(async (newFiles: File[]) => {
    for (const file of newFiles) {
      const id = await pdfPendingStorage.save("ocr-extract-text", file);
      setFiles((prev) => [
        ...prev,
        {
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: { language: "eng" },
          status: "pending",
        },
      ]);
    }
  }, []);

  const removeFile = useCallback(async (id: string) => {
    await pdfPendingStorage.delete("ocr-extract-text", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateFileSettings = useCallback((id: string, settings: PdfFileSettings) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, settings: { ...f.settings, ...settings } } : f))
    );
  }, []);

  const extractSingleFile = useCallback(
    async (file: PdfProcessedFile) => {
      try {
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "processing" } : f))
        );

        const result = await ocrExtractText({
          file: file.originalFile as File,
          options: {
            language: file.settings.language as string,
            page_range: file.settings.page_range,
          },
        }).unwrap();

        const textBlob = new Blob([result.text], { type: "text/plain" });
        const outputName = `ocr_extracted_${file.name}.txt`;
        await pdfSessionStorage.saveFile(textBlob, outputName, "ocr-extract-text");

        await pdfPendingStorage.delete("ocr-extract-text", file.id);
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
    [ocrExtractText]
  );

  const extractAllFiles = useCallback(async () => {
    setExtracting(true);
    for (const file of files.filter((f) => f.status === "pending")) {
      await extractSingleFile(file);
    }
    setExtracting(false);
  }, [files, extractSingleFile]);

  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("ocr-extract-text");
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
    extracting,
    stats,
    addFiles,
    removeFile,
    updateFileSettings,
    extractSingleFile,
    extractAllFiles,
    clearAll,
  };
};