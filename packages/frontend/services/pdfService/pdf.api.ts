import { baseApi } from "@/lib/baseApi/base.api";
import type {
  SplitPdfRequest,
  RotatePdfRequest,
  EncryptPdfRequest,
  DecryptPdfRequest,
  PdfToImagesRequest,
  ExtractTextRequest,
  ExtractTextResponse,
  ExtractImagesRequest,
  OptimizePdfRequest,
  CompressPdfRequest,
  OcrPdfRequest,
  ConvertToPdfARequest,
  CropPdfRequest,
  RemovePagesRequest,
} from "./types";

// ============================================================================
// HELPER: BUILD FORM DATA (DO NOT CHANGE LOGIC)
// ============================================================================

type FormDataParams = Record<string, string | number | boolean | undefined>;

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
// HELPER: BLOB RESPONSE
// ============================================================================

const blobResponse = {
  responseHandler: async (r: Response) => {
    if (!r.ok) {
      const text = await r.text();
      try {
        throw JSON.parse(text);
      } catch {
        throw { detail: "Too many requests. Please try again in a few minutes" };
      }
    }
    return r.blob();
  },
};


// ============================================================================
// PDF API
// ============================================================================

export const pdfApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ======================================================================
    // PYPDF
    // ======================================================================

    mergePdf: builder.mutation<Blob, { files: File[] }>({
      query: ({ files }) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        return {
          url: "/pdf/merge",
          method: "POST",
          body: formData,
          ...blobResponse,
        };
      },
    }),

    splitPdf: builder.mutation<Blob, { file: File; options: SplitPdfRequest }>({
      query: ({ file, options }) => ({
        url: "/pdf/split",
        method: "POST",
        body: buildFormData(file, options),
        ...blobResponse,
      }),
    }),

    rotatePdf: builder.mutation<Blob, { file: File; options: RotatePdfRequest }>({
      query: ({ file, options }) => ({
        url: "/pdf/rotate",
        method: "POST",
        body: buildFormData(file, options),
        ...blobResponse,
      }),
    }),

    encryptPdf: builder.mutation<Blob, { file: File; options: EncryptPdfRequest }>({
      query: ({ file, options }) => ({
        url: "/pdf/encrypt",
        method: "POST",
        body: buildFormData(file, options),
        ...blobResponse,
      }),
    }),

    decryptPdf: builder.mutation<Blob, { file: File; options: DecryptPdfRequest }>({
      query: ({ file, options }) => ({
        url: "/pdf/decrypt",
        method: "POST",
        body: buildFormData(file, options),
        ...blobResponse,
      }),
    }),

    // ======================================================================
    // PYMuPDF
    // ======================================================================

    pdfToImages: builder.mutation<Blob, { file: File; options: PdfToImagesRequest }>({
      query: ({ file, options }) => ({
        url: "/pymupdf/pdf-to-images",
        method: "POST",
        body: buildFormData(file, options),
        ...blobResponse,
      }),
    }),

    imagesToPdf: builder.mutation<Blob, { files: File[] }>({
      query: ({ files }) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        return {
          url: "/pymupdf/images-to-pdf",
          method: "POST",
          body: formData,
          ...blobResponse,
        };
      },
    }),

    extractText: builder.mutation<
      ExtractTextResponse,
      { file: File; options: ExtractTextRequest }
    >({
      query: ({ file, options }) => ({
        url: "/pymupdf/extract-text",
        method: "POST",
        body: buildFormData(file, options),
      }),
    }),

    extractImages: builder.mutation<
      Blob,
      { file: File; options: ExtractImagesRequest }
    >({
      query: ({ file, options }) => ({
        url: "/pymupdf/extract-images",
        method: "POST",
        body: buildFormData(file, options),
        ...blobResponse,
      }),
    }),

    optimizePdf: builder.mutation<
      Blob,
      { file: File; options: OptimizePdfRequest }
    >({
      query: ({ file, options }) => ({
        url: "/pymupdf/optimize",
        method: "POST",
        body: buildFormData(file, options),
        ...blobResponse,
      }),
    }),

    signPdf: builder.mutation<Blob, FormData>({
      query: (formData) => ({
        url: "/pymupdf/sign",
        method: "POST",
        body: formData,
        responseHandler: async (response) => {
          if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "PDF signing failed");
          }
          return response.blob();
        },
      }),
    }),

    cropPdf: builder.mutation<Blob, { file: File; options: CropPdfRequest }>({
      query: ({ file, options }) => ({
        url: "/pymupdf/crop",
        method: "POST",
        body: buildFormData(file, options),
        ...blobResponse,
      }),
    }),

    removePagesFromPdf: builder.mutation<
      Blob,
      { file: File; options: RemovePagesRequest }
    >({
      query: ({ file, options }) => ({
        url: "/pymupdf/remove-pages",
        method: "POST",
        body: buildFormData(file, options),
        ...blobResponse,
      }),
    }),

    // ======================================================================
    // GHOSTSCRIPT
    // ======================================================================

    compressPdf: builder.mutation<
      Blob,
      { file: File; options: CompressPdfRequest }
    >({
      query: ({ file, options }) => ({
        url: "/ghostscript/compress",
        method: "POST",
        body: buildFormData(file, options),
        ...blobResponse,
      }),
    }),

    flattenPdf: builder.mutation<Blob, { file: File }>({
      query: ({ file }) => ({
        url: "/ghostscript/flatten",
        method: "POST",
        body: buildFormData(file, {}),
        ...blobResponse,
      }),
    }),

    convertToPdfA: builder.mutation<
      Blob,
      { file: File; options: ConvertToPdfARequest }
    >({
      query: ({ file, options }) => ({
        url: "/ghostscript/convert-pdfa",
        method: "POST",
        body: buildFormData(file, options),
        ...blobResponse,
      }),
    }),

    // ======================================================================
    // OCR
    // ======================================================================

    ocrPdfToSearchable: builder.mutation<
      Blob,
      { file: File; options: OcrPdfRequest }
    >({
      query: ({ file, options }) => ({
        url: "/ocr/pdf-to-searchable",
        method: "POST",
        body: buildFormData(file, options),
        ...blobResponse,
      }),
    }),
  }),
});

// ============================================================================
// EXPORT HOOKS (UNCHANGED)
// ============================================================================

export const {
  useMergePdfMutation,
  useSplitPdfMutation,
  useRotatePdfMutation,
  useEncryptPdfMutation,
  useDecryptPdfMutation,

  usePdfToImagesMutation,
  useImagesToPdfMutation,
  useExtractTextMutation,
  useExtractImagesMutation,
  useOptimizePdfMutation,
  useSignPdfMutation,
  useCropPdfMutation,
  useRemovePagesFromPdfMutation,

  useCompressPdfMutation,
  useFlattenPdfMutation,
  useConvertToPdfAMutation,

  useOcrPdfToSearchableMutation,
} = pdfApi;
