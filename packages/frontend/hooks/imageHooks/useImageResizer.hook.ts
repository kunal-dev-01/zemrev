// ============================================================================
// FILE: src/hooks/imageHooks/useImageResizer.hook.ts
// PURPOSE: Production-ready Image Resizer with pending + session storage
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import { useResizeImageMutation } from "@/services/imageService/image.api";
import { sessionStorageUtils } from "@/utils/sessionStorage.utils";
import { pendingStorage } from "@/utils/pendingStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import type {
  FileSettings,
  ProcessedFile,
  ResizeMode,
} from "@/services/imageService/types";
import { useCloudPicker } from "../appHooks/usePdfCloudPicker.hook";

export const useImageResizer = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [resizing, setResizing] = useState(false);
  const [resizeImage] = useResizeImageMutation();
  const { pickFromGoogleDrive, pickFromDropbox } = useCloudPicker();

  // ============================================================================
  // RESTORE PENDING FILES ON MOUNT
  // ============================================================================
  useEffect(() => {
    const restorePending = async () => {
      const restored = await pendingStorage.restore("resizer");

      if (restored.length > 0) {
        const processed: ProcessedFile[] = restored.map(({ id, file }) => ({
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: {
            width: 1920,
            height: 1080,
            mode: "contain" as ResizeMode,
          },
          status: "pending" as const,
        }));

        setFiles(processed);
      }
    };

    restorePending();
  }, []);

  // ============================================================================
  // ADD FILES (LOCAL / CLOUD COMMON)
  // ============================================================================
  const addFiles = useCallback(
    async (
      newFiles: File[],
      defaultWidth: number,
      defaultHeight: number,
      defaultMode: ResizeMode
    ) => {
      const processed: ProcessedFile[] = [];

      for (const file of newFiles) {
        const id = await pendingStorage.save("resizer", file);

        processed.push({
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: {
            width: defaultWidth,
            height: defaultHeight,
            mode: defaultMode,
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
    async (
      url: string,
      defaultWidth: number,
      defaultHeight: number,
      defaultMode: ResizeMode
    ) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const filename = url.split("/").pop() || "url-image.jpg";
        const file = new File([blob], filename, { type: blob.type });

        await addFiles([file], defaultWidth, defaultHeight, defaultMode);
      } catch {
        throw new Error("Failed to download image from URL");
      }
    },
    [addFiles]
  );

  // ============================================================================
  // ADD FROM GOOGLE DRIVE
  // ============================================================================
  const addFromGoogleDrive = useCallback(
    async (
      defaultWidth: number,
      defaultHeight: number,
      defaultMode: ResizeMode
    ) => {
      const file = await pickFromGoogleDrive();
      await addFiles([file], defaultWidth, defaultHeight, defaultMode);
    },
    [pickFromGoogleDrive, addFiles]
  );

  // ============================================================================
  // ADD FROM DROPBOX
  // ============================================================================
  const addFromDropbox = useCallback(
    async (
      defaultWidth: number,
      defaultHeight: number,
      defaultMode: ResizeMode
    ) => {
      const file = await pickFromDropbox();
      await addFiles([file], defaultWidth, defaultHeight, defaultMode);
    },
    [pickFromDropbox, addFiles]
  );

  // ============================================================================
  // REMOVE FILE
  // ============================================================================
  const removeFile = useCallback(async (id: string) => {
    await pendingStorage.delete("resizer", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // ============================================================================
  // UPDATE SETTINGS
  // ============================================================================
  const updateFileSettings = useCallback(
    (id: string, settings: FileSettings) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, settings: { ...f.settings, ...settings } }
            : f
        )
      );
    },
    []
  );

  // ============================================================================
  // RESIZE SINGLE FILE
  // ============================================================================
  const resizeSingleFile = useCallback(
    async (file: ProcessedFile) => {
      try {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "processing" } : f
          )
        );

        const blob = await resizeImage({
          file: file.originalFile as File,
          options: {
            width: file.settings.width as number,
            height: file.settings.height as number,
            mode: file.settings.mode as ResizeMode,
          },
        }).unwrap();

        const outputName = `resized_${file.name}`;

        await sessionStorageUtils.saveFile(blob, outputName, "resizer");
        await pendingStorage.delete("resizer", file.id);

        setFiles((prev) => prev.filter((f) => f.id !== file.id));

        return { success: true, blob, name: outputName };
      } catch (error) {
        const errorMsg = extractApiErrorMessage(error);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, status: "error", error: errorMsg }
              : f
          )
        );
        return { success: false, error: errorMsg };
      }
    },
    [resizeImage]
  );

  // ============================================================================
  // RESIZE ALL FILES
  // ============================================================================
  const resizeAllFiles = useCallback(async () => {
    setResizing(true);

    for (const file of files.filter((f) => f.status === "pending")) {
      await resizeSingleFile(file);
    }

    setResizing(false);
  }, [files, resizeSingleFile]);

  // ============================================================================
  // DOWNLOAD FROM SESSION
  // ============================================================================
  const downloadFile = useCallback(async (fileId: string) => {
    const fileMeta = sessionStorageUtils.getFile("resizer", fileId);
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
    const sessionFiles = sessionStorageUtils.getFiles("resizer");

    for (const [index, file] of sessionFiles.entries()) {
      setTimeout(() => downloadFile(file.id), index * 500);
    }
  }, [downloadFile]);

  // ============================================================================
  // CLEAR PENDING
  // ============================================================================
  const clearAll = useCallback(async () => {
    await pendingStorage.clearTool("resizer");
    setFiles([]);
  }, []);

  // ============================================================================
  // RESET
  // ============================================================================
  const reset = useCallback(async () => {
    await pendingStorage.clearTool("resizer");
    setFiles([]);
    setResizing(false);
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
    resizing,
    stats,

    addFiles,
    addFromUrl,
    addFromGoogleDrive,
    addFromDropbox,

    removeFile,
    updateFileSettings,
    resizeSingleFile,
    resizeAllFiles,

    downloadFile,
    downloadAll,

    clearAll,
    reset,
    setFiles,
  };
};
