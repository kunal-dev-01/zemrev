// ============================================================================
// FILE: src/components/PDFTools/PdfWatermark/PdfWatermark.tsx
// Main container for watermark tool
// ============================================================================

import { useCallback } from "react";
import { PdfWatermarkFileItem } from "./PdfWatermarkFileItem";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdfToolConfigs";
import { TrashSvg } from "@/components/Svg/CommonSvg";
import { useAddWatermark } from "@/hooks/pdfHooks/useAddWatermark.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import GlassButton from "@/components/Layouts/GlassButton";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const PdfWatermark = () => {
  const config = PDF_TOOL_CONFIGS["pdf-watermark"];
  const isDark = useDarkMode();

  const {
    files,
    processing,
    addFiles,
    addFromGoogleDrive,
    addFromDropbox,
    removeFile,
    updateSettings,
    processAll,
    clearAll,
  } = useAddWatermark();

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

  const pendingFiles = files.filter((f) => f.status === "pending");
  const processingFiles = files.filter((f) => f.status === "processing");
  const errorFiles = files.filter((f) => f.status === "error");

  const canProcess = pendingFiles.length > 0 && !processing;
  const canAddMore = files.length < config.maxFiles ;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="w-full md:mt-[1vw] mt-[1vh]">
      {/* Drag drop zone */}
      <PdfDragDropZone
        config={config}
        onFilesSelected={handleFilesSelected}
        onGooglePick={handleGoogleDrive}
        onDropboxPick={handleDropbox}
        currentFileCount={files.length}
        disabled={!canAddMore}
      />

      {/* Files panel */}
      {files.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3 md:mt-[1vw] mt-[1vh]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 dark:bg-zinc-900 bg-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2">
              <p className="md:text-sm text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {pendingFiles.length > 0 && `${pendingFiles.length} pending`}
                {processingFiles.length > 0 &&
                  ` • ${processingFiles.length} processing`}
                {errorFiles.length > 0 && ` • ${errorFiles.length} failed`}
              </p>
            </div>

            <button
              onClick={clearAll}
              className="px-4 py-2 rounded-xl font-medium text-red-600 bg-red-50 dark:bg-red-900/20 flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 cursor-pointer shadow-sm"
            >
              <span className="w-5 h-5">
                <TrashSvg />
              </span>
              <span className="md:block hidden">Clear All</span>
            </button>
          </div>

          {/* File list */}
          <div className="space-y-4">
            {files.map((file) => (
              <PdfWatermarkFileItem
                key={file.id}
                file={file}
                config={config}
                updateSettings={updateSettings}
                removeFile={removeFile}
                isDark={isDark}
              />
            ))}
          </div>

          {/* Process button */}
          {canProcess && (
            <div className="mt-6">
              <GlassButton
                loading={processing}
                primaryColor={config.primaryColor}
                onClick={processAll}
              >
                {processing
                  ? "Adding Watermarks..."
                  : `💧 Add Watermark to ${pendingFiles.length} File${
                      pendingFiles.length !== 1 ? "s" : ""
                    }`}
              </GlassButton>
            </div>
          )}
        </div>
      )}

      {/* Session files display */}
      <PdfSessionFilesDisplay toolType="add-watermark" config={config} />
    </div>
  );
};

export default PdfWatermark;