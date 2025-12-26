// ============================================================================
// FILE: src/hooks/pdfHooks/usePdfRemovePages.hook.ts
// PURPOSE: Hook for removing pages from PDF
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import { useRemovePagesFromPdfMutation } from "@/services/pdfService/pdf.api";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import type {
  PdfFileSettings,
  PdfProcessedFile,
} from "@/services/pdfService/types";
import { useCloudPicker } from "../appHooks/usePdfCloudPicker.hook";

export const usePdfRemovePages = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [processing, setProcessing] = useState(false);

  const [removePagesFromPdf] = useRemovePagesFromPdfMutation();
  const { pickFromGoogleDrive, pickFromDropbox } = useCloudPicker();

  // ============================================================================
  // RESTORE PENDING FILES ON MOUNT
  // ============================================================================
  useEffect(() => {
    const restore = async () => {
      const restored = await pdfPendingStorage.restore("pdf-remove-pages");
      if (restored.length > 0) {
        setFiles(
          restored.map(({ id, file }) => ({
            id,
            originalFile: file,
            name: file.name,
            size: file.size,
            type: file.type,
            settings: { pages_to_remove: "" }, // Default
            status: "pending" as const,
          }))
        );
      }
    };
    restore();
  }, []);

  // ============================================================================
  // ADD FILES (LOCAL UPLOAD)
  // ============================================================================
  const addFiles = useCallback(
    async (newFiles: File[], defaultPages: string) => {
      const processed: PdfProcessedFile[] = [];

      for (const file of newFiles) {
        const id = await pdfPendingStorage.save("pdf-remove-pages", file);
        processed.push({
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: { pages_to_remove: defaultPages },
          status: "pending",
        });
      }

      setFiles((prev) => [...prev, ...processed]);
    },
    []
  );

  // ============================================================================
  // ADD FROM GOOGLE DRIVE
  // ============================================================================
  const addFromGoogleDrive = useCallback(
    async (defaultPages: string) => {
      const file = await pickFromGoogleDrive();
      const id = await pdfPendingStorage.save("pdf-remove-pages", file);

      setFiles((prev) => [
        ...prev,
        {
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: { pages_to_remove: defaultPages },
          status: "pending",
        },
      ]);
    },
    [pickFromGoogleDrive]
  );

  // ============================================================================
  // ADD FROM DROPBOX
  // ============================================================================
  const addFromDropbox = useCallback(
    async (defaultPages: string) => {
      const file = await pickFromDropbox();
      const id = await pdfPendingStorage.save("pdf-remove-pages", file);

      setFiles((prev) => [
        ...prev,
        {
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: { pages_to_remove: defaultPages },
          status: "pending",
        },
      ]);
    },
    [pickFromDropbox]
  );

  // ============================================================================
  // REMOVE FILE FROM LIST
  // ============================================================================
  const removeFile = useCallback(async (id: string) => {
    await pdfPendingStorage.delete("pdf-remove-pages", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // ============================================================================
  // UPDATE FILE SETTINGS
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
  // PROCESS SINGLE FILE
  // ============================================================================
  const processSingleFile = useCallback(
    async (file: PdfProcessedFile) => {
      try {
        // Update status to processing
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "processing" } : f
          )
        );

        // Call API
        const blob = await removePagesFromPdf({
          file: file.originalFile as File,
          options: {
            pages_to_remove: file.settings.pages_to_remove as string,
          },
        }).unwrap();

        // Generate output filename
        const outputName = `pages_removed_${file.name}`;

        // Save to session storage
        await pdfSessionStorage.saveFile(blob, outputName, "pdf-remove-pages");

        // Remove from pending storage
        await pdfPendingStorage.delete("pdf-remove-pages", file.id);

        // Remove from UI
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
    [removePagesFromPdf]
  );

  // ============================================================================
  // PROCESS ALL FILES
  // ============================================================================
  const processAllFiles = useCallback(async () => {
    setProcessing(true);

    const pendingFiles = files.filter((f) => f.status === "pending");

    for (const file of pendingFiles) {
      await processSingleFile(file);
    }

    setProcessing(false);
  }, [files, processSingleFile]);

  // ============================================================================
  // CLEAR ALL FILES
  // ============================================================================
  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("pdf-remove-pages");
    setFiles([]);
  }, []);

  // ============================================================================
  // STATISTICS
  // ============================================================================
  const stats = {
    total: files.length,
    pending: files.filter((f) => f.status === "pending").length,
    processing: files.filter((f) => f.status === "processing").length,
    error: files.filter((f) => f.status === "error").length,
  };

  // ============================================================================
  // RETURN API
  // ============================================================================
  return {
    files,
    processing,
    stats,
    addFiles,
    addFromGoogleDrive,
    addFromDropbox,
    removeFile,
    updateFileSettings,
    processSingleFile,
    processAllFiles,
    clearAll,
  };
};
