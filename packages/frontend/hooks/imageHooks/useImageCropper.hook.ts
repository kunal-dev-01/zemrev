// ============================================================================
// FILE: src/hooks/imageHooks/useImageCropper.hook.ts
// PURPOSE: Production-ready Image Cropper (single file with preview)
// ============================================================================

import { useState, useCallback } from "react";
import { useCropImageMutation } from "@/services/imageService/image.api";
import { sessionStorageUtils } from "@/utils/sessionStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";

export const useImageCropper = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [cropping, setCropping] = useState(false);
  const [error, setError] = useState("");
  const [cropImage] = useCropImageMutation();

  // ============================================================================
  // SET FILE
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
  // CROP IMAGE
  // ============================================================================
  const cropImageFile = useCallback(
    async (cropData: { x: number; y: number; width: number; height: number }) => {
      if (!file) return { success: false, error: "No file selected" };

      setCropping(true);
      setError("");

      try {
        const blob = await cropImage({
          file,
          options: cropData,
        }).unwrap();

        const outputName = `cropped_${file.name}`;

        // Save to session storage
        await sessionStorageUtils.saveFile(blob, outputName, "cropper");

        setCropping(false);
        return { success: true, blob, name: outputName };
      } catch (err) {
        const errorMsg = extractApiErrorMessage(err);
        setError(errorMsg);
        setCropping(false);
        return { success: false, error: errorMsg };
      }
    },
    [file, cropImage]
  );

  // ============================================================================
  // DOWNLOAD FROM SESSION
  // ============================================================================
  const downloadFile = useCallback(async (fileId: string) => {
    const fileMeta = sessionStorageUtils.getFile("cropper", fileId);
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
    setFile(null);
    setImageUrl(null);
    setError("");
    setCropping(false);
  }, [imageUrl]);

  return {
    file,
    imageUrl,
    cropping,
    error,
    setImageFile,
    setFromUrl,
    cropImageFile,
    downloadFile,
    reset,
  };
};