// ============================================================================
// FILE: src/hooks/imageHooks/useImageConvert.ts
// PURPOSE: Custom hook for image convert logic
// COMMIT: feat: add custom hook for convert with parallel processing
// ============================================================================

import { useCallback } from "react";
import { useImageStore } from "@/stores/imageStore";
import { useConvertImageMutation } from "@/services/imageService/image.api";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import { downloadBlob, createZip } from "@/utils/download.utils";
import { OutputFormat, ImageStatus } from "@/services/imageService/types";
import { MAX_IMAGES, MAX_FILE_SIZE, ACCEPTED_FORMATS } from "@/services/imageService/types";

export const useImageConvert = () => {
  const {
    images,
    isProcessing,
    completedCount,
    failedCount,
    addImages: addToStore,
    removeImage: removeFromStore,
    updateStatus,
    setResult,
    setError,
    setProcessing,
    clearAll: clearStore,
  } = useImageStore();

  const [convertMutation] = useConvertImageMutation();

  const canAddMore = images.length < MAX_IMAGES;

  // ==================== ADD IMAGES ====================
  const addImages = useCallback(
    (files: File[]) => {
      const validFiles = files.filter((file) => {
        if (file.size > MAX_FILE_SIZE) {
          console.error(`${file.name}: File too large (max 50MB)`);
          return false;
        }
        if (!ACCEPTED_FORMATS.includes(file.type)) {
          console.error(`${file.name}: Invalid format`);
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        addToStore(validFiles);
      }
    },
    [addToStore]
  );

  // ==================== REMOVE IMAGE ====================
  const removeImage = useCallback(
    (id: string) => {
      removeFromStore(id);
    },
    [removeFromStore]
  );

  // ==================== PROCESS SINGLE IMAGE ====================
  const processImage = useCallback(
    async (id: string, format: OutputFormat, quality: number) => {
      const image = images.find((img) => img.id === id);
      if (!image) return;

      try {
        updateStatus(id, ImageStatus.PROCESSING, 10);

        const result = await convertMutation({
          file: image.file,
          format,
          quality,
        }).unwrap();

        const resultUrl = URL.createObjectURL(result);
        setResult(id, result, resultUrl);
      } catch (error) {
        const errorMsg = extractApiErrorMessage(error);
        setError(id, errorMsg);
      }
    },
    [images, convertMutation, updateStatus, setResult, setError]
  );

  // ==================== PROCESS ALL (PARALLEL) ====================
  const convertAll = useCallback(
    async (format: OutputFormat, quality: number) => {
      if (images.length === 0 || isProcessing) return;

      setProcessing(true);

      // Parallel processing - sabhi images ek sath process hongi
      await Promise.allSettled(
        images.map((img) => processImage(img.id, format, quality))
      );

      setProcessing(false);
    },
    [images, isProcessing, setProcessing, processImage]
  );

  // ==================== DOWNLOAD SINGLE ====================
  const downloadSingle = useCallback(
    (id: string) => {
      const image = images.find((img) => img.id === id);
      if (image?.result) {
        downloadBlob(image.result, image.name);
      }
    },
    [images]
  );

  // ==================== DOWNLOAD ALL (ZIP) ====================
  const downloadAll = useCallback(async () => {
    const completed = images.filter((img) => img.status === ImageStatus.COMPLETED && img.result);
    
    if (completed.length === 0) return;

    try {
      await createZip(completed, "converted_images.zip");
    } catch (error) {
      console.error("Failed to create ZIP:", error);
    }
  }, [images]);

  // ==================== CLEAR ALL ====================
  const clearAll = useCallback(() => {
    clearStore();
  }, [clearStore]);

  return {
    // State
    images,
    isProcessing,
    completedCount,
    failedCount,
    canAddMore,
    
    // Actions
    addImages,
    removeImage,
    convertAll,
    downloadSingle,
    downloadAll,
    clearAll,
  };
};