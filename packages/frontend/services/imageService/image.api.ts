// ============================================================================
// FILE: src/services/image-service/image.api.ts
// PURPOSE: RTK Query endpoints for image tools
// COMMIT: feat: add RTK Query endpoints for all image tools
// ============================================================================

import { baseApi } from "@/lib/baseApi/base.api";
import type {
  ConvertRequest,
  CompressRequest,
  ResizeRequest,
  OptimizeRequest,
  CropRequest,
  TextWatermarkRequest,
  ImageWatermarkRequest
} from "./types";

const TOOLS_API_BASE_URL = process.env.NEXT_PUBLIC_TOOLS_API_URL!;

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
        url: `${TOOLS_API_BASE_URL}/convert`,
        method: "POST",
        body: createFormData(data),
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ==================== COMPRESS ====================
    compressImage: builder.mutation<Blob, CompressRequest>({
      query: (data) => ({
        url: `${TOOLS_API_BASE_URL}/compress`,
        method: "POST",
        body: createFormData(data),
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ==================== RESIZE ====================
    resizeImage: builder.mutation<Blob, ResizeRequest>({
      query: (data) => ({
        url: `${TOOLS_API_BASE_URL}/resize`,
        method: "POST",
        body: createFormData(data),
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ==================== OPTIMIZE ====================
    optimizeImage: builder.mutation<Blob, OptimizeRequest>({
      query: (data) => ({
        url: `${TOOLS_API_BASE_URL}/optimize`,
        method: "POST",
        body: createFormData(data),
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ==================== CROP ====================
    cropImage: builder.mutation<Blob, CropRequest>({
      query: (data) => ({
        url: `${TOOLS_API_BASE_URL}/crop`,
        method: "POST",
        body: createFormData(data),
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ==================== WATERMARK TEXT ====================
    addTextWatermark: builder.mutation<Blob, TextWatermarkRequest>({
      query: (data) => ({
        url: `${TOOLS_API_BASE_URL}/watermark/text`,
        method: "POST",
        body: createFormData(data),
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ==================== WATERMARK IMAGE ====================
    addImageWatermark: builder.mutation<Blob, ImageWatermarkRequest>({
      query: (data) => ({
        url: `${TOOLS_API_BASE_URL}/watermark/image`,
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
  useAddImageWatermarkMutation
} = imageApi;