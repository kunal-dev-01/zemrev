import { useCallback } from "react";
import { PdfToImagesFileItem } from "./PdfToImagesFileItem";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdf.tool.config";
import { usePdfToImages } from "@/hooks/pdfHooks/usePdfToImages.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import GlassButton from "@/components/Layouts/GlassButton";
import { FilesStatusSummary } from "@/components/Shared/FileUI";

const PdfToImages = () => {
  const config = PDF_TOOL_CONFIGS["pdf-to-images"];
  const isDark = useDarkMode();

  const {
    files,
    converting,
    addFiles,
    addFromGoogleDrive,
    addFromDropbox,
    removeFile,
    updateSettings,
    convertAll,
  } = usePdfToImages();

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
        <div className="border border-zinc-200 dark:border-zinc-900 rounded-2xl md:p-6 p-3 md:mt-[1vw] mt-[1vh]">
          {/* Header */}
          <div className="mb-4">
            <FilesStatusSummary
              pending={pendingFiles.length}
              processing={processingFiles.length}
              failed={errorFiles.length}
            />
          </div>

          {/* File List */}
          <div className="space-y-2">
            {files.map((file) => (
              <PdfToImagesFileItem
                key={file.id}
                file={file}
                config={config}
                updateSettings={updateSettings}
                removeFile={removeFile}
                isDark={isDark}
              />
            ))}
          </div>

          {/* Convert Button */}
          <GlassButton
            loading={converting}
            primaryColor={config.primaryColor}
            onClick={convertAll}
          >
            {converting ? "Converting..." : `Convert To Images`}
          </GlassButton>
        </div>
      )}

      {/* Session Files Display */}
      <PdfSessionFilesDisplay toolType="pdf-to-images" config={config} />
    </div>
  );
};

export default PdfToImages;
