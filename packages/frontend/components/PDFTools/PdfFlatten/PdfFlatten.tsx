import { useCallback } from "react";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdf.tool.config";
import { useFlattenPdf } from "@/hooks/pdfHooks/useFlattenPdf.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import GlassButton from "@/components/Layouts/GlassButton";
import type {
  PdfProcessedFile,
  PdfToolConfig,
} from "@/services/pdfService/types";
import {
  FileError,
  FileInfo,
  FilesStatusSummary,
  RemoveButton,
  ToolIconBadge,
} from "@/components/Shared/FileUI";

// ============================================================================
// TYPES
// ============================================================================

interface PdfFileItemProps {
  file: PdfProcessedFile;
  config: PdfToolConfig;
  removeFile: (id: string) => void;
  isDark: boolean;
}

// ============================================================================
// SUB-COMPONENT: PdfFileItem
// Handles individual file display
// ============================================================================

const PdfFileItem = ({
  file,
  config,
  removeFile,
  isDark,
}: PdfFileItemProps) => {
  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="border border-zinc-200 dark:border-zinc-900 rounded-2xl p-2 md:p-3">
      <div className="flex items-center gap-3">
        {/* PDF Icon Box */}
        <ToolIconBadge
          primaryColor={config.primaryColor}
          bgColor={config.dropzoneColor}
          bgColorDark={config.dropzoneColorDark}
          isDark={isDark}
        />

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <FileInfo name={file.name} size={file.size} />
        </div>

        {/* Status Badge */}
        <div className="px-4 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              {file.status === "pending" && "Ready"}
              {file.status === "processing" && "Processing..."}
              {file.status === "error" && "Failed"}
            </span>
          </div>
        </div>

        {/* Remove Button */}
        <RemoveButton onClick={() => removeFile(file.id)} />
      </div>

      {/* Error Message */}
      {file.status === "error" && file.error && (
        <FileError error={file.error} />
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PdfFlatten = () => {
  const config = PDF_TOOL_CONFIGS["pdf-flatten"];
  const isDark = useDarkMode();

  const {
    files,
    flattening,
    stats,
    addFiles,
    removeFile,
    addFromGoogleDrive,
    addFromDropbox,
    flattenAllFiles,
  } = useFlattenPdf();

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
        <div className="border border-zinc-200 dark:border-zinc-900 rounded-2xl md:p-6 p-3 md:mt-[1vw] mt-[1vh]">
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
              <PdfFileItem
                key={file.id}
                file={file}
                config={config}
                removeFile={removeFile}
                isDark={isDark}
              />
            ))}
          </div>

          {/* Flatten Button */}
          <GlassButton
            loading={flattening}
            primaryColor={config.primaryColor}
            onClick={flattenAllFiles}
          >
            {flattening ? "Flattening..." : `Flatten PDF`}
          </GlassButton>
        </div>
      )}

      {/* Session Files Display */}
      <PdfSessionFilesDisplay toolType="flatten-pdf" config={config} />
    </div>
  );
};

export default PdfFlatten;
