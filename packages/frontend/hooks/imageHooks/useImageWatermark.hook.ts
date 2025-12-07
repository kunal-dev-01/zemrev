// ============================================================================
// FILE: src/hooks/imageHooks/useImageWatermark.hook.ts
// PURPOSE: Production-ready Image Watermark with pending file logic
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import {
  useAddTextWatermarkMutation,
  useAddImageWatermarkMutation,
} from "@/services/imageService/image.api";
import { sessionStorageUtils } from "@/utils/sessionStorage.utils";
import { pendingStorage } from "@/utils/pendingStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import type { WatermarkPosition } from "@/services/imageService/types";

export const useImageWatermark = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
  const [watermarkPreview, setWatermarkPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [watermarkPendingId, setWatermarkPendingId] = useState<string | null>(null);

  const [addTextWatermark] = useAddTextWatermarkMutation();
  const [addImageWatermark] = useAddImageWatermarkMutation();

  // ============================================================================
  // RESTORE PENDING FILES ON MOUNT
  // ============================================================================
  useEffect(() => {
    const restorePending = async () => {
      const pending = await pendingStorage.restore("watermark");
      
      if (pending.length > 0) {
        // Restore main image (first file)
        const mainFile = pending[0];
        setPendingId(mainFile.id);
        setFile(mainFile.file);
        const url = URL.createObjectURL(mainFile.file);
        setImageUrl(url);

        // Restore watermark image if exists (second file)
        if (pending.length > 1) {
          const wmFile = pending[1];
          setWatermarkPendingId(wmFile.id);
          setWatermarkFile(wmFile.file);
          const wmUrl = URL.createObjectURL(wmFile.file);
          setWatermarkPreview(wmUrl);
        }
      }
    };

    restorePending();
  }, []);

  // ============================================================================
  // SET MAIN FILE (with pending save, deletes old pending)
  // ============================================================================
  const setImageFile = useCallback(async (newFile: File) => {
    // Clear previous file from URL and pending storage
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (pendingId) await pendingStorage.delete("watermark", pendingId);
    
    // Save to pending storage
    const id = await pendingStorage.save("watermark", newFile);
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
  // SET WATERMARK FILE (for image mode, with pending save, deletes old pending)
  // ============================================================================
  const setWatermark = useCallback(async (logoFile: File) => {
    // Clear previous watermark from URL and pending storage
    if (watermarkPreview) URL.revokeObjectURL(watermarkPreview);
    if (watermarkPendingId) await pendingStorage.delete("watermark", watermarkPendingId);
    
    // Save to pending storage
    const id = await pendingStorage.save("watermark", logoFile);
    setWatermarkPendingId(id);

    // Set watermark for preview
    setWatermarkFile(logoFile);
    const url = URL.createObjectURL(logoFile);
    setWatermarkPreview(url);
  }, [watermarkPreview, watermarkPendingId]);

  // ============================================================================
  // ADD TEXT WATERMARK (saves to session, deletes from pending)
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

        // Save to session storage (ONLY ONCE)
        await sessionStorageUtils.saveFile(blob, outputName, "watermark");

        // Delete main image from pending storage after successful watermark
        if (pendingId) {
          await pendingStorage.delete("watermark", pendingId);
          setPendingId(null);
        }

        // Clear file from state (completed files only in SessionFilesDisplay)
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        setFile(null);
        setImageUrl(null);

        setProcessing(false);
        return { success: true, blob, name: outputName };
      } catch (err) {
        const errorMsg = extractApiErrorMessage(err);
        setError(errorMsg);
        setProcessing(false);
        return { success: false, error: errorMsg };
      }
    },
    [file, pendingId, imageUrl, addTextWatermark]
  );

  // ============================================================================
  // ADD IMAGE WATERMARK (saves to session, deletes both from pending)
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

        // Save to session storage (ONLY ONCE)
        await sessionStorageUtils.saveFile(blob, outputName, "watermark");

        // Delete both files from pending storage after successful watermark
        if (pendingId) {
          await pendingStorage.delete("watermark", pendingId);
          setPendingId(null);
        }
        if (watermarkPendingId) {
          await pendingStorage.delete("watermark", watermarkPendingId);
          setWatermarkPendingId(null);
        }

        // Clear files from state (completed files only in SessionFilesDisplay)
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        if (watermarkPreview) URL.revokeObjectURL(watermarkPreview);
        setFile(null);
        setImageUrl(null);
        setWatermarkFile(null);
        setWatermarkPreview(null);

        setProcessing(false);
        return { success: true, blob, name: outputName };
      } catch (err) {
        const errorMsg = extractApiErrorMessage(err);
        setError(errorMsg);
        setProcessing(false);
        return { success: false, error: errorMsg };
      }
    },
    [file, watermarkFile, pendingId, watermarkPendingId, imageUrl, watermarkPreview, addImageWatermark]
  );

  // ============================================================================
  // DOWNLOAD FROM SESSION (not from state)
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
  // RESET (clear both pending files, clear state)
  // ============================================================================
  const reset = useCallback(async () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (watermarkPreview) URL.revokeObjectURL(watermarkPreview);
    if (pendingId) await pendingStorage.delete("watermark", pendingId);
    if (watermarkPendingId) await pendingStorage.delete("watermark", watermarkPendingId);
    
    setFile(null);
    setImageUrl(null);
    setWatermarkFile(null);
    setWatermarkPreview(null);
    setError("");
    setProcessing(false);
    setPendingId(null);
    setWatermarkPendingId(null);
  }, [imageUrl, watermarkPreview, pendingId, watermarkPendingId]);

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