// ============================================================================
// FILE: src/hooks/imageHooks/useImagePalette.hook.ts
// PURPOSE: Image Color Palette Extractor Hook with Pending + Session Storage
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import { useExtractPaletteMutation } from "@/services/imageService/image.api";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import { sessionStorageUtils } from "@/utils/sessionStorage.utils";
import { pendingStorage } from "@/utils/pendingStorage.utils";
import type { PaletteResponse } from "@/services/imageService/types";

export const useImagePalette = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");
  const [paletteData, setPaletteData] = useState<PaletteResponse | null>(null);

  const [extractPalette] = useExtractPaletteMutation();

  // ============================================================================
  // RESTORE PENDING FILE ON MOUNT
  // ============================================================================
  useEffect(() => {
    const restorePending = async () => {
      const restored = await pendingStorage.restore("palette");
      
      if (restored.length > 0) {
        const { id, file: restoredFile } = restored[0]; // Only one file for palette
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
    const id = await pendingStorage.save("palette", newFile);
    
    setFileId(id);
    setFile(newFile);
    const url = URL.createObjectURL(newFile);
    setImageUrl(url);
    setError("");
    setPaletteData(null);
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
  // EXTRACT PALETTE
  // ============================================================================
  const extractColorPalette = useCallback(
    async (numColors: number = 5) => {
      if (!file) return { success: false, error: "No file selected" };

      setExtracting(true);
      setError("");
      setPaletteData(null);

      try {
        const result = await extractPalette({
          file,
          options: { num_colors: numColors },
        }).unwrap();

        setPaletteData(result);
        
        // Save palette data to localStorage as JSON (not blob)
        const savedPalettes = JSON.parse(
          localStorage.getItem("zemrev_saved_palettes") || "[]"
        );
        
        const paletteEntry = {
          id: `palette_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          filename: file.name,
          timestamp: Date.now(),
          data: result, // Save entire palette response
        };
        
        savedPalettes.push(paletteEntry);
        localStorage.setItem("zemrev_saved_palettes", JSON.stringify(savedPalettes));

        // Delete from pending storage after successful extraction
        if (fileId) {
          await pendingStorage.delete("palette", fileId);
        }

        // Trigger storage event for saved palettes update
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent('savedPalettesUpdated'));
        }

        setExtracting(false);
        return { success: true, data: result };
      } catch (err) {
        const errorMsg = extractApiErrorMessage(err);
        setError(errorMsg);
        setExtracting(false);
        return { success: false, error: errorMsg };
      }
    },
    [file, fileId, extractPalette]
  );

  // ============================================================================
  // COPY COLOR CODE
  // ============================================================================
  const copyColorCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
  }, []);

  // ============================================================================
  // GET SAVED PALETTES
  // ============================================================================
  const getSavedPalettes = useCallback(() => {
    const saved = localStorage.getItem("zemrev_saved_palettes");
    return saved ? JSON.parse(saved) : [];
  }, []);

  // ============================================================================
  // DELETE SAVED PALETTE
  // ============================================================================
  const deleteSavedPalette = useCallback((id: string) => {
    const saved = JSON.parse(localStorage.getItem("zemrev_saved_palettes") || "[]");
    const filtered = saved.filter((p: any) => p.id !== id);
    localStorage.setItem("zemrev_saved_palettes", JSON.stringify(filtered));
    
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent('savedPalettesUpdated'));
    }
  }, []);

  // ============================================================================
  // CLEAR ALL SAVED PALETTES
  // ============================================================================
  const clearAllSavedPalettes = useCallback(() => {
    localStorage.removeItem("zemrev_saved_palettes");
    
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent('savedPalettesUpdated'));
    }
  }, []);

  // ============================================================================
  // DOWNLOAD PALETTE FROM SESSION
  // ============================================================================
  const downloadPalette = useCallback(async () => {
    const sessionFiles = sessionStorageUtils.getFiles("palette");
    
    if (sessionFiles.length === 0) return;
    
    const latestFile = sessionFiles[sessionFiles.length - 1];
    const blob = await sessionStorageUtils.getBlob(latestFile.id);
    
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = latestFile.name;
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
      await pendingStorage.delete("palette", fileId);
    }
    
    setFileId(null);
    setFile(null);
    setImageUrl(null);
    setError("");
    setExtracting(false);
    setPaletteData(null);
  }, [imageUrl, fileId]);

  return {
    file,
    imageUrl,
    extracting,
    error,
    paletteData,
    setImageFile,
    setFromUrl,
    extractColorPalette,
    copyColorCode,
    getSavedPalettes,
    deleteSavedPalette,
    clearAllSavedPalettes,
    downloadPalette,
    reset,
  };
};