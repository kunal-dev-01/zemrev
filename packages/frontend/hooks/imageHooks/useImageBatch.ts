// ============================================================================
// FILE: src/hooks/imageHooks/useImageBatch.ts
// PURPOSE: Custom hook for batch image operations
// COMMIT: feat: add batch hook for convert/compress/resize/optimize
// ============================================================================

import { useCallback, useEffect } from "react";
import { useImageBatchStore } from "@/stores/imageBatchStore";
import {
  useConvertImageMutation,
  useCompressImageMutation,
  useResizeImageMutation,
  useOptimizeImageMutation,
} from "@/services/imageService/image.api";
import { createZipFromImages, downloadSingleImage } from "@/utils/zip.utils";
import { IMAGE_CONSTANTS } from "@/services/imageService/constants";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import type { ToolName, BatchSettings } from "@/services/imageService/types";

export const useImageBatch = (tool: ToolName) => {
  const state = useImageBatchStore((s) => s[tool]);
  const {
    addImages: addImagesToStore,
    removeImage: removeImageFromStore,
    updateImageStatus,
    setImageResult,
    setImageError,
    setProcessing,
    clearTool,
  } = useImageBatchStore();

  const [convertMutation] = useConvertImageMutation();
  const [compressMutation] = useCompressImageMutation();
  const [resizeMutation] = useResizeImageMutation();
  const [optimizeMutation] = useOptimizeImageMutation();

  const canAddMore = state.images.length < IMAGE_CONSTANTS.MAX_BATCH_SIZE;

  // ==================== ADD IMAGES ====================
  const addImages = useCallback(
    (files: File[]) => {
      const validFiles = files.filter((file) => {
        if (file.size > IMAGE_CONSTANTS.MAX_FILE_SIZE) {
          console.error(`File ${file.name} exceeds size limit`);
          return false;
        }
        if (!IMAGE_CONSTANTS.ACCEPTED_FORMATS.includes(file.type)) {
          console.error(`File ${file.name} has invalid format`);
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        addImagesToStore(tool, validFiles);
      }
    },
    [tool, addImagesToStore]
  );

  // ==================== REMOVE IMAGE ====================
  const removeImage = useCallback(
    (id: string) => {
      removeImageFromStore(tool, id);
    },
    [tool, removeImageFromStore]
  );

  // ==================== PROCESS SINGLE IMAGE ====================
  const processSingleImage = useCallback(
    async (imageId: string, settings: BatchSettings) => {
      const image = state.images.find((img) => img.id === imageId);
      if (!image) return;

      try {
        updateImageStatus(tool, imageId, "processing", 10);

        let result: Blob;

        if (tool === "convert" && settings.convert) {
          result = await convertMutation({
            file: image.file,
            format: settings.convert.format,
            quality: settings.convert.quality,
          }).unwrap();
        } else if (tool === "compress" && settings.compress) {
          result = await compressMutation({
            file: image.file,
            quality: settings.compress.quality,
            format: settings.compress.format,
          }).unwrap();
        } else if (tool === "resize" && settings.resize) {
          result = await resizeMutation({
            file: image.file,
            width: settings.resize.width,
            height: settings.resize.height,
            mode: settings.resize.mode,
            format: settings.resize.format,
          }).unwrap();
        } else if (tool === "optimize" && settings.optimize) {
          result = await optimizeMutation({
            file: image.file,
            strip_exif: settings.optimize.strip_exif,
            strip_gps: settings.optimize.strip_gps,
            fix_orientation: settings.optimize.fix_orientation,
          }).unwrap();
        } else {
          throw new Error("Invalid tool or settings");
        }

        const resultUrl = URL.createObjectURL(result);
        setImageResult(tool, imageId, result, resultUrl);
      } catch (error) {
        const errorMsg = extractApiErrorMessage(error);
        setImageError(tool, imageId, errorMsg);
      }
    },
    [
      tool,
      state.images,
      updateImageStatus,
      setImageResult,
      setImageError,
      convertMutation,
      compressMutation,
      resizeMutation,
      optimizeMutation,
    ]
  );

  // ==================== PROCESS ALL ====================
  const processAll = useCallback(
    async (settings: BatchSettings) => {
      if (state.images.length === 0 || state.isProcessing) return;

      setProcessing(tool, true);

      await Promise.allSettled(
        state.images.map((img) => processSingleImage(img.id, settings))
      );

      setProcessing(tool, false);
    },
    [tool, state.images, state.isProcessing, setProcessing, processSingleImage]
  );

  // ==================== DOWNLOAD SINGLE ====================
  const downloadSingle = useCallback((imageId: string) => {
    const image = state.images.find((img) => img.id === imageId);
    if (image && image.result) {
      downloadSingleImage(image.result, image.name);
    }
  }, [state.images]);

  // ==================== DOWNLOAD ALL ====================
  const downloadAll = useCallback(async () => {
    try {
      const timestamp = new Date().toISOString().split("T")[0];
      await createZipFromImages(state.images, `${tool}_${timestamp}.zip`);
    } catch (error) {
      console.error("Failed to create ZIP:", error);
    }
  }, [tool, state.images]);

  // ==================== CLEAR ALL ====================
  const clearAll = useCallback(() => {
    clearTool(tool);
  }, [tool, clearTool]);

  // ==================== CLEANUP ON UNMOUNT ====================
  useEffect(() => {
    return () => {
      state.images.forEach((img) => {
        URL.revokeObjectURL(img.preview);
        if (img.resultUrl) {
          URL.revokeObjectURL(img.resultUrl);
        }
      });
    };
  }, []);

  return {
    images: state.images,
    isProcessing: state.isProcessing,
    completedCount: state.completedCount,
    failedCount: state.failedCount,
    canAddMore,
    addImages,
    removeImage,
    processAll,
    downloadSingle,
    downloadAll,
    clearAll,
  };
};