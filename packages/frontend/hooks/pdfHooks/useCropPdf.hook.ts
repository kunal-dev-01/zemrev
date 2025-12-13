// ============================================================================
// FILE: src/hooks/pdfHooks/useCropPdf.hook.ts
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import { useCropPdfMutation } from "@/services/pdfService/pdf.api";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import type { PdfProcessedFile } from "@/services/pdfService/types";
import { useCloudPicker } from "../appHooks/usePdfCloudPicker.hook";

export const useCropPdf = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [cropping, setCropping] = useState(false);

  const [cropPdf] = useCropPdfMutation();
  const { pickFromGoogleDrive, pickFromDropbox } = useCloudPicker();

  // ============================================================================
  // RESTORE
  // ============================================================================
  useEffect(() => {
    const restore = async () => {
      const restored = await pdfPendingStorage.restore("crop-pdf");
      if (restored.length > 0) {
        setFiles(
          restored.map(({ id, file }) => ({
            id,
            originalFile: file,
            name: file.name,
            size: file.size,
            type: file.type,
            settings: {
              crop_x: 50,
              crop_y: 50,
              crop_width: 500,
              crop_height: 700,
            },
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
    const processed: PdfProcessedFile[] = [];

    for (const file of newFiles) {
      const id = await pdfPendingStorage.save("crop-pdf", file);
      processed.push({
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: {
          crop_x: 50,
          crop_y: 50,
          crop_width: 500,
          crop_height: 700,
        },
        status: "pending",
      });
    }

    setFiles((prev) => [...prev, ...processed]);
  }, []);

  // ============================================================================
  // ADD FROM GOOGLE DRIVE
  // ============================================================================
  const addFromGoogleDrive = useCallback(async () => {
    const file = await pickFromGoogleDrive();
    const id = await pdfPendingStorage.save("crop-pdf", file);

    setFiles((prev) => [
      ...prev,
      {
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: {
          crop_x: 50,
          crop_y: 50,
          crop_width: 500,
          crop_height: 700,
        },
        status: "pending",
      },
    ]);
  }, [pickFromGoogleDrive]);

  // ============================================================================
  // ADD FROM DROPBOX
  // ============================================================================
  const addFromDropbox = useCallback(async () => {
    const file = await pickFromDropbox();
    const id = await pdfPendingStorage.save("crop-pdf", file);

    setFiles((prev) => [
      ...prev,
      {
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: {
          crop_x: 50,
          crop_y: 50,
          crop_width: 500,
          crop_height: 700,
        },
        status: "pending",
      },
    ]);
  }, [pickFromDropbox]);

  // ============================================================================
  // UPDATE SETTINGS
  // ============================================================================
  const updateFileSettings = useCallback(
    (id: string, settings: Partial<PdfProcessedFile["settings"]>) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, settings: { ...f.settings, ...settings } } : f
        )
      );
    },
    []
  );

  // ============================================================================
  // REMOVE FILE
  // ============================================================================
  const removeFile = useCallback(async (id: string) => {
    await pdfPendingStorage.delete("crop-pdf", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // ============================================================================
  // CROP SINGLE
  // ============================================================================
  const cropSingleFile = useCallback(
    async (file: PdfProcessedFile) => {
      try {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "processing" } : f
          )
        );

        const { crop_x, crop_y, crop_width, crop_height } = file.settings;

        const blob = await cropPdf({
          file: file.originalFile as File,
          options: {
            x: crop_x || 50,
            y: crop_y || 50,
            width: crop_width || 500,
            height: crop_height || 700,
          },
        }).unwrap();

        const outputName = `cropped_${file.name}`;
        await pdfSessionStorage.saveFile(blob, outputName, "crop-pdf");

        await pdfPendingStorage.delete("crop-pdf", file.id);
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
    [cropPdf]
  );

  // ============================================================================
  // CROP ALL
  // ============================================================================
  const cropAllFiles = useCallback(async () => {
    setCropping(true);
    for (const file of files.filter((f) => f.status === "pending")) {
      await cropSingleFile(file);
    }
    setCropping(false);
  }, [files, cropSingleFile]);

  // ============================================================================
  // CLEAR ALL
  // ============================================================================
  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("crop-pdf");
    setFiles([]);
  }, []);

  // ============================================================================
  // STATS
  // ============================================================================
  const stats = {
    total: files.length,
    pending: files.filter((f) => f.status === "pending").length,
    processing: files.filter((f) => f.status === "processing").length,
    error: files.filter((f) => f.status === "error").length,
  };

  return {
    files,
    cropping,
    stats,
    addFiles,
    addFromGoogleDrive,
    addFromDropbox,
    updateFileSettings,
    removeFile,
    cropSingleFile,
    cropAllFiles,
    clearAll,
  };
};
