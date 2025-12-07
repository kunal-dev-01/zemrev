// ============================================================================
// FILE: src/hooks/imageHooks/useImageCropper.hook.ts
// PURPOSE: Production-ready Image Cropper with pending file logic
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import { useCropImageMutation } from "@/services/imageService/image.api";
import { sessionStorageUtils } from "@/utils/sessionStorage.utils";
import { pendingStorage } from "@/utils/pendingStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";

export const useImageCropper = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [cropping, setCropping] = useState(false);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [cropImage] = useCropImageMutation();

  // ============================================================================
  // RESTORE PENDING FILE ON MOUNT
  // ============================================================================
  useEffect(() => {
    const restorePending = async () => {
      const pending = await pendingStorage.restore("cropper");
      
      if (pending.length > 0) {
        const { file: restoredFile, id } = pending[0]; // Only take first file for cropper
        setPendingId(id);
        setFile(restoredFile);
        const url = URL.createObjectURL(restoredFile);
        setImageUrl(url);
      }
    };

    restorePending();
  }, []);

  // ============================================================================
  // SET FILE (with pending save, deletes old pending)
  // ============================================================================
  const setImageFile = useCallback(async (newFile: File) => {
    // Clear previous file from URL and pending storage
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (pendingId) await pendingStorage.delete("cropper", pendingId);
    
    // Save to pending storage
    const id = await pendingStorage.save("cropper", newFile);
    setPendingId(id);

    // Set file for preview
    setFile(newFile);
    const url = URL.createObjectURL(newFile);
    setImageUrl(url);
    setError("");
  }, [imageUrl, pendingId]);

  // ============================================================================
  // SET FROM URL
  // ============================================================================
  const setFromUrl = useCallback(async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const filename = url.split("/").pop() || "url-image.jpg";
      const file = new File([blob], filename, { type: blob.type });
      
      await setImageFile(file);
    } catch (err) {
      setError("Failed to download image from URL");
    }
  }, [setImageFile]);

  // ============================================================================
  // CROP IMAGE (saves to session, deletes from pending)
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

        // Save to session storage (ONLY ONCE)
        await sessionStorageUtils.saveFile(blob, outputName, "cropper");

        // Delete from pending storage after successful crop
        if (pendingId) {
          await pendingStorage.delete("cropper", pendingId);
          setPendingId(null);
        }

        // Clear file from state (completed files only in SessionFilesDisplay)
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        setFile(null);
        setImageUrl(null);

        setCropping(false);
        return { success: true, blob, name: outputName };
      } catch (err) {
        const errorMsg = extractApiErrorMessage(err);
        setError(errorMsg);
        setCropping(false);
        return { success: false, error: errorMsg };
      }
    },
    [file, pendingId, imageUrl, cropImage]
  );

  // ============================================================================
  // DOWNLOAD FROM SESSION (not from state)
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
  // RESET (clear pending, clear state)
  // ============================================================================
  const reset = useCallback(async () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (pendingId) await pendingStorage.delete("cropper", pendingId);
    
    setFile(null);
    setImageUrl(null);
    setError("");
    setCropping(false);
    setPendingId(null);
  }, [imageUrl, pendingId]);

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