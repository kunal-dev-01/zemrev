import { baseApi } from "@/lib/baseApi/base.api";
import type {
  ConvertRequest,
  CompressRequest,
  ResizeRequest,
  OptimizeRequest,
  CropRequest,
  TextWatermarkRequest,
  ImageWatermarkRequest,
  PaletteResponse,
  PaletteRequest,
  MetadataResponse,
} from "./types";

// ============================================================================
// HELPER TYPES
// ============================================================================

type FormDataParams = Record<string, string | number | boolean | undefined>;

// ============================================================================
// HELPER: BUILD FORM DATA (TYPE SAFE, ANY-FREE)
// ============================================================================

const buildFormData = <T extends FormDataParams>(
  file: File | null,
  params?: T
): FormData => {
  const formData = new FormData();

  if (file) formData.append("file", file);

  if (params) {
    (Object.keys(params) as (keyof T)[]).forEach((key) => {
      const value = params[key];
      if (value !== undefined) {
        formData.append(key as string, String(value));
      }
    });
  }

  return formData;
};

// ============================================================================
// HELPER: BLOB RESPONSE (NO LOGIC CHANGE)
// ============================================================================

const blobResponse = {
  responseHandler: (r: Response) => r.blob(),
};

// ============================================================================
// IMAGE API ENDPOINTS
// ============================================================================

export const imageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ======================================================================
    // BASIC IMAGE TOOLS
    // ======================================================================

    convertImage: builder.mutation<
      Blob,
      { file: File; options: ConvertRequest }
    >({
      query: ({ file, options }) => ({
        url: "/image/convert",
        method: "POST",
        body: buildFormData(file, options),
        ...blobResponse,
      }),
    }),

    compressImage: builder.mutation<
      Blob,
      { file: File; options: CompressRequest }
    >({
      query: ({ file, options }) => ({
        url: "/image/compress",
        method: "POST",
        body: buildFormData(file, options),
        ...blobResponse,
      }),
    }),

    resizeImage: builder.mutation<
      Blob,
      { file: File; options: ResizeRequest }
    >({
      query: ({ file, options }) => ({
        url: "/image/resize",
        method: "POST",
        body: buildFormData(file, options),
        ...blobResponse,
      }),
    }),

    optimizeImage: builder.mutation<
      Blob,
      { file: File; options: OptimizeRequest }
    >({
      query: ({ file, options }) => ({
        url: "/image/optimize",
        method: "POST",
        body: buildFormData(file, options),
        ...blobResponse,
      }),
    }),

    cropImage: builder.mutation<
      Blob,
      { file: File; options: CropRequest }
    >({
      query: ({ file, options }) => ({
        url: "/image/crop",
        method: "POST",
        body: buildFormData(file, options),
        ...blobResponse,
      }),
    }),

    // ======================================================================
    // WATERMARK
    // ======================================================================

    addTextWatermark: builder.mutation<
      Blob,
      { file: File; options: TextWatermarkRequest }
    >({
      query: ({ file, options }) => ({
        url: "/image/watermark/text",
        method: "POST",
        body: buildFormData(file, options),
        ...blobResponse,
      }),
    }),

    addImageWatermark: builder.mutation<
      Blob,
      { file: File; watermark: File; options: ImageWatermarkRequest }
    >({
      query: ({ file, watermark, options }) => {
        const formData = buildFormData(file, options);
        formData.append("watermark", watermark);

        return {
          url: "/image/watermark/image",
          method: "POST",
          body: formData,
          ...blobResponse,
        };
      },
    }),

    // ======================================================================
    // ANALYSIS / INFO
    // ======================================================================

    extractPalette: builder.mutation<
      PaletteResponse,
      { file: File; options: PaletteRequest }
    >({
      query: ({ file, options }) => ({
        url: "/image/palette",
        method: "POST",
        body: buildFormData(file, options),
      }),
    }),

    extractMetadata: builder.mutation<
      MetadataResponse,
      { file: File }
    >({
      query: ({ file }) => ({
        url: "/image/metadata",
        method: "POST",
        body: buildFormData(file, {}),
      }),
    }),
  }),
});

// ============================================================================
// EXPORT HOOKS 
// ============================================================================

export const {
  useConvertImageMutation,
  useCompressImageMutation,
  useResizeImageMutation,
  useOptimizeImageMutation,
  useCropImageMutation,
  useAddTextWatermarkMutation,
  useAddImageWatermarkMutation,
  useExtractPaletteMutation,
  useExtractMetadataMutation,
} = imageApi;
