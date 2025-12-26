// ============================================================================
// FILE: src/hooks/imageHooks/useImageCropper.hook.ts
// PURPOSE: Production-ready Image Cropper with pending file logic
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import { useCropImageMutation } from "@/services/imageService/image.api";
import { sessionStorageUtils } from "@/utils/sessionStorage.utils";
import { pendingStorage } from "@/utils/pendingStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import { useCloudPicker } from "../appHooks/usePdfCloudPicker.hook";

export const useImageCropper = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [cropping, setCropping] = useState(false);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const [cropImage] = useCropImageMutation();
  const { pickFromGoogleDrive, pickFromDropbox } = useCloudPicker();

  // ============================================================================
  // RESTORE PENDING FILE ON MOUNT
  // ============================================================================
  useEffect(() => {
    const restorePending = async () => {
      const pending = await pendingStorage.restore("cropper");

      if (pending.length > 0) {
        const { file: restoredFile, id } = pending[0]; // only one file
        setPendingId(id);
        setFile(restoredFile);
        const url = URL.createObjectURL(restoredFile);
        setImageUrl(url);
      }
    };

    restorePending();
  }, []);

  // ============================================================================
  // SET FILE (LOCAL / CLOUD / URL ALL COME HERE)
  // ============================================================================
  const setImageFile = useCallback(
    async (newFile: File) => {
      // Clear previous preview + pending
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      if (pendingId) await pendingStorage.delete("cropper", pendingId);

      const id = await pendingStorage.save("cropper", newFile);
      setPendingId(id);

      setFile(newFile);
      const url = URL.createObjectURL(newFile);
      setImageUrl(url);
      setError("");
    },
    [imageUrl, pendingId]
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
        const file = new File([blob], filename, { type: blob.type });

        await setImageFile(file);
      } catch {
        setError("Failed to download image from URL");
      }
    },
    [setImageFile]
  );

  // ============================================================================
  // SET FROM GOOGLE DRIVE
  // ============================================================================
  const setFromGoogleDrive = useCallback(async () => {
    const file = await pickFromGoogleDrive();
    await setImageFile(file);
  }, [pickFromGoogleDrive, setImageFile]);

  // ============================================================================
  // SET FROM DROPBOX
  // ============================================================================
  const setFromDropbox = useCallback(async () => {
    const file = await pickFromDropbox();
    await setImageFile(file);
  }, [pickFromDropbox, setImageFile]);

  // ============================================================================
  // CROP IMAGE (saves to session, deletes from pending)
  // ============================================================================
  const cropImageFile = useCallback(
    async (cropData: {
      x: number;
      y: number;
      width: number;
      height: number;
    }) => {
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

        // Delete pending after success
        if (pendingId) {
          await pendingStorage.delete("cropper", pendingId);
          setPendingId(null);
        }

        // Clear local state
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
    setFromGoogleDrive,
    setFromDropbox,
    cropImageFile,
    downloadFile,
    reset,
  };
};
