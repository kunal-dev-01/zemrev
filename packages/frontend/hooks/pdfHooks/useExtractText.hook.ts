// ============================================================================
// 8. useExtractText.hook.ts
// ============================================================================
import { useExtractTextMutation } from "@/services/pdfService/pdf.api";
import { PdfFileSettings, PdfProcessedFile } from "@/services/pdfService/types";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { useCallback, useEffect, useState } from "react";

export const useExtractText = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [extractText] = useExtractTextMutation();

  useEffect(() => {
    const restore = async () => {
      const restored = await pdfPendingStorage.restore("extract-text");
      if (restored.length > 0) {
        setFiles(
          restored.map(({ id, file }) => ({
            id,
            originalFile: file,
            name: file.name,
            size: file.size,
            type: file.type,
            settings: { preserve_layout: false },
            status: "pending" as const,
          }))
        );
      }
    };
    restore();
  }, []);

  const addFiles = useCallback(async (newFiles: File[]) => {
    for (const file of newFiles) {
      const id = await pdfPendingStorage.save("extract-text", file);
      setFiles((prev) => [
        ...prev,
        {
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: { preserve_layout: false },
          status: "pending",
        },
      ]);
    }
  }, []);

  const removeFile = useCallback(async (id: string) => {
    await pdfPendingStorage.delete("extract-text", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateSettings = useCallback(
    (id: string, settings: PdfFileSettings) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, settings: { ...f.settings, ...settings } } : f
        )
      );
    },
    []
  );

  const extractSingle = useCallback(
    async (file: PdfProcessedFile) => {
      try {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "processing" } : f
          )
        );
        const result = await extractText({
          file: file.originalFile as File,
          options: {
            page_range: file.settings.page_range,
            preserve_layout: file.settings.preserve_layout as boolean,
          },
        }).unwrap();

        const textBlob = new Blob([result.text], { type: "text/plain" });
        await pdfSessionStorage.saveFile(
          textBlob,
          `extracted_${file.name}.txt`,
          "extract-text"
        );
        await pdfPendingStorage.delete("extract-text", file.id);
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
    [extractText]
  );

  const extractAll = useCallback(async () => {
    setExtracting(true);
    for (const file of files.filter((f) => f.status === "pending"))
      await extractSingle(file);
    setExtracting(false);
  }, [files, extractSingle]);

  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("extract-text");
    setFiles([]);
  }, []);

  return {
    files,
    extracting,
    addFiles,
    removeFile,
    updateSettings,
    extractSingle,
    extractAll,
    clearAll,
  };
};
