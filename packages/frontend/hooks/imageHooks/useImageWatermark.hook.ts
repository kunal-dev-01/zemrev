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
import { useCloudPicker } from "../appHooks/usePdfCloudPicker.hook";

export const useImageWatermark = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
  const [watermarkPreview, setWatermarkPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [watermarkPendingId, setWatermarkPendingId] = useState<string | null>(
    null
  );

  const [addTextWatermark] = useAddTextWatermarkMutation();
  const [addImageWatermark] = useAddImageWatermarkMutation();
  const { pickFromGoogleDrive, pickFromDropbox } = useCloudPicker();

  // ============================================================================
  // RESTORE PENDING FILES ON MOUNT
  // ============================================================================
  useEffect(() => {
    const restorePending = async () => {
      const pending = await pendingStorage.restore("watermark");

      if (pending.length > 0) {
        const mainFile = pending[0];
        setPendingId(mainFile.id);
        setFile(mainFile.file);
        setImageUrl(URL.createObjectURL(mainFile.file));

        if (pending.length > 1) {
          const wmFile = pending[1];
          setWatermarkPendingId(wmFile.id);
          setWatermarkFile(wmFile.file);
          setWatermarkPreview(URL.createObjectURL(wmFile.file));
        }
      }
    };

    restorePending();
  }, []);

  // ============================================================================
  // SET MAIN FILE
  // ============================================================================
  const setImageFile = useCallback(
    async (newFile: File) => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      if (pendingId) await pendingStorage.delete("watermark", pendingId);

      const id = await pendingStorage.save("watermark", newFile);
      setPendingId(id);

      setFile(newFile);
      setImageUrl(URL.createObjectURL(newFile));
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
        const res = await fetch(url);
        const blob = await res.blob();
        const name = url.split("/").pop() || "url-image.jpg";
        const file = new File([blob], name, { type: blob.type });
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
  // SET WATERMARK FILE
  // ============================================================================
  const setWatermark = useCallback(
    async (logoFile: File) => {
      if (watermarkPreview) URL.revokeObjectURL(watermarkPreview);
      if (watermarkPendingId)
        await pendingStorage.delete("watermark", watermarkPendingId);

      const id = await pendingStorage.save("watermark", logoFile);
      setWatermarkPendingId(id);

      setWatermarkFile(logoFile);
      setWatermarkPreview(URL.createObjectURL(logoFile));
    },
    [watermarkPreview, watermarkPendingId]
  );

  // ============================================================================
  // WATERMARK FROM GOOGLE DRIVE
  // ============================================================================
  const setWatermarkFromGoogleDrive = useCallback(async () => {
    const file = await pickFromGoogleDrive();
    await setWatermark(file);
  }, [pickFromGoogleDrive, setWatermark]);

  // ============================================================================
  // WATERMARK FROM DROPBOX
  // ============================================================================
  const setWatermarkFromDropbox = useCallback(async () => {
    const file = await pickFromDropbox();
    await setWatermark(file);
  }, [pickFromDropbox, setWatermark]);

  // ============================================================================
  // APPLY TEXT WATERMARK
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
        const blob = await addTextWatermark({ file, options }).unwrap();
        const outputName = `watermarked_${file.name}`;

        await sessionStorageUtils.saveFile(blob, outputName, "watermark");

        if (pendingId) await pendingStorage.delete("watermark", pendingId);

        if (imageUrl) URL.revokeObjectURL(imageUrl);
        setFile(null);
        setImageUrl(null);
        setPendingId(null);

        setProcessing(false);
        return { success: true, blob, name: outputName };
      } catch (err) {
        const msg = extractApiErrorMessage(err);
        setError(msg);
        setProcessing(false);
        return { success: false, error: msg };
      }
    },
    [file, pendingId, imageUrl, addTextWatermark]
  );

  // ============================================================================
  // APPLY IMAGE WATERMARK
  // ============================================================================
  const applyImageWatermark = useCallback(
    async (options: {
      scale: number;
      opacity: number;
      position: WatermarkPosition;
    }) => {
      if (!file) return { success: false, error: "No file selected" };
      if (!watermarkFile)
        return { success: false, error: "No watermark file selected" };

      setProcessing(true);
      setError("");

      try {
        const blob = await addImageWatermark({
          file,
          watermark: watermarkFile,
          options,
        }).unwrap();

        const outputName = `watermarked_${file.name}`;
        await sessionStorageUtils.saveFile(blob, outputName, "watermark");

        if (pendingId) await pendingStorage.delete("watermark", pendingId);
        if (watermarkPendingId)
          await pendingStorage.delete("watermark", watermarkPendingId);

        if (imageUrl) URL.revokeObjectURL(imageUrl);
        if (watermarkPreview) URL.revokeObjectURL(watermarkPreview);

        setFile(null);
        setImageUrl(null);
        setWatermarkFile(null);
        setWatermarkPreview(null);
        setPendingId(null);
        setWatermarkPendingId(null);

        setProcessing(false);
        return { success: true, blob, name: outputName };
      } catch (err) {
        const msg = extractApiErrorMessage(err);

        const finalMsg = msg.includes("allows")
          ? msg
          : "Too many requests. Please try again in a few minutes";

        setError(finalMsg);
        setProcessing(false);
        return { success: false, error: finalMsg };
      }
    },
    [
      file,
      watermarkFile,
      pendingId,
      watermarkPendingId,
      imageUrl,
      watermarkPreview,
      addImageWatermark,
    ]
  );

  // ============================================================================
  // DOWNLOAD FROM SESSION
  // ============================================================================
  const downloadFile = useCallback(async (fileId: string) => {
    const meta = sessionStorageUtils.getFile("watermark", fileId);
    if (!meta) return;

    const blob = await sessionStorageUtils.getBlob(fileId);
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = meta.name;
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
    if (watermarkPreview) URL.revokeObjectURL(watermarkPreview);
    if (pendingId) await pendingStorage.delete("watermark", pendingId);
    if (watermarkPendingId)
      await pendingStorage.delete("watermark", watermarkPendingId);

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
    setFromGoogleDrive,
    setFromDropbox,

    setWatermark,
    setWatermarkFromGoogleDrive,
    setWatermarkFromDropbox,

    applyTextWatermark,
    applyImageWatermark,

    downloadFile,
    reset,
  };
};
