// ============================================================================
// FILE: src/hooks/imageHooks/useImageCompressor.hook.ts
// PURPOSE: Production-ready Image Compressor with pending + session storage
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import { useCompressImageMutation } from "@/services/imageService/image.api";
import { sessionStorageUtils } from "@/utils/sessionStorage.utils";
import { pendingStorage } from "@/utils/pendingStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import type {
  FileSettings,
  ProcessedFile,
} from "@/services/imageService/types";
import { useCloudPicker } from "../appHooks/usePdfCloudPicker.hook";

export const useImageCompressor = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [compressing, setCompressing] = useState(false);

  const [compressImage] = useCompressImageMutation();
  const { pickFromGoogleDrive, pickFromDropbox } = useCloudPicker();

  // ============================================================================
  // RESTORE PENDING FILES ON MOUNT
  // ============================================================================
  useEffect(() => {
    const restorePending = async () => {
      const restored = await pendingStorage.restore("compressor");

      if (restored.length > 0) {
        const processed: ProcessedFile[] = restored.map(({ id, file }) => ({
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: {
            quality: 75,
          },
          status: "pending" as const,
        }));

        setFiles(processed);
      }
    };

    restorePending();
  }, []);

  // ============================================================================
  // ADD FILES (LOCAL)
  // ============================================================================
  const addFiles = useCallback(
    async (newFiles: File[], defaultQuality: number) => {
      const processed: ProcessedFile[] = [];

      for (const file of newFiles) {
        const id = await pendingStorage.save("compressor", file);

        processed.push({
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: {
            quality: defaultQuality,
          },
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
    async (defaultQuality: number) => {
      const file = await pickFromGoogleDrive();
      const id = await pendingStorage.save("compressor", file);

      setFiles((prev) => [
        ...prev,
        {
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: {
            quality: defaultQuality,
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
    async (defaultQuality: number) => {
      const file = await pickFromDropbox();
      const id = await pendingStorage.save("compressor", file);

      setFiles((prev) => [
        ...prev,
        {
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: {
            quality: defaultQuality,
          },
          status: "pending",
        },
      ]);
    },
    [pickFromDropbox]
  );

  // ============================================================================
  // ADD FROM URL
  // ============================================================================
  const addFromUrl = useCallback(
    async (url: string, defaultQuality: number) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const filename = url.split("/").pop() || "url-image.jpg";
        const file = new File([blob], filename, { type: blob.type });

        await addFiles([file], defaultQuality);
      } catch {
        throw new Error("Failed to download image from URL");
      }
    },
    [addFiles]
  );

  // ============================================================================
  // REMOVE FILE
  // ============================================================================
  const removeFile = useCallback(async (id: string) => {
    await pendingStorage.delete("compressor", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // ============================================================================
  // UPDATE SETTINGS
  // ============================================================================
  const updateFileSettings = useCallback(
    (id: string, settings: FileSettings) => {
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
    async (file: ProcessedFile) => {
      try {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "processing" } : f
          )
        );

        const blob = await compressImage({
          file: file.originalFile as File,
          options: {
            quality: file.settings.quality as number,
          },
        }).unwrap();

        const outputName = `compressed_${file.name}`;

        await sessionStorageUtils.saveFile(blob, outputName, "compressor");
        await pendingStorage.delete("compressor", file.id);

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
    [compressImage]
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
    const fileMeta = sessionStorageUtils.getFile("compressor", fileId);
    if (!fileMeta) return;

    const blob = await sessionStorageUtils.getBlob(fileId);
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
  // DOWNLOAD ALL FROM SESSION
  // ============================================================================
  const downloadAll = useCallback(async () => {
    const sessionFiles = sessionStorageUtils.getFiles("compressor");

    for (const [index, file] of sessionFiles.entries()) {
      setTimeout(() => downloadFile(file.id), index * 500);
    }
  }, [downloadFile]);

  // ============================================================================
  // CLEAR PENDING
  // ============================================================================
  const clearAll = useCallback(async () => {
    await pendingStorage.clearTool("compressor");
    setFiles([]);
  }, []);

  // ============================================================================
  // RESET
  // ============================================================================
  const reset = useCallback(async () => {
    await pendingStorage.clearTool("compressor");
    setFiles([]);
    setCompressing(false);
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
    compressing,
    stats,
    addFiles,
    addFromGoogleDrive,
    addFromDropbox,
    addFromUrl,
    removeFile,
    updateFileSettings,
    compressSingleFile,
    compressAllFiles,
    downloadFile,
    downloadAll,
    clearAll,
    reset,
    setFiles,
  };
};
