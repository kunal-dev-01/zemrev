// ============================================================================
// 10. useAddWatermark.hook.ts
// ============================================================================
import {
  useAddTextWatermarkPdfMutation,
  useAddImageWatermarkPdfMutation,
} from "@/services/pdfService/pdf.api";
import { PdfFileSettings, PdfProcessedFile } from "@/services/pdfService/types";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { useCallback, useEffect, useState } from "react";

export const useAddWatermark = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [addTextWatermark] = useAddTextWatermarkPdfMutation();
  const [addImageWatermark] = useAddImageWatermarkPdfMutation();

  useEffect(() => {
    const restore = async () => {
      const restored = await pdfPendingStorage.restore("add-watermark");
      if (restored.length > 0)
        setFiles(
          restored.map(({ id, file }) => ({
            id,
            originalFile: file,
            name: file.name,
            size: file.size,
            type: file.type,
            settings: {
              text: "CONFIDENTIAL",
              opacity: 0.3,
              position: "center",
              font_size: 50,
              rotation: 45,
              color: "gray",
            },
            status: "pending" as const,
          }))
        );
    };
    restore();
  }, []);

  const addFiles = useCallback(async (newFiles: File[]) => {
    for (const file of newFiles) {
      const id = await pdfPendingStorage.save("add-watermark", file);
      setFiles((prev) => [
        ...prev,
        {
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: {
            text: "CONFIDENTIAL",
            opacity: 0.3,
            position: "center",
            font_size: 50,
            rotation: 45,
            color: "gray",
          },
          status: "pending",
        },
      ]);
    }
  }, []);

  const removeFile = useCallback(async (id: string) => {
    await pdfPendingStorage.delete("add-watermark", id);
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

  const processSingle = useCallback(
    async (file: PdfProcessedFile) => {
      try {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "processing" } : f
          )
        );

        let blob: Blob;
        if (file.settings.watermarkFile) {
          blob = await addImageWatermark({
            file: file.originalFile as File,
            watermark: file.settings.watermarkFile as File,
            options: {
              opacity: file.settings.opacity as number,
              position: file.settings.position as any,
              scale: 0.3,
            },
          }).unwrap();
        } else {
          blob = await addTextWatermark({
            file: file.originalFile as File,
            options: {
              text: file.settings.text as string,
              opacity: file.settings.opacity as number,
              position: file.settings.position as any,
              font_size: file.settings.font_size as number,
              rotation: file.settings.rotation as number,
              color: file.settings.color as string,
            },
          }).unwrap();
        }

        await pdfSessionStorage.saveFile(
          blob,
          `watermarked_${file.name}`,
          "add-watermark"
        );
        await pdfPendingStorage.delete("add-watermark", file.id);
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
    [addTextWatermark, addImageWatermark]
  );

  const processAll = useCallback(async () => {
    setProcessing(true);
    for (const file of files.filter((f) => f.status === "pending"))
      await processSingle(file);
    setProcessing(false);
  }, [files, processSingle]);

  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("add-watermark");
    setFiles([]);
  }, []);

  return {
    files,
    processing,
    addFiles,
    removeFile,
    updateSettings,
    processSingle,
    processAll,
    clearAll,
  };
};
