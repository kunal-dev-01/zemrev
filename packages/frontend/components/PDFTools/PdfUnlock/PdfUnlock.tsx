import { useCallback } from "react";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdf.tool.config";
import { CheckSvg, ErrorSvg } from "@/components/Svg/CommonSvg";
import { usePdfDecrypt } from "@/hooks/pdfHooks/usePdfDecrypt.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import GlassButton from "@/components/Layouts/GlassButton";
import type {
  PdfProcessedFile,
  PdfFileSettings,
  PdfToolConfig,
} from "@/services/pdfService/types";
import {
  FileError,
  FilesStatusSummary,
  RemoveButton,
  ToolIconBadge,
} from "@/components/Shared/FileUI";
import { PasswordField } from "@/components/Layouts/PasswordField";

// ============================================================================
// TYPES
// ============================================================================

interface PdfFileItemProps {
  file: PdfProcessedFile;
  config: PdfToolConfig;
  updateFileSettings: (id: string, settings: PdfFileSettings) => void;
  removeFile: (id: string) => void;
  isDark: boolean;
}

// ============================================================================
// SUB-COMPONENT: PdfFileItem
// Handles individual file display and password input
// ============================================================================

const PdfFileItem = ({
  file,
  config,
  updateFileSettings,
  removeFile,
  isDark,
}: PdfFileItemProps) => {
  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePasswordChange = (value: string) => {
    updateFileSettings(file.id, { password: value });
  };

  // ============================================================================
  // HELPERS
  // ============================================================================

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const hasPassword = Boolean(file.settings.password);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 transition-all duration-200">
      <div className="flex items-center gap-3 mb-3">
        {/* PDF Icon Box */}
        <ToolIconBadge
          primaryColor={config.primaryColor}
          bgColor={config.dropzoneColor}
          bgColorDark={config.dropzoneColorDark}
          isDark={isDark}
        />

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate"
            title={file.name}
          >
            {file.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs px-1 rounded-md bg-zinc-200 dark:bg-zinc-800 inline-block text-zinc-500 dark:text-zinc-400">
              {formatBytes(file.size)}
            </p>
            {hasPassword ? (
              <span className="text-xs px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                <CheckSvg className="w-3 h-3" /> Ready
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-md bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 font-medium flex items-center gap-1">
                <ErrorSvg className="w-3 h-3" /> Enter Password
              </span>
            )}
          </div>
        </div>

        {/* Remove Button */}
        <RemoveButton onClick={() => removeFile(file.id)} />
      </div>

      {/* Password Input */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3">
        <PasswordField
          label="Enter Password to Unlock"
          value={file.settings.password || ""}
          placeholder="Enter the PDF password"
          onChange={handlePasswordChange}
        />
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

const PdfUnlock = () => {
  const config = PDF_TOOL_CONFIGS["pdf-decrypt"];
  const isDark = useDarkMode();

  const {
    files,
    decrypting,
    stats,
    addFiles,
    removeFile,
    addFromGoogleDrive,
    addFromDropbox,
    updateFileSettings,
    decryptAllFiles,
  } = usePdfDecrypt();

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
  const hasAllPasswords = files.every((f) => f.settings.password);

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
          <div className="mb-4">
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
                updateFileSettings={updateFileSettings}
                removeFile={removeFile}
                isDark={isDark}
              />
            ))}
          </div>

          {/* Warning if no passwords */}
          {!hasAllPasswords ? (
            <div className="mt-4 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                <ErrorSvg className="w-5 h-5" /> Enter your password to unlock
              </p>
            </div>
          ) : (
            <GlassButton
              loading={decrypting}
              primaryColor={config.primaryColor}
              onClick={decryptAllFiles}
            >
              {decrypting ? "Unlocking..." : `Unlock PDF`}
            </GlassButton>
          )}
        </div>
      )}

      {/* Session Files Display */}
      <PdfSessionFilesDisplay toolType="pdf-decrypt" config={config} />
    </div>
  );
};

export default PdfUnlock;
