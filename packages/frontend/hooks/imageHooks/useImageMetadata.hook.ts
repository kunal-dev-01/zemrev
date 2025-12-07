// ============================================================================
// FILE: src/hooks/imageHooks/useImageMetadata.hook.ts
// PURPOSE: Image Metadata Extractor Hook
// ============================================================================

import { useState, useCallback } from "react";
import { useExtractMetadataMutation } from "@/services/imageService/image.api";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import type { MetadataResponse } from "@/services/imageService/types";

export const useImageMetadata = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");
  const [metadataData, setMetadataData] = useState<MetadataResponse | null>(null);

  const [extractMetadata] = useExtractMetadataMutation();

  // ============================================================================
  // SET FILE
  // ============================================================================
  const setImageFile = useCallback((newFile: File) => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
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
      const file = new File([blob], filename, { type: blob.type });
      setImageFile(file);
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
        options: {},
      }).unwrap();

      setMetadataData(result);
      setExtracting(false);
      return { success: true, data: result };
    } catch (err) {
      const errorMsg = extractApiErrorMessage(err);
      setError(errorMsg);
      setExtracting(false);
      return { success: false, error: errorMsg };
    }
  }, [file, extractMetadata]);

  // ============================================================================
  // COPY TO CLIPBOARD
  // ============================================================================
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
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
    setMetadataData(null);
  }, [imageUrl]);

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
    reset,
  };
};