// ============================================================================
// FILE: src/hooks/pdfHooks/useOptimizePdf.hook.ts
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import { useOptimizePdfMutation } from "@/services/pdfService/pdf.api";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import type {
  PdfFileSettings,
  PdfProcessedFile,
} from "@/services/pdfService/types";
import { useCloudPicker } from "../appHooks/usePdfCloudPicker.hook";

export const useOptimizePdf = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [optimizing, setOptimizing] = useState(false);

  const [optimizePdf] = useOptimizePdfMutation();
  const { pickFromGoogleDrive, pickFromDropbox } = useCloudPicker();

  // ============================================================================
  // RESTORE
  // ============================================================================
  useEffect(() => {
    const restore = async () => {
      const restored = await pdfPendingStorage.restore("optimize-pdf");
      if (restored.length > 0) {
        setFiles(
          restored.map(({ id, file }) => ({
            id,
            originalFile: file,
            name: file.name,
            size: file.size,
            type: file.type,
            settings: {
              remove_metadata: true,
              remove_annotations: true,
              remove_javascript: true,
              remove_links: true,
              compress_images: false,
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
      const id = await pdfPendingStorage.save("optimize-pdf", file);
      processed.push({
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: {
          remove_metadata: true,
          remove_annotations: true,
          remove_javascript: true,
          remove_links: true,
          compress_images: false,
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
    const id = await pdfPendingStorage.save("optimize-pdf", file);

    setFiles((prev) => [
      ...prev,
      {
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: {
          remove_metadata: true,
          remove_annotations: true,
          remove_javascript: true,
          remove_links: true,
          compress_images: false,
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
    const id = await pdfPendingStorage.save("optimize-pdf", file);

    setFiles((prev) => [
      ...prev,
      {
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: {
          remove_metadata: true,
          remove_annotations: true,
          remove_javascript: true,
          remove_links: true,
          compress_images: false,
        },
        status: "pending",
      },
    ]);
  }, [pickFromDropbox]);

  // ============================================================================
  // REMOVE FILE
  // ============================================================================
  const removeFile = useCallback(async (id: string) => {
    await pdfPendingStorage.delete("optimize-pdf", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // ============================================================================
  // UPDATE SETTINGS
  // ============================================================================
  const updateFileSettings = useCallback(
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
  // OPTIMIZE SINGLE
  // ============================================================================
  const optimizeSingleFile = useCallback(
    async (file: PdfProcessedFile) => {
      try {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "processing" } : f
          )
        );

        const blob = await optimizePdf({
          file: file.originalFile as File,
          options: {
            remove_metadata: file.settings.remove_metadata as boolean,
            remove_annotations: file.settings.remove_annotations as boolean,
            remove_javascript: file.settings.remove_javascript as boolean,
            remove_links: file.settings.remove_links as boolean,
            compress_images: file.settings.compress_images as boolean,
          },
        }).unwrap();

        const outputName = `optimized_${file.name}`;
        await pdfSessionStorage.saveFile(blob, outputName, "optimize-pdf");

        await pdfPendingStorage.delete("optimize-pdf", file.id);
        setFiles((prev) => prev.filter((f) => f.id !== file.id));

        return { success: true };
      } catch (error) {
        const msg = extractApiErrorMessage(error);

        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "error", error: msg } : f
          )
        );

        return { success: false, error: msg };
      }
    },
    [optimizePdf]
  );

  // ============================================================================
  // OPTIMIZE ALL
  // ============================================================================
  const optimizeAllFiles = useCallback(async () => {
    setOptimizing(true);
    for (const file of files.filter((f) => f.status === "pending")) {
      await optimizeSingleFile(file);
    }
    setOptimizing(false);
  }, [files, optimizeSingleFile]);

  // ============================================================================
  // CLEAR ALL
  // ============================================================================
  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("optimize-pdf");
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
    optimizing,
    stats,
    addFiles,
    addFromGoogleDrive,
    addFromDropbox,
    removeFile,
    updateFileSettings,
    optimizeSingleFile,
    optimizeAllFiles,
    clearAll,
  };
};
