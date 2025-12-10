// ============================================================================
// FILE: src/services/pdfService/pdf.api.ts
// PURPOSE: RTK Query API endpoints for all PDF operations (23 tools)
// ============================================================================

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
  AddWatermarkRequest,
  OptimizePdfRequest,
  CompressPdfRequest,
  OcrPdfRequest,
  ExtractTextOcrRequest,
  ExtractTextOcrResponse,
} from "./types";

// ============================================================================
// HELPER: BUILD FORM DATA
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
// PDF API ENDPOINTS
// ============================================================================

export const pdfApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========================================================================
    // pypdf TOOLS
    // ========================================================================

    // MERGE PDF
    mergePdf: builder.mutation<Blob, { files: File[] }>({
      query: ({ files }) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        return {
          url: "/pdf/merge",
          method: "POST",
          body: formData,
          responseHandler: (r) => r.blob(),
        };
      },
    }),

    // SPLIT PDF
    splitPdf: builder.mutation<Blob, { file: File; options: SplitPdfRequest }>({
      query: ({ file, options }) => ({
        url: "/pdf/split",
        method: "POST",
        body: buildFormData(file, options),
        responseHandler: (r) => r.blob(),
      }),
    }),

    // ROTATE PDF
    rotatePdf: builder.mutation<Blob, { file: File; options: RotatePdfRequest }>({
      query: ({ file, options }) => ({
        url: "/pdf/rotate",
        method: "POST",
        body: buildFormData(file, options),
        responseHandler: (r) => r.blob(),
      }),
    }),

    // ENCRYPT PDF
    encryptPdf: builder.mutation<Blob, { file: File; options: EncryptPdfRequest }>({
      query: ({ file, options }) => ({
        url: "/pdf/encrypt",
        method: "POST",
        body: buildFormData(file, options),
        responseHandler: (r) => r.blob(),
      }),
    }),

    // DECRYPT PDF
    decryptPdf: builder.mutation<Blob, { file: File; options: DecryptPdfRequest }>({
      query: ({ file, options }) => ({
        url: "/pdf/decrypt",
        method: "POST",
        body: buildFormData(file, options),
        responseHandler: (r) => r.blob(),
      }),
    }),

    // ========================================================================
    // PyMuPDF TOOLS
    // ========================================================================

    // PDF TO IMAGES
    pdfToImages: builder.mutation<Blob, { file: File; options: PdfToImagesRequest }>({
      query: ({ file, options }) => ({
        url: "/pymupdf/pdf-to-images",
        method: "POST",
        body: buildFormData(file, options),
        responseHandler: (r) => r.blob(),
      }),
    }),

    // IMAGES TO PDF
    imagesToPdf: builder.mutation<Blob, { files: File[] }>({
      query: ({ files }) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        return {
          url: "/pymupdf/images-to-pdf",
          method: "POST",
          body: formData,
          responseHandler: (r) => r.blob(),
        };
      },
    }),

    // EXTRACT TEXT
    extractText: builder.mutation<ExtractTextResponse, { file: File; options: ExtractTextRequest }>({
      query: ({ file, options }) => ({
        url: "/pymupdf/extract-text",
        method: "POST",
        body: buildFormData(file, options),
      }),
    }),

    // EXTRACT IMAGES
    extractImages: builder.mutation<Blob, { file: File; options: ExtractImagesRequest }>({
      query: ({ file, options }) => ({
        url: "/pymupdf/extract-images",
        method: "POST",
        body: buildFormData(file, options),
        responseHandler: (r) => r.blob(),
      }),
    }),

    // ADD WATERMARK (TEXT)
    addTextWatermark: builder.mutation<Blob, { file: File; options: AddWatermarkRequest }>({
      query: ({ file, options }) => ({
        url: "/pymupdf/add-watermark",
        method: "POST",
        body: buildFormData(file, options),
        responseHandler: (r) => r.blob(),
      }),
    }),

    // ADD WATERMARK (IMAGE)
    addImageWatermark: builder.mutation<
      Blob,
      { file: File; watermark: File; options: AddWatermarkRequest }
    >({
      query: ({ file, watermark, options }) => {
        const formData = buildFormData(file, options);
        formData.append("watermark_image", watermark);

        return {
          url: "/pymupdf/add-watermark",
          method: "POST",
          body: formData,
          responseHandler: (r) => r.blob(),
        };
      },
    }),

    // OPTIMIZE PDF
    optimizePdf: builder.mutation<Blob, { file: File; options: OptimizePdfRequest }>({
      query: ({ file, options }) => ({
        url: "/pymupdf/optimize",
        method: "POST",
        body: buildFormData(file, options),
        responseHandler: (r) => r.blob(),
      }),
    }),

    // ========================================================================
    // GHOSTSCRIPT TOOLS
    // ========================================================================

    // COMPRESS PDF
    compressPdf: builder.mutation<Blob, { file: File; options: CompressPdfRequest }>({
      query: ({ file, options }) => ({
        url: "/ghostscript/compress",
        method: "POST",
        body: buildFormData(file, options),
        responseHandler: (r) => r.blob(),
      }),
    }),

    // FLATTEN PDF
    flattenPdf: builder.mutation<Blob, { file: File }>({
      query: ({ file }) => ({
        url: "/ghostscript/flatten",
        method: "POST",
        body: buildFormData(file, {}),
        responseHandler: (r) => r.blob(),
      }),
    }),

    // ========================================================================
    // LIBREOFFICE TOOLS
    // ========================================================================

    // WORD TO PDF
    wordToPdf: builder.mutation<Blob, { file: File }>({
      query: ({ file }) => ({
        url: "/libreoffice/word-to-pdf",
        method: "POST",
        body: buildFormData(file, {}),
        responseHandler: (r) => r.blob(),
      }),
    }),

    // PDF TO WORD
    pdfToWord: builder.mutation<Blob, { file: File }>({
      query: ({ file }) => ({
        url: "/libreoffice/pdf-to-word",
        method: "POST",
        body: buildFormData(file, {}),
        responseHandler: (r) => r.blob(),
      }),
    }),

    // HTML TO PDF
    htmlToPdf: builder.mutation<Blob, { file: File }>({
      query: ({ file }) => ({
        url: "/libreoffice/html-to-pdf",
        method: "POST",
        body: buildFormData(file, {}),
        responseHandler: (r) => r.blob(),
      }),
    }),

    // EXCEL TO PDF
    excelToPdf: builder.mutation<Blob, { file: File }>({
      query: ({ file }) => ({
        url: "/libreoffice/excel-to-pdf",
        method: "POST",
        body: buildFormData(file, {}),
        responseHandler: (r) => r.blob(),
      }),
    }),

    // POWERPOINT TO PDF
    powerpointToPdf: builder.mutation<Blob, { file: File }>({
      query: ({ file }) => ({
        url: "/libreoffice/powerpoint-to-pdf",
        method: "POST",
        body: buildFormData(file, {}),
        responseHandler: (r) => r.blob(),
      }),
    }),

    // ========================================================================
    // OCR TOOLS
    // ========================================================================

    // OCR: PDF TO SEARCHABLE
    ocrPdfToSearchable: builder.mutation<Blob, { file: File; options: OcrPdfRequest }>({
      query: ({ file, options }) => ({
        url: "/ocr/pdf-to-searchable",
        method: "POST",
        body: buildFormData(file, options),
        responseHandler: (r) => r.blob(),
      }),
    }),

    // OCR: EXTRACT TEXT
    ocrExtractText: builder.mutation<
      ExtractTextOcrResponse,
      { file: File; options: ExtractTextOcrRequest }
    >({
      query: ({ file, options }) => ({
        url: "/ocr/extract-text",
        method: "POST",
        body: buildFormData(file, options),
      }),
    }),
  }),
});

// ============================================================================
// EXPORT HOOKS
// ============================================================================

export const {
  // pypdf
  useMergePdfMutation,
  useSplitPdfMutation,
  useRotatePdfMutation,
  useEncryptPdfMutation,
  useDecryptPdfMutation,

  // PyMuPDF
  usePdfToImagesMutation,
  useImagesToPdfMutation,
  useExtractTextMutation,
  useExtractImagesMutation,
  useAddTextWatermarkMutation,
  useAddImageWatermarkMutation,
  useOptimizePdfMutation,

  // Ghostscript
  useCompressPdfMutation,
  useFlattenPdfMutation,

  // LibreOffice
  useWordToPdfMutation,
  usePdfToWordMutation,
  useHtmlToPdfMutation,
  useExcelToPdfMutation,
  usePowerpointToPdfMutation,

  // OCR
  useOcrPdfToSearchableMutation,
  useOcrExtractTextMutation,
} = pdfApi;