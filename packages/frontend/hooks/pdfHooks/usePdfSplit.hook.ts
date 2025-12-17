// ============================================================================
// FILE: src/hooks/pdfHooks/usePdfSplit.hook.ts
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import { useSplitPdfMutation } from "@/services/pdfService/pdf.api";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import type {
  PdfFileSettings,
  PdfProcessedFile,
} from "@/services/pdfService/types";
import { useCloudPicker } from "../appHooks/usePdfCloudPicker.hook";

export const usePdfSplit = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [splitting, setSplitting] = useState(false);

  const [splitPdf] = useSplitPdfMutation();
  const { pickFromGoogleDrive, pickFromDropbox } = useCloudPicker();

  // ============================================================================
  // RESTORE
  // ============================================================================
  useEffect(() => {
    const restore = async () => {
      const restored = await pdfPendingStorage.restore("pdf-split");
      if (restored.length > 0) {
        setFiles(
          restored.map(({ id, file }) => ({
            id,
            originalFile: file,
            name: file.name,
            size: file.size,
            type: file.type,
            settings: { pages: "1-3" },
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
  const addFiles = useCallback(
    async (newFiles: File[], defaultPages: string) => {
      const processed: PdfProcessedFile[] = [];

      for (const file of newFiles) {
        const id = await pdfPendingStorage.save("pdf-split", file);
        processed.push({
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: { pages: defaultPages },
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
      const id = await pdfPendingStorage.save("pdf-split", file);

      setFiles((prev) => [
        ...prev,
        {
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: { pages: defaultPages },
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
      const id = await pdfPendingStorage.save("pdf-split", file);

      setFiles((prev) => [
        ...prev,
        {
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: { pages: defaultPages },
          status: "pending",
        },
      ]);
    },
    [pickFromDropbox]
  );

  // ============================================================================
  // REMOVE FILE
  // ============================================================================
  const removeFile = useCallback(async (id: string) => {
    await pdfPendingStorage.delete("pdf-split", id);
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
  // SPLIT SINGLE
  // ============================================================================
  const splitSingleFile = useCallback(
    async (file: PdfProcessedFile) => {
      try {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "processing" } : f
          )
        );

        const blob = await splitPdf({
          file: file.originalFile as File,
          options: { pages: file.settings.pages as string },
        }).unwrap();

        // ✅ Automatically detect file type from blob
        const isZip = blob.type === "application/zip";

        const outputName = isZip
          ? `split_${file.name.replace(".pdf", "")}.zip`
          : `split_${file.name}`;

        await pdfSessionStorage.saveFile(blob, outputName, "pdf-split");

        await pdfPendingStorage.delete("pdf-split", file.id);
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
    [splitPdf]
  );

  // ============================================================================
  // SPLIT ALL
  // ============================================================================
  const splitAllFiles = useCallback(async () => {
    setSplitting(true);
    for (const file of files.filter((f) => f.status === "pending")) {
      await splitSingleFile(file);
    }
    setSplitting(false);
  }, [files, splitSingleFile]);

  // ============================================================================
  // CLEAR ALL
  // ============================================================================
  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("pdf-split");
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
    splitting,
    stats,
    addFiles,
    addFromGoogleDrive,
    addFromDropbox,
    removeFile,
    updateFileSettings,
    splitSingleFile,
    splitAllFiles,
    clearAll,
  };
};
