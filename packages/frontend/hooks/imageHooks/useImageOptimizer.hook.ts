// ============================================================================
// FILE: src/hooks/imageHooks/useImageOptimizer.hook.ts
// PURPOSE: Production-ready Image Optimizer with pending + session storage
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import { useOptimizeImageMutation } from "@/services/imageService/image.api";
import { sessionStorageUtils } from "@/utils/sessionStorage.utils";
import { pendingStorage } from "@/utils/pendingStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import type { FileSettings, ProcessedFile } from "@/services/imageService/types";
import { useCloudPicker } from "../appHooks/usePdfCloudPicker.hook";

export const useImageOptimizer = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [optimizing, setOptimizing] = useState(false);

  const [optimizeImage] = useOptimizeImageMutation();
  const { pickFromGoogleDrive, pickFromDropbox } = useCloudPicker();

  // ============================================================================
  // RESTORE PENDING FILES ON MOUNT
  // ============================================================================
  useEffect(() => {
    const restorePending = async () => {
      const restored = await pendingStorage.restore("optimizer");

      if (restored.length > 0) {
        const processed: ProcessedFile[] = restored.map(({ id, file }) => ({
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: {
            stripExif: true,
            stripGps: true,
            fixOrientation: true,
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
    async (
      newFiles: File[],
      stripExif: boolean,
      stripGps: boolean,
      fixOrientation: boolean
    ) => {
      const processed: ProcessedFile[] = [];

      for (const file of newFiles) {
        const id = await pendingStorage.save("optimizer", file);

        processed.push({
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: {
            stripExif,
            stripGps,
            fixOrientation,
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
    async (stripExif: boolean, stripGps: boolean, fixOrientation: boolean) => {
      const file = await pickFromGoogleDrive();
      const id = await pendingStorage.save("optimizer", file);

      setFiles((prev) => [
        ...prev,
        {
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: {
            stripExif,
            stripGps,
            fixOrientation,
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
    async (stripExif: boolean, stripGps: boolean, fixOrientation: boolean) => {
      const file = await pickFromDropbox();
      const id = await pendingStorage.save("optimizer", file);

      setFiles((prev) => [
        ...prev,
        {
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: {
            stripExif,
            stripGps,
            fixOrientation,
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
    async (
      url: string,
      stripExif: boolean,
      stripGps: boolean,
      fixOrientation: boolean
    ) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const filename = url.split("/").pop() || "url-image.jpg";
        const file = new File([blob], filename, { type: blob.type });

        await addFiles([file], stripExif, stripGps, fixOrientation);
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
    await pendingStorage.delete("optimizer", id);
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
  // OPTIMIZE SINGLE FILE
  // ============================================================================
  const optimizeSingleFile = useCallback(
    async (file: ProcessedFile) => {
      try {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "processing" } : f
          )
        );

        const blob = await optimizeImage({
          file: file.originalFile as File,
          options: {
            stripExif: file.settings.stripExif as boolean,
            stripGps: file.settings.stripGps as boolean,
            fixOrientation: file.settings.fixOrientation as boolean,
          },
        }).unwrap();

        const outputName = `optimized_${file.name}`;

        await sessionStorageUtils.saveFile(blob, outputName, "optimizer");
        await pendingStorage.delete("optimizer", file.id);
        setFiles((prev) => prev.filter((f) => f.id !== file.id));

        return { success: true, blob, name: outputName };
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
    [optimizeImage]
  );

  // ============================================================================
  // OPTIMIZE ALL FILES
  // ============================================================================
  const optimizeAllFiles = useCallback(async () => {
    setOptimizing(true);
    const pendingFiles = files.filter((f) => f.status === "pending");

    for (const file of pendingFiles) {
      await optimizeSingleFile(file);
    }

    setOptimizing(false);
  }, [files, optimizeSingleFile]);

  // ============================================================================
  // DOWNLOAD FROM SESSION
  // ============================================================================
  const downloadFile = useCallback(async (fileId: string) => {
    const fileMeta = sessionStorageUtils.getFile("optimizer", fileId);
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
    const sessionFiles = sessionStorageUtils.getFiles("optimizer");

    for (const [index, file] of sessionFiles.entries()) {
      setTimeout(() => downloadFile(file.id), index * 500);
    }
  }, [downloadFile]);

  // ============================================================================
  // CLEAR / RESET
  // ============================================================================
  const clearAll = useCallback(async () => {
    await pendingStorage.clearTool("optimizer");
    setFiles([]);
  }, []);

  const reset = useCallback(async () => {
    await pendingStorage.clearTool("optimizer");
    setFiles([]);
    setOptimizing(false);
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
    addFromUrl,
    removeFile,
    updateFileSettings,
    optimizeSingleFile,
    optimizeAllFiles,
    downloadFile,
    downloadAll,
    clearAll,
    reset,
    setFiles,
  };
};
