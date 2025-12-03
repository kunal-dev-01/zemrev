// ============================================================================
// FILE: src/hooks/imageHooks/useImageWatermark.hook.ts
// PURPOSE: Production-ready Image Watermark (text + image modes)
// ============================================================================

import { useState, useCallback } from "react";
import {
  useAddTextWatermarkMutation,
  useAddImageWatermarkMutation,
} from "@/services/imageService/image.api";
import { sessionStorageUtils } from "@/utils/sessionStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import type { WatermarkPosition } from "@/services/imageService/types";

export const useImageWatermark = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
  const [watermarkPreview, setWatermarkPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const [addTextWatermark] = useAddTextWatermarkMutation();
  const [addImageWatermark] = useAddImageWatermarkMutation();

  // ============================================================================
  // SET MAIN FILE
  // ============================================================================
  const setImageFile = useCallback((newFile: File) => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    
    setFile(newFile);
    const url = URL.createObjectURL(newFile);
    setImageUrl(url);
    setError("");
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
  // SET WATERMARK FILE (for image mode)
  // ============================================================================
  const setWatermark = useCallback((logoFile: File) => {
    if (watermarkPreview) URL.revokeObjectURL(watermarkPreview);
    
    setWatermarkFile(logoFile);
    const url = URL.createObjectURL(logoFile);
    setWatermarkPreview(url);
  }, [watermarkPreview]);

  // ============================================================================
  // ADD TEXT WATERMARK
  // ============================================================================
  const applyTextWatermark = useCallback(
    async (options: {
      text: string;
      fontSize: number;
      color: string;
      opacity: number;
      position: WatermarkPosition;
    }) => {
      if (!file) return { success: false, error: "No file selected" };

      setProcessing(true);
      setError("");

      try {
        const blob = await addTextWatermark({
          file,
          options,
        }).unwrap();

        const outputName = `watermarked_${file.name}`;

        // Save to session storage
        await sessionStorageUtils.saveFile(blob, outputName, "watermark");

        setProcessing(false);
        return { success: true, blob, name: outputName };
      } catch (err) {
        const errorMsg = extractApiErrorMessage(err);
        setError(errorMsg);
        setProcessing(false);
        return { success: false, error: errorMsg };
      }
    },
    [file, addTextWatermark]
  );

  // ============================================================================
  // ADD IMAGE WATERMARK
  // ============================================================================
  const applyImageWatermark = useCallback(
    async (options: {
      scale: number;
      opacity: number;
      position: WatermarkPosition;
    }) => {
      if (!file) return { success: false, error: "No file selected" };
      if (!watermarkFile) return { success: false, error: "No watermark file selected" };

      setProcessing(true);
      setError("");

      try {
        const blob = await addImageWatermark({
          file,
          watermark: watermarkFile,
          options,
        }).unwrap();

        const outputName = `watermarked_${file.name}`;

        // Save to session storage
        await sessionStorageUtils.saveFile(blob, outputName, "watermark");

        setProcessing(false);
        return { success: true, blob, name: outputName };
      } catch (err) {
        const errorMsg = extractApiErrorMessage(err);
        setError(errorMsg);
        setProcessing(false);
        return { success: false, error: errorMsg };
      }
    },
    [file, watermarkFile, addImageWatermark]
  );

  // ============================================================================
  // DOWNLOAD FROM SESSION
  // ============================================================================
  const downloadFile = useCallback(async (fileId: string) => {
    const fileMeta = sessionStorageUtils.getFile("watermark", fileId);
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
  // RESET
  // ============================================================================
  const reset = useCallback(() => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (watermarkPreview) URL.revokeObjectURL(watermarkPreview);
    
    setFile(null);
    setImageUrl(null);
    setWatermarkFile(null);
    setWatermarkPreview(null);
    setError("");
    setProcessing(false);
  }, [imageUrl, watermarkPreview]);

  return {
    file,
    imageUrl,
    watermarkFile,
    watermarkPreview,
    processing,
    error,
    setImageFile,
    setFromUrl,
    setWatermark,
    applyTextWatermark,
    applyImageWatermark,
    downloadFile,
    reset,
  };
};