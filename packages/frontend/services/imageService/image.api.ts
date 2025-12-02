// ============================================================================
// FILE: src/services/image.service.ts
// PURPOSE: RTK Query API endpoints for all image operations
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

// ============================================================================
// HELPER: BUILD FORM DATA
// ============================================================================

const buildFormData = (
  file: File | null,
  params: Record<string, any>
): FormData => {
  const formData = new FormData();

  if (file) {
    formData.append("file", file);
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  return formData;
};

// ============================================================================
// IMAGE API ENDPOINTS
// ============================================================================

export const imageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========================================================================
    // CONVERT
    // ========================================================================
    convertImage: builder.mutation<Blob, { file: File; options: ConvertRequest }>({
      query: ({ file, options }) => ({
        url: "/convert",
        method: "POST",
        body: buildFormData(file, options),
        responseHandler: async (response) => await response.blob(),
      }),
    }),

    convertImageFromUrl: builder.mutation<Blob, ConvertRequest>({
      query: (options) => ({
        url: "/convert",
        method: "POST",
        body: buildFormData(null, options),
        responseHandler: async (response) => await response.blob(),
      }),
    }),

    // ========================================================================
    // COMPRESS
    // ========================================================================
    compressImage: builder.mutation<Blob, { file: File; options: CompressRequest }>({
      query: ({ file, options }) => ({
        url: "/compress",
        method: "POST",
        body: buildFormData(file, options),
        responseHandler: async (response) => await response.blob(),
      }),
    }),

    compressImageFromUrl: builder.mutation<Blob, CompressRequest>({
      query: (options) => ({
        url: "/compress",
        method: "POST",
        body: buildFormData(null, options),
        responseHandler: async (response) => await response.blob(),
      }),
    }),

    // ========================================================================
    // RESIZE
    // ========================================================================
    resizeImage: builder.mutation<Blob, { file: File; options: ResizeRequest }>({
      query: ({ file, options }) => ({
        url: "/resize",
        method: "POST",
        body: buildFormData(file, options),
        responseHandler: async (response) => await response.blob(),
      }),
    }),

    resizeImageFromUrl: builder.mutation<Blob, ResizeRequest>({
      query: (options) => ({
        url: "/resize",
        method: "POST",
        body: buildFormData(null, options),
        responseHandler: async (response) => await response.blob(),
      }),
    }),

    // ========================================================================
    // OPTIMIZE
    // ========================================================================
    optimizeImage: builder.mutation<Blob, { file: File; options: OptimizeRequest }>({
      query: ({ file, options }) => ({
        url: "/optimize",
        method: "POST",
        body: buildFormData(file, options),
        responseHandler: async (response) => await response.blob(),
      }),
    }),

    optimizeImageFromUrl: builder.mutation<Blob, OptimizeRequest>({
      query: (options) => ({
        url: "/optimize",
        method: "POST",
        body: buildFormData(null, options),
        responseHandler: async (response) => await response.blob(),
      }),
    }),

    // ========================================================================
    // CROP
    // ========================================================================
    cropImage: builder.mutation<Blob, { file: File; options: CropRequest }>({
      query: ({ file, options }) => ({
        url: "/crop",
        method: "POST",
        body: buildFormData(file, options),
        responseHandler: async (response) => await response.blob(),
      }),
    }),

    cropImageFromUrl: builder.mutation<Blob, CropRequest>({
      query: (options) => ({
        url: "/crop",
        method: "POST",
        body: buildFormData(null, options),
        responseHandler: async (response) => await response.blob(),
      }),
    }),

    // ========================================================================
    // WATERMARK TEXT
    // ========================================================================
    addTextWatermark: builder.mutation<Blob, { file: File; options: TextWatermarkRequest }>({
      query: ({ file, options }) => ({
        url: "/watermark/text",
        method: "POST",
        body: buildFormData(file, options),
        responseHandler: async (response) => await response.blob(),
      }),
    }),

    addTextWatermarkFromUrl: builder.mutation<Blob, TextWatermarkRequest>({
      query: (options) => ({
        url: "/watermark/text",
        method: "POST",
        body: buildFormData(null, options),
        responseHandler: async (response) => await response.blob(),
      }),
    }),

    // ========================================================================
    // WATERMARK IMAGE
    // ========================================================================
    addImageWatermark: builder.mutation<
      Blob,
      { file: File; watermark: File; options: ImageWatermarkRequest }
    >({
      query: ({ file, watermark, options }) => {
        const formData = buildFormData(file, options);
        formData.append("watermark", watermark);
        return {
          url: "/watermark/image",
          method: "POST",
          body: formData,
          responseHandler: async (response) => await response.blob(),
        };
      },
    }),

    addImageWatermarkFromUrl: builder.mutation<
      Blob,
      { watermark: File; options: ImageWatermarkRequest }
    >({
      query: ({ watermark, options }) => {
        const formData = buildFormData(null, options);
        formData.append("watermark", watermark);
        return {
          url: "/watermark/image",
          method: "POST",
          body: formData,
          responseHandler: async (response) => await response.blob(),
        };
      },
    }),
  }),
});

// ============================================================================
// EXPORT HOOKS
// ============================================================================

export const {
  useConvertImageMutation,
  useConvertImageFromUrlMutation,
  useCompressImageMutation,
  useCompressImageFromUrlMutation,
  useResizeImageMutation,
  useResizeImageFromUrlMutation,
  useOptimizeImageMutation,
  useOptimizeImageFromUrlMutation,
  useCropImageMutation,
  useCropImageFromUrlMutation,
  useAddTextWatermarkMutation,
  useAddTextWatermarkFromUrlMutation,
  useAddImageWatermarkMutation,
  useAddImageWatermarkFromUrlMutation,
} = imageApi;