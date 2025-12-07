// ============================================================================
// FILE: src/hooks/imageHooks/useImagePalette.hook.ts
// PURPOSE: Image Color Palette Extractor Hook
// ============================================================================

import { useState, useCallback } from "react";
import { useExtractPaletteMutation } from "@/services/imageService/image.api";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import type { PaletteResponse } from "@/services/imageService/types";

export const useImagePalette = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");
  const [paletteData, setPaletteData] = useState<PaletteResponse | null>(null);

  const [extractPalette] = useExtractPaletteMutation();

  // ============================================================================
  // SET FILE
  // ============================================================================
  const setImageFile = useCallback((newFile: File) => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
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
      const file = new File([blob], filename, { type: blob.type });
      setImageFile(file);
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
        setExtracting(false);
        return { success: true, data: result };
      } catch (err) {
        const errorMsg = extractApiErrorMessage(err);
        setError(errorMsg);
        setExtracting(false);
        return { success: false, error: errorMsg };
      }
    },
    [file, extractPalette]
  );

  // ============================================================================
  // COPY COLOR CODE
  // ============================================================================
  const copyColorCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
  }, []);

  // ============================================================================
  // RESET
  // ============================================================================
  const reset = useCallback(() => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setFile(null);
    setImageUrl(null);
    setError("");
    setExtracting(false);
    setPaletteData(null);
  }, [imageUrl]);

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
    reset,
  };
};