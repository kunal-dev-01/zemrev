// ============================================================================
// FILE: src/hooks/imageHooks/useImageMetadata.hook.ts
// PURPOSE: Image Metadata Extractor Hook (Pending + SessionDB)
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import { useExtractMetadataMutation } from "@/services/imageService/image.api";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import { pendingStorage } from "@/utils/pendingStorage.utils";
import { sessionStorageUtils } from "@/utils/sessionStorage.utils";
import type { MetadataResponse, StoredFile } from "@/services/imageService/types";

export const useImageMetadata = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");
  const [metadataData, setMetadataData] = useState<MetadataResponse | null>(null);

  const [extractMetadata] = useExtractMetadataMutation();

  // ============================================================================
  // RESTORE PENDING FILE ON MOUNT
  // ============================================================================
  useEffect(() => {
    const restorePending = async () => {
      const restored = await pendingStorage.restore("metadata");

      if (restored.length > 0) {
        const { id, file: restoredFile } = restored[0];

        setFileId(id);
        setFile(restoredFile);

        const url = URL.createObjectURL(restoredFile);
        setImageUrl(url);
      }
    };

    restorePending();
  }, []);

  // ============================================================================
  // SET FILE (save to pending storage)
  // ============================================================================
  const setImageFile = useCallback(
    async (newFile: File) => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);

      const id = await pendingStorage.save("metadata", newFile);

      setFileId(id);
      setFile(newFile);

      const url = URL.createObjectURL(newFile);
      setImageUrl(url);

      setError("");
      setMetadataData(null);
    },
    [imageUrl]
  );

  // ============================================================================
  // SET FROM URL
  // ============================================================================
  const setFromUrl = useCallback(
    async (url: string) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();

        const filename = url.split("/").pop() || "url-image.jpg";
        const newFile = new File([blob], filename, { type: blob.type });

        await setImageFile(newFile);
      } catch {
        setError("Failed to download image from URL");
      }
    },
    [setImageFile]
  );

  // ============================================================================
  // EXTRACT METADATA + SAVE TO SESSION DB (2hr TTL)
// ============================================================================
  const extractImageMetadata = useCallback(async () => {
    if (!file) return { success: false, error: "No file selected" };

    setExtracting(true);
    setError("");
    setMetadataData(null);

    try {
      const result = await extractMetadata({ file }).unwrap();

      setMetadataData(result);

      // Save JSON metadata into sessionDB as blob
      const jsonBlob = new Blob([JSON.stringify(result, null, 2)], {
        type: "application/json",
      });

      await sessionStorageUtils.saveFile(
        jsonBlob,
        `${file.name}_metadata.json`,
        "metadata"
      );

      // Remove from pending
      if (fileId) {
        await pendingStorage.delete("metadata", fileId);
      }

      setExtracting(false);
      return { success: true, data: result };
    } catch (err) {
      const errorMsg = extractApiErrorMessage(err);
      setError(errorMsg);
      setExtracting(false);
      return { success: false, error: errorMsg };
    }
  }, [file, fileId, extractMetadata]);

  // ============================================================================
  // GET SAVED METADATA FILES FROM SESSIONDB
  // ============================================================================
  const getSavedMetadata = useCallback((): StoredFile[] => {
    return sessionStorageUtils.getFiles("metadata");
  }, []);

  // ============================================================================
  // DELETE SPECIFIC SAVED FILE
  // ============================================================================
  const deleteSavedMetadata = useCallback(async (id: string) => {
    await sessionStorageUtils.deleteFile("metadata", id);
  }, []);

  // ============================================================================
  // CLEAR ALL SAVED METADATA FOR THIS TOOL
  // ============================================================================
  const clearAllSavedMetadata = useCallback(async () => {
    await sessionStorageUtils.clearTool("metadata");
  }, []);

  // ============================================================================
  // EXPORT FILE DIRECT (blob from sessionDB)
  // ============================================================================
  const exportMetadataAsJson = useCallback(async (id: string, filename: string) => {
    const blob = await sessionStorageUtils.getBlob(id);
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  }, []);

  // ============================================================================
  // COPY ANY TEXT TO CLIPBOARD
  // ============================================================================
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  // ============================================================================
  // RESET
  // ============================================================================
  const reset = useCallback(async () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);

    if (fileId) {
      await pendingStorage.delete("metadata", fileId);
    }

    setFileId(null);
    setFile(null);
    setImageUrl(null);
    setError("");
    setExtracting(false);
    setMetadataData(null);
  }, [imageUrl, fileId]);

  return {
    file,
    imageUrl,
    extracting,
    error,
    metadataData,

    setImageFile,
    setFromUrl,
    extractImageMetadata,

    getSavedMetadata,
    deleteSavedMetadata,
    clearAllSavedMetadata,
    exportMetadataAsJson,

    copyToClipboard,
    reset,
  };
};
