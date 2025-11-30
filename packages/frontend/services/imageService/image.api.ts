// ============================================================================
// FILE: src/services/imageService/image.api.ts
// PURPOSE: RTK Query endpoints for image operations
// COMMIT: feat: add RTK Query endpoints for image tools
// ============================================================================

import { baseApi } from "@/lib/baseApi/base.api";
import type {
  ConvertRequest,
  CompressRequest,
  ResizeRequest,
  OptimizeRequest,
  CropRequest,
  TextWatermarkRequest,
  ImageWatermarkRequest,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_TOOLS_API_URL || "http://localhost:8000/api/v1";

const createFormData = (data: Record<string, unknown>): FormData => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  });
  
  return formData;
};

export const imageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    // ==================== CONVERT ====================
    convertImage: builder.mutation<Blob, ConvertRequest>({
      query: (data) => ({
        url: `${API_URL}/convert`,
        method: "POST",
        body: createFormData(data),
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ==================== COMPRESS ====================
    compressImage: builder.mutation<Blob, CompressRequest>({
      query: (data) => ({
        url: `${API_URL}/compress`,
        method: "POST",
        body: createFormData(data),
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ==================== RESIZE ====================
    resizeImage: builder.mutation<Blob, ResizeRequest>({
      query: (data) => ({
        url: `${API_URL}/resize`,
        method: "POST",
        body: createFormData(data),
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ==================== OPTIMIZE ====================
    optimizeImage: builder.mutation<Blob, OptimizeRequest>({
      query: (data) => ({
        url: `${API_URL}/optimize`,
        method: "POST",
        body: createFormData(data),
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ==================== CROP ====================
    cropImage: builder.mutation<Blob, CropRequest>({
      query: (data) => ({
        url: `${API_URL}/crop`,
        method: "POST",
        body: createFormData(data),
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ==================== WATERMARK TEXT ====================
    addTextWatermark: builder.mutation<Blob, TextWatermarkRequest>({
      query: (data) => ({
        url: `${API_URL}/watermark/text`,
        method: "POST",
        body: createFormData(data),
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ==================== WATERMARK IMAGE ====================
    addImageWatermark: builder.mutation<Blob, ImageWatermarkRequest>({
      query: (data) => ({
        url: `${API_URL}/watermark/image`,
        method: "POST",
        body: createFormData(data),
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
  
  overrideExisting: false,
});

export const {
  useConvertImageMutation,
  useCompressImageMutation,
  useResizeImageMutation,
  useOptimizeImageMutation,
  useCropImageMutation,
  useAddTextWatermarkMutation,
  useAddImageWatermarkMutation,
} = imageApi;