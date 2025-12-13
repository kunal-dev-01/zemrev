// ============================================================================
// FILE: src/hooks/pdfHooks/usePdfCompressor.hook.ts
// PURPOSE: PDF Compressor with pending + session storage
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import { useCompressPdfMutation } from "@/services/pdfService/pdf.api";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import type {
  PdfFileSettings,
  PdfProcessedFile,
} from "@/services/pdfService/types";
import { useCloudPicker } from "../appHooks/usePdfCloudPicker.hook";

export const usePdfCompressor = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [compressPdf] = useCompressPdfMutation();
  const { pickFromGoogleDrive, pickFromDropbox } = useCloudPicker();

  // ============================================================================
  // RESTORE PENDING FILES ON MOUNT
  // ============================================================================
  useEffect(() => {
    const restorePending = async () => {
      const restored = await pdfPendingStorage.restore("compress-pdf");

      if (restored.length > 0) {
        const processed: PdfProcessedFile[] = restored.map(({ id, file }) => ({
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: {
            level: "ebook",
          },
          status: "pending" as const,
        }));

        setFiles(processed);
      }
    };

    restorePending();
  }, []);

  // ============================================================================
  // ADD FILES
  // ============================================================================
  const addFiles = useCallback(
    async (newFiles: File[], defaultLevel: string) => {
      const processed: PdfProcessedFile[] = [];

      for (const file of newFiles) {
        const id = await pdfPendingStorage.save("compress-pdf", file);

        processed.push({
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: {
            level: defaultLevel as "screen" | "ebook" | "printer" | "prepress",
          },
          status: "pending",
        });
      }

      setFiles((prev) => [...prev, ...processed]);
    },
    []
  );

  // ============================================================================
  // REMOVE FILE
  // ============================================================================
  const removeFile = useCallback(async (id: string) => {
    await pdfPendingStorage.delete("compress-pdf", id);
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
  // COMPRESS SINGLE FILE
  // ============================================================================
  const compressSingleFile = useCallback(
    async (file: PdfProcessedFile) => {
      try {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "processing" } : f
          )
        );

        const blob = await compressPdf({
          file: file.originalFile as File,
          options: {
            level: file.settings.level as
              | "screen"
              | "ebook"
              | "printer"
              | "prepress",
          },
        }).unwrap();

        const outputName = `compressed_${file.name}`;

        await pdfSessionStorage.saveFile(blob, outputName, "compress-pdf");

        await pdfPendingStorage.delete("compress-pdf", file.id);

        setFiles((prev) => prev.filter((f) => f.id !== file.id));

        return { success: true, blob, name: outputName };
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
    [compressPdf]
  );

  // ============================================================================
  // COMPRESS ALL FILES
  // ============================================================================
  const compressAllFiles = useCallback(async () => {
    setCompressing(true);
    const pendingFiles = files.filter((f) => f.status === "pending");

    for (const file of pendingFiles) {
      await compressSingleFile(file);
    }

    setCompressing(false);
  }, [files, compressSingleFile]);

  // ============================================================================
  // DOWNLOAD FROM SESSION
  // ============================================================================
  const downloadFile = useCallback(async (fileId: string) => {
    const fileMeta = pdfSessionStorage.getFile("compress-pdf", fileId);
    if (!fileMeta) return;

    const blob = await pdfSessionStorage.getBlob(fileId);
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileMeta.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // ============================================================================
  // DOWNLOAD ALL
  // ============================================================================
  const downloadAll = useCallback(async () => {
    const sessionFiles = pdfSessionStorage.getFiles("compress-pdf");

    for (const [index, file] of sessionFiles.entries()) {
      setTimeout(() => downloadFile(file.id), index * 500);
    }
  }, [downloadFile]);

  // ============================================================================
  // CLEAR ALL
  // ============================================================================
  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("compress-pdf");
    setFiles([]);
  }, []);

  // ============================================================================
  // RESET
  // ============================================================================
  const reset = useCallback(async () => {
    await pdfPendingStorage.clearTool("compress-pdf");
    setFiles([]);
    setCompressing(false);
  }, []);

  // ============================================================================
  // ADD FROM GOOGLE DRIVE
  // ============================================================================
  const addFromGoogleDrive = useCallback(
    async (defaultLevel: string) => {
      const file = await pickFromGoogleDrive();

      const id = await pdfPendingStorage.save("compress-pdf", file);

      setFiles((prev) => [
        ...prev,
        {
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: {
            level: defaultLevel as PdfFileSettings["level"],
          },
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
    async (defaultLevel: string) => {
      const file = await pickFromDropbox();

      const id = await pdfPendingStorage.save("compress-pdf", file);

      setFiles((prev) => [
        ...prev,
        {
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: {
            level: defaultLevel as PdfFileSettings["level"],
          },
          status: "pending",
        },
      ]);
    },
    [pickFromDropbox]
  );

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
    compressing,
    stats,
    addFiles,
    removeFile,
    updateFileSettings,
    compressSingleFile,
    compressAllFiles,
    addFromGoogleDrive,
    addFromDropbox,
    downloadFile,
    downloadAll,
    clearAll,
    reset,
    setFiles,
  };
};
