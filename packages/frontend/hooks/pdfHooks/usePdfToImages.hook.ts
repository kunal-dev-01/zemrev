// ============================================================================
// 6. usePdfToImages.hook.ts
// ============================================================================

import { usePdfToImagesMutation } from "@/services/pdfService/pdf.api";
import { PdfFileSettings, PdfProcessedFile } from "@/services/pdfService/types";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { useCallback, useEffect, useState } from "react";
import { useCloudPicker } from "../appHooks/usePdfCloudPicker.hook";

// ============================================================================
export const usePdfToImages = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [converting, setConverting] = useState(false);

  const [pdfToImages] = usePdfToImagesMutation();
  const { pickFromGoogleDrive, pickFromDropbox } = useCloudPicker();

  // ============================================================================
  // RESTORE
  // ============================================================================
  useEffect(() => {
    const restore = async () => {
      const restored = await pdfPendingStorage.restore("pdf-to-images");
      if (restored.length > 0) {
        setFiles(
          restored.map(({ id, file }) => ({
            id,
            originalFile: file,
            name: file.name,
            size: file.size,
            type: file.type,
            settings: { format: "png", dpi: 150 },
            status: "pending" as const,
          }))
        );
      }
    };
    restore();
  }, []);

  // ============================================================================
  // ADD FILES (LOCAL)
  // ============================================================================
  const addFiles = useCallback(async (newFiles: File[]) => {
    for (const file of newFiles) {
      const id = await pdfPendingStorage.save("pdf-to-images", file);
      setFiles((prev) => [
        ...prev,
        {
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: { format: "png", dpi: 150 },
          status: "pending",
        },
      ]);
    }
  }, []);

  // ============================================================================
  // ADD FROM GOOGLE DRIVE
  // ============================================================================
  const addFromGoogleDrive = useCallback(async () => {
    const file = await pickFromGoogleDrive();
    const id = await pdfPendingStorage.save("pdf-to-images", file);

    setFiles((prev) => [
      ...prev,
      {
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: { format: "png", dpi: 150 },
        status: "pending",
      },
    ]);
  }, [pickFromGoogleDrive]);

  // ============================================================================
  // ADD FROM DROPBOX
  // ============================================================================
  const addFromDropbox = useCallback(async () => {
    const file = await pickFromDropbox();
    const id = await pdfPendingStorage.save("pdf-to-images", file);

    setFiles((prev) => [
      ...prev,
      {
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: { format: "png", dpi: 150 },
        status: "pending",
      },
    ]);
  }, [pickFromDropbox]);

  // ============================================================================
  // REMOVE FILE
  // ============================================================================
  const removeFile = useCallback(async (id: string) => {
    await pdfPendingStorage.delete("pdf-to-images", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // ============================================================================
  // UPDATE SETTINGS
  // ============================================================================
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

  // ============================================================================
  // CONVERT SINGLE
  // ============================================================================
  const convertSingle = useCallback(
    async (file: PdfProcessedFile) => {
      try {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "processing" } : f
          )
        );

        const blob = await pdfToImages({
          file: file.originalFile as File,
          options: {
            format: file.settings.format as any,
            dpi: file.settings.dpi as number,
            page_range: file.settings.page_range,
          },
        }).unwrap();

        await pdfSessionStorage.saveFile(
          blob,
          `images_${file.name}.zip`,
          "pdf-to-images"
        );

        await pdfPendingStorage.delete("pdf-to-images", file.id);
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
    [pdfToImages]
  );

  // ============================================================================
  // CONVERT ALL
  // ============================================================================
  const convertAll = useCallback(async () => {
    setConverting(true);
    for (const file of files.filter((f) => f.status === "pending")) {
      await convertSingle(file);
    }
    setConverting(false);
  }, [files, convertSingle]);

  // ============================================================================
  // CLEAR ALL
  // ============================================================================
  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("pdf-to-images");
    setFiles([]);
  }, []);

  return {
    files,
    converting,
    addFiles,
    addFromGoogleDrive,
    addFromDropbox,
    removeFile,
    updateSettings,
    convertSingle,
    convertAll,
    clearAll,
  };
};
