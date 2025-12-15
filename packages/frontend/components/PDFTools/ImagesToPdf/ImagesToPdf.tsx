// ============================================================================
// FILE: src/components/PDFTools/ImagesToPdf/ImagesToPdf.tsx
// PURPOSE: Images to PDF Component - Convert multiple images to single PDF
// ============================================================================

import { useCallback } from "react";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdfToolConfigs";
import { CancelSvg, TrashSvg } from "@/components/Svg/CommonSvg";

import { useImagesToPdf } from "@/hooks/pdfHooks/useImagesToPdf.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import { useFileUtils } from "@/hooks/appHooks/useFileUtils";

import GlassButton from "@/components/Layouts/GlassButton";
import { PDFToImageSVg } from "@/components/Svg/PdfSvg";

import type {
  PdfProcessedFile,
  PdfToolConfig,
} from "@/services/pdfService/types";

// ============================================================================
// TYPES
// ============================================================================

interface ImageFileItemProps {
  file: PdfProcessedFile;
  config: PdfToolConfig;
  removeFile: (id: string) => void;
  isDark: boolean;
  index: number;
}

// ============================================================================
// SUB-COMPONENT: ImageFileItem
// Handles individual image file display
// ============================================================================

const ImageFileItem = ({
  file,
  config,
  removeFile,
  isDark,
  index,
}: ImageFileItemProps) => {
  const { formatBytes } = useFileUtils();

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2 md:p-3 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 relative">
      <div className="flex items-center gap-3">
        {/* Image Icon Box with Order Number */}
        <div
          className="p-2.5 sm:p-3 rounded-lg shrink-0 relative"
          style={{
            backgroundColor: isDark
              ? config.dropzoneColorDark
              : config.dropzoneColor,
          }}
        >
          <div
            style={{ color: config.primaryColor }}
            className="w-5 h-5 sm:w-6 sm:h-6"
          >
            <PDFToImageSVg />
          </div>
          {/* Order Badge */}
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
            style={{ backgroundColor: config.primaryColor }}
          >
            {index + 1}
          </div>
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className="text-sm leading-none font-medium text-zinc-800 dark:text-zinc-200 truncate"
              title={file.name}
            >
              {file.name}
            </h3>
          </div>
          <p className="text-xs px-1 rounded-md bg-zinc-200 dark:bg-zinc-800 inline-block text-zinc-500 dark:text-zinc-400 mt-1">
            {formatBytes(file.size)}
          </p>
        </div>

        {/* Image Type Badge */}
        <div className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center">
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase">
            {file.type.split("/")[1]}
          </span>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => removeFile(file.id)}
          className="px-3 py-1.5 rounded-xl border dark:border-zinc-700 border-zinc-200 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200 cursor-pointer"
          aria-label="Remove file"
        >
          <CancelSvg className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ImagesToPdf = () => {
  const config = PDF_TOOL_CONFIGS["images-to-pdf"];
  const isDark = useDarkMode();
  const { formatBytes } = useFileUtils();

  const {
    files,
    converting,
    addFiles,
    removeFile,
    addFromGoogleDrive,
    addFromDropbox,
    convertFiles,
    clearAll,
  } = useImagesToPdf();

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFilesSelected = useCallback(
    async (newFiles: File[]) => {
      await addFiles(newFiles);
    },
    [addFiles]
  );

  const handleGoogleDrive = useCallback(async () => {
    await addFromGoogleDrive();
  }, [addFromGoogleDrive]);

  const handleDropbox = useCallback(async () => {
    await addFromDropbox();
  }, [addFromDropbox]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const canConvert = files.length > 0 && !converting;
  const canAddMore = files.length < config.maxFiles;
  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="w-full md:mt-[1vw] mt-[1vh]">
      {/* Drag Drop Zone */}
      <PdfDragDropZone
        config={config}
        onFilesSelected={handleFilesSelected}
        onGooglePick={handleGoogleDrive}
        onDropboxPick={handleDropbox}
        currentFileCount={files.length}
        disabled={!canAddMore}
      />

      {/* Pending Files Panel */}
      {files.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3 md:mt-[1vw] mt-[1vh]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 dark:bg-zinc-900 bg-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5">
                <p className="md:text-sm text-xs text-zinc-600 dark:text-zinc-400">
                  {files.length} image{files.length !== 1 ? "s" : ""} •{" "}
                  {formatBytes(totalSize)}
                </p>
              </div>

              {/* Info Badge */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Images will be merged in order shown
                </span>
              </div>
            </div>

            <button
              onClick={clearAll}
              className="px-3 py-1.5 rounded-xl font-medium text-red-600 bg-red-50 dark:bg-red-900/20 flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 cursor-pointer"
            >
              <span className="w-5 h-5">
                <TrashSvg />
              </span>
              <span className="md:block hidden">Clear All</span>
            </button>
          </div>

          {/* File List */}
          <div className="space-y-2">
            {files.map((file, index) => (
              <ImageFileItem
                key={file.id}
                file={file}
                config={config}
                removeFile={removeFile}
                isDark={isDark}
                index={index}
              />
            ))}
          </div>

          {/* Convert Button */}
          {canConvert && (
            <GlassButton
              loading={converting}
              primaryColor={config.primaryColor}
              onClick={convertFiles}
            >
              {converting
                ? "Converting..."
                : `Convert to PDF (${files.length} image${
                    files.length !== 1 ? "s" : ""
                  })`}
            </GlassButton>
          )}
        </div>
      )}

      {/* Session Files Display */}
      <PdfSessionFilesDisplay toolType="images-to-pdf" config={config} />
    </div>
  );
};

export default ImagesToPdf;
