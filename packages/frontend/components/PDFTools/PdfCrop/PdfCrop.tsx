import { useCallback } from "react";
import { PdfCropFileItem } from "./PdfCropFileItem";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdf.tool.config";
import { useCropPdf } from "@/hooks/pdfHooks/useCropPdf.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import GlassButton from "@/components/Layouts/GlassButton";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { FilesStatusSummary } from "@/components/Shared/FileUI";

const PdfCrop = () => {
  const config = PDF_TOOL_CONFIGS["pdf-crop"];
  const isDark = useDarkMode();

  const {
    files,
    cropping,
    stats,
    addFiles,
    removeFile,
    addFromGoogleDrive,
    addFromDropbox,
    updateFileSettings,
    cropAllFiles,
  } = useCropPdf();

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

  const canAddMore = files.length < config.maxFiles;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="w-full md:mt-[1vw] mt-[1vh]">
      {/* Drag Drop Zone */}
      {canAddMore && (
        <PdfDragDropZone
          config={config}
          onFilesSelected={handleFilesSelected}
          onGooglePick={handleGoogleDrive}
          onDropboxPick={handleDropbox}
          currentFileCount={files.length}
          disabled={!canAddMore}
        />
      )}

      {/* Pending Files Panel */}
      {files.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3 md:mt-[1vw] mt-[1vh]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <FilesStatusSummary
              pending={stats.pending}
              processing={stats.processing}
              failed={stats.error}
            />
          </div>

          {/* File List */}
          <div className="space-y-2">
            {files.map((file) => (
              <PdfCropFileItem
                key={file.id}
                file={file}
                config={config}
                updateFileSettings={updateFileSettings}
                removeFile={removeFile}
                isDark={isDark}
              />
            ))}
          </div>

          {/* Crop Button */}
            <GlassButton
              loading={cropping}
              primaryColor={config.primaryColor}
              onClick={cropAllFiles}
            >
              {cropping
                ? "Cropping..."
                : `Crop PDF`}
            </GlassButton>
        </div>
      )}

      {/* Session Files Display */}
      <PdfSessionFilesDisplay toolType="crop-pdf" config={config} />
    </div>
  );
};

export default PdfCrop;
