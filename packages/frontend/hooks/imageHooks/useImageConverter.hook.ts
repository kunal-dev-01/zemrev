// hooks/imageHooks/useImageConverter.hook.ts (NO DUPLICATES IN SESSION)

import { useState, useCallback, useEffect } from "react";
import { useConvertImageMutation } from "@/services/imageService/image.api";
import { sessionStorageUtils } from "@/utils/sessionStorage.utils";
import { pendingStorage } from "@/utils/pendingStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import { getOutputFilename } from "@/config/tool.config";
import type { ProcessedFile, OutputFormat, FileSettings } from "@/services/imageService/types";

export const useImageConverter = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [converting, setConverting] = useState(false);
  const [convertImage] = useConvertImageMutation();

  // ============================================================================
  // RESTORE PENDING FILES ON MOUNT
  // ============================================================================
  useEffect(() => {
    const restorePending = async () => {
      const restored = await pendingStorage.restore("converter");
      
      if (restored.length > 0) {
        const processed: ProcessedFile[] = restored.map(({ id, file }) => ({
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: {
            format: "webp" as OutputFormat,
            quality: 75,
            stripMetadata: true,
          },
          status: "pending" as const,
        }));

        setFiles(processed);
      }
    };

    restorePending();
  }, []);

  // ============================================================================
  // ADD FILES (with pending storage)
  // ============================================================================
  const addFiles = useCallback(
    async (newFiles: File[], defaultFormat: OutputFormat, defaultQuality: number) => {
      const processed: ProcessedFile[] = [];

      for (const file of newFiles) {
        const id = await pendingStorage.save("converter", file);

        processed.push({
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: {
            format: defaultFormat,
            quality: defaultQuality,
            stripMetadata: true,
          },
          status: "pending",
        });
      }

      setFiles((prev) => [...prev, ...processed]);
    },
    []
  );

  // ============================================================================
  // ADD FROM URL
  // ============================================================================
  const addFromUrl = useCallback(
    async (url: string, defaultFormat: OutputFormat, defaultQuality: number) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const filename = url.split("/").pop() || "url-image.jpg";
        const file = new File([blob], filename, { type: blob.type });

        await addFiles([file], defaultFormat, defaultQuality);
      } catch (error) {
        throw new Error("Failed to download image from URL");
      }
    },
    [addFiles]
  );

  // ============================================================================
  // REMOVE FILE
  // ============================================================================
  const removeFile = useCallback(async (id: string) => {
    await pendingStorage.delete("converter", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // ============================================================================
  // UPDATE SETTINGS
  // ============================================================================
  const updateFileSettings = useCallback((id: string, settings: FileSettings) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, settings: { ...f.settings, ...settings } } : f))
    );
  }, []);

  // ============================================================================
  // CONVERT SINGLE FILE (Saves to session storage, removes from pending)
  // ============================================================================
  const convertSingleFile = useCallback(
    async (file: ProcessedFile) => {
      try {
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "processing" } : f))
        );

        const blob = await convertImage({
          file: file.originalFile as File,
          options: {
            format: file.settings.format as OutputFormat,
            quality: file.settings.quality as number,
            strip_metadata: file.settings.stripMetadata ?? true,
          },
        }).unwrap();

        const outputName = getOutputFilename(file.name, file.settings.format as OutputFormat);

        // Save to session storage (ONLY ONCE)
        await sessionStorageUtils.saveFile(blob, outputName, "converter");

        // Delete from pending storage
        await pendingStorage.delete("converter", file.id);

        // Remove from state (completed files only in SessionFilesDisplay)
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
    [convertImage]
  );

  // ============================================================================
  // CONVERT ALL FILES
  // ============================================================================
  const convertAllFiles = useCallback(async () => {
    setConverting(true);
    const pendingFiles = files.filter((f) => f.status === "pending");

    for (const file of pendingFiles) {
      await convertSingleFile(file);
    }

    setConverting(false);
  }, [files, convertSingleFile]);

  // ============================================================================
  // DOWNLOAD FROM SESSION (not from state)
  // ============================================================================
  const downloadFile = useCallback(async (fileId: string) => {
    const fileMeta = sessionStorageUtils.getFile("converter", fileId);
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
    const sessionFiles = sessionStorageUtils.getFiles("converter");

    for (const [index, file] of sessionFiles.entries()) {
      setTimeout(() => downloadFile(file.id), index * 500);
    }
  }, [downloadFile]);

  // ============================================================================
  // CLEAR PENDING FILES
  // ============================================================================
  const clearAll = useCallback(async () => {
    await pendingStorage.clearTool("converter");
    setFiles([]);
  }, []);

  // ============================================================================
  // RESET
  // ============================================================================
  const reset = useCallback(async () => {
    await pendingStorage.clearTool("converter");
    setFiles([]);
    setConverting(false);
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
    converting,
    stats,
    addFiles,
    addFromUrl,
    removeFile,
    updateFileSettings,
    convertSingleFile,
    convertAllFiles,
    downloadFile,
    downloadAll,
    clearAll,
    reset,
    setFiles,
  };
};