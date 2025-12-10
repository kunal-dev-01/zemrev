// ============================================================================
// 9. useExtractImages.hook.ts
// ============================================================================
import { useExtractImagesMutation } from "@/services/pdfService/pdf.api";
import { PdfFileSettings, PdfProcessedFile } from "@/services/pdfService/types";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { useCallback, useEffect, useState } from "react";

export const useExtractImages = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [extractImages] = useExtractImagesMutation();

  useEffect(() => {
    const restore = async () => {
      const restored = await pdfPendingStorage.restore("extract-images");
      if (restored.length > 0)
        setFiles(
          restored.map(({ id, file }) => ({
            id,
            originalFile: file,
            name: file.name,
            size: file.size,
            type: file.type,
            settings: { min_width: 100, min_height: 100 },
            status: "pending" as const,
          }))
        );
    };
    restore();
  }, []);

  const addFiles = useCallback(async (newFiles: File[]) => {
    for (const file of newFiles) {
      const id = await pdfPendingStorage.save("extract-images", file);
      setFiles((prev) => [
        ...prev,
        {
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: { min_width: 100, min_height: 100 },
          status: "pending",
        },
      ]);
    }
  }, []);

  const removeFile = useCallback(async (id: string) => {
    await pdfPendingStorage.delete("extract-images", id);
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
        const blob = await extractImages({
          file: file.originalFile as File,
          options: {
            min_width: file.settings.min_width as number,
            min_height: file.settings.min_height as number,
            page_range: file.settings.page_range,
          },
        }).unwrap();
        await pdfSessionStorage.saveFile(
          blob,
          `extracted_images_${file.name}.zip`,
          "extract-images"
        );
        await pdfPendingStorage.delete("extract-images", file.id);
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
    [extractImages]
  );

  const extractAll = useCallback(async () => {
    setExtracting(true);
    for (const file of files.filter((f) => f.status === "pending"))
      await extractSingle(file);
    setExtracting(false);
  }, [files, extractSingle]);

  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("extract-images");
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
