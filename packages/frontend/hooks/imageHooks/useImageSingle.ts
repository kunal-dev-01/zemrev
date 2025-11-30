// ============================================================================
// FILE: src/hooks/imageHooks/useImageSingle.ts
// PURPOSE: Custom hook for single image operations (crop/watermark)
// COMMIT: feat: add single image hook for crop/watermark
// ============================================================================

import { useState, useCallback } from "react";
import {
  useCropImageMutation,
  useAddTextWatermarkMutation,
  useAddImageWatermarkMutation,
} from "@/services/imageService/image.api";
import { downloadSingleImage } from "@/utils/zip.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import type { CropRequest, TextWatermarkRequest, ImageWatermarkRequest } from "@/services/imageService/types";

type SingleToolType = "crop" | "watermark-text" | "watermark-image";

export const useImageSingle = (tool: SingleToolType) => {
  const [image, setImageState] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [cropMutation, { isLoading: isCropping }] = useCropImageMutation();
  const [textWatermarkMutation, { isLoading: isAddingText }] = useAddTextWatermarkMutation();
  const [imageWatermarkMutation, { isLoading: isAddingImage }] = useAddImageWatermarkMutation();

  const isProcessing = isCropping || isAddingText || isAddingImage;

  // ==================== SET IMAGE ====================
  const setImage = useCallback((file: File | null) => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
    }

    if (file) {
      setImageState(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setImageState(null);
      setPreview(null);
    }

    setResult(null);
    setResultUrl(null);
    setError(null);
  }, [preview, resultUrl]);

  // ==================== CROP ====================
  const crop = useCallback(
    async (data: Omit<CropRequest, "file">) => {
      if (!image) return false;

      try {
        setError(null);
        const result = await cropMutation({ ...data, file: image }).unwrap();
        
        const url = URL.createObjectURL(result);
        setResult(result);
        setResultUrl(url);
        
        return true;
      } catch (err) {
        setError(extractApiErrorMessage(err));
        return false;
      }
    },
    [image, cropMutation]
  );

  // ==================== ADD TEXT WATERMARK ====================
  const addTextWatermark = useCallback(
    async (data: Omit<TextWatermarkRequest, "file">) => {
      if (!image) return false;

      try {
        setError(null);
        const result = await textWatermarkMutation({ ...data, file: image }).unwrap();
        
        const url = URL.createObjectURL(result);
        setResult(result);
        setResultUrl(url);
        
        return true;
      } catch (err) {
        setError(extractApiErrorMessage(err));
        return false;
      }
    },
    [image, textWatermarkMutation]
  );

  // ==================== ADD IMAGE WATERMARK ====================
  const addImageWatermark = useCallback(
    async (data: Omit<ImageWatermarkRequest, "file">) => {
      if (!image) return false;

      try:
        setError(null);
        const result = await imageWatermarkMutation({ ...data, file: image }).unwrap();
        
        const url = URL.createObjectURL(result);
        setResult(result);
        setResultUrl(url);
        
        return true;
      } catch (err) {
        setError(extractApiErrorMessage(err));
        return false;
      }
    },
    [image, imageWatermarkMutation]
  );

  // ==================== DOWNLOAD ====================
  const download = useCallback(() => {
    if (result && image) {
      downloadSingleImage(result, image.name);
    }
  }, [result, image]);

  // ==================== CLEAR ====================
  const clear = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    
    setImageState(null);
    setPreview(null);
    setResult(null);
    setResultUrl(null);
    setError(null);
  }, [preview, resultUrl]);

  return {
    image,
    preview,
    result,
    resultUrl,
    error,
    isProcessing,
    setImage,
    crop,
    addTextWatermark,
    addImageWatermark,
    download,
    clear,
  };
};