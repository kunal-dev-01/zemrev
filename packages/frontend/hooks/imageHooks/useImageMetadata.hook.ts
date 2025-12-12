// ============================================================================
// FILE: src/hooks/imageHooks/useImageMetadata.hook.ts
// PURPOSE: Image Metadata Extractor Hook with Pending + LocalStorage
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import { useExtractMetadataMutation } from "@/services/imageService/image.api";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import { pendingStorage } from "@/utils/pendingStorage.utils";
import type { MetadataResponse } from "@/services/imageService/types";

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
        const { id, file: restoredFile } = restored[0]; // Only one file for metadata
        setFileId(id);
        setFile(restoredFile);
        const url = URL.createObjectURL(restoredFile);
        setImageUrl(url);
      }
    };

    restorePending();
  }, []);

  // ============================================================================
  // SET FILE
  // ============================================================================
  const setImageFile = useCallback(async (newFile: File) => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    
    // Save to pending storage
    const id = await pendingStorage.save("metadata", newFile);
    
    setFileId(id);
    setFile(newFile);
    const url = URL.createObjectURL(newFile);
    setImageUrl(url);
    setError("");
    setMetadataData(null);
  }, [imageUrl]);

  // ============================================================================
  // SET FROM URL
  // ============================================================================
  const setFromUrl = useCallback(async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const filename = url.split("/").pop() || "url-image.jpg";
      const newFile = new File([blob], filename, { type: blob.type });
      await setImageFile(newFile);
    } catch (err) {
      setError("Failed to download image from URL");
    }
  }, [setImageFile]);

  // ============================================================================
  // EXTRACT METADATA
  // ============================================================================
  const extractImageMetadata = useCallback(async () => {
    if (!file) return { success: false, error: "No file selected" };

    setExtracting(true);
    setError("");
    setMetadataData(null);

    try {
      const result = await extractMetadata({
        file,
      }).unwrap();

      setMetadataData(result);
      
      // Save metadata to localStorage as JSON
      const savedMetadata = JSON.parse(
        localStorage.getItem("zemrev_saved_metadata") || "[]"
      );
      
      const metadataEntry = {
        id: `metadata_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        filename: file.name,
        timestamp: Date.now(),
        data: result, // Save entire metadata response
      };
      
      savedMetadata.push(metadataEntry);
      localStorage.setItem("zemrev_saved_metadata", JSON.stringify(savedMetadata));

      // Delete from pending storage after successful extraction
      if (fileId) {
        await pendingStorage.delete("metadata", fileId);
      }

      // Trigger storage event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent('savedMetadataUpdated'));
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
  // COPY TO CLIPBOARD
  // ============================================================================
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  // ============================================================================
  // GET SAVED METADATA
  // ============================================================================
  const getSavedMetadata = useCallback(() => {
    const saved = localStorage.getItem("zemrev_saved_metadata");
    return saved ? JSON.parse(saved) : [];
  }, []);

  // ============================================================================
  // DELETE SAVED METADATA
  // ============================================================================
  const deleteSavedMetadata = useCallback((id: string) => {
    const saved = JSON.parse(localStorage.getItem("zemrev_saved_metadata") || "[]");
    const filtered = saved.filter((m: any) => m.id !== id);
    localStorage.setItem("zemrev_saved_metadata", JSON.stringify(filtered));
    
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent('savedMetadataUpdated'));
    }
  }, []);

  // ============================================================================
  // CLEAR ALL SAVED METADATA
  // ============================================================================
  const clearAllSavedMetadata = useCallback(() => {
    localStorage.removeItem("zemrev_saved_metadata");
    
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent('savedMetadataUpdated'));
    }
  }, []);

  // ============================================================================
  // EXPORT METADATA AS JSON
  // ============================================================================
  const exportMetadataAsJson = useCallback((metadata: MetadataResponse, filename: string) => {
    const json = JSON.stringify(metadata, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.split('.')[0]}_metadata.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // ============================================================================
  // RESET
  // ============================================================================
  const reset = useCallback(async () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    
    // Clear pending storage
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
    copyToClipboard,
    getSavedMetadata,
    deleteSavedMetadata,
    clearAllSavedMetadata,
    exportMetadataAsJson,
    reset,
  };
};