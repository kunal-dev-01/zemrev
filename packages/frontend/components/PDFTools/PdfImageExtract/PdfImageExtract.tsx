import { useCallback } from "react";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdf.tool.config";
import { useExtractImages } from "@/hooks/pdfHooks/useExtractImages.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import GlassButton from "@/components/Layouts/GlassButton";
import { PdfFileItem } from "./PdfFileItem";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PdfImageExtract = () => {
  const config = PDF_TOOL_CONFIGS["pdf-extract-images"];
  const isDark = useDarkMode();

  const {
    files,
    extracting,
    addFiles,
    removeFile,
    addFromGoogleDrive,
    addFromDropbox,
    updateSettings,
    extractAll,
  } = useExtractImages();

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 dark:bg-zinc-900 bg-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 md:text-sm text-xs text-zinc-600 dark:text-zinc-400">
              {files.length} PDF{files.length !== 1 ? "s" : ""} Loaded
            </div>
          </div>

          {/* File List */}
          <div className="space-y-2">
            {files.map((file) => (
              <PdfFileItem
                key={file.id}
                file={file}
                config={config}
                updateSettings={updateSettings}
                removeFile={removeFile}
                isDark={isDark}
              />
            ))}
          </div>

          {/* Extract Button */}
          <GlassButton
            loading={extracting}
            primaryColor={config.primaryColor}
            onClick={extractAll}
          >
            {extracting ? "Extracting Images..." : `Extract Images`}
          </GlassButton>
        </div>
      )}

      {/* Session Files Display */}
      <PdfSessionFilesDisplay toolType="extract-images" config={config} />
    </div>
  );
};

export default PdfImageExtract;
