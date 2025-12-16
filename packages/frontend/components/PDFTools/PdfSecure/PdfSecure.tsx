import { useCallback } from "react";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdfToolConfigs";
import { ErrorSvg } from "@/components/Svg/CommonSvg";
import { usePdfEncrypt } from "@/hooks/pdfHooks/usePdfEncrypt.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import GlassButton from "@/components/Layouts/GlassButton";
import { SecurePdfSvg } from "@/components/Svg/PdfSvg";
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
// Handles individual file display and password settings
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

  const handlePasswordChange = (
    field: "user_password" | "owner_password",
    value: string
  ) => {
    updateFileSettings(file.id, { [field]: value });
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

  const hasPassword = Boolean(file.settings.user_password);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700">
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
            {hasPassword && (
              <div className="text-xs px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                <span className="w-3 h-3 flex items-center justify-center">
                  <SecurePdfSvg />
                </span>{" "}
                Protected
              </div>
            )}
          </div>
        </div>

        {/* Remove Button */}
        <RemoveButton onClick={() => removeFile(file.id)} />
      </div>

      {/* Password Inputs - Below with Border */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 space-y-3">
        {/* User Password */}
        <PasswordField
          label="User Password"
          required
          value={file.settings.user_password || ""}
          placeholder="Enter password to open PDF"
          onChange={(val) => handlePasswordChange("user_password", val)}
        />

        {/* Owner Password (Optional) */}

        <PasswordField
          label="Owner Password"
          value={file.settings.owner_password || ""}
          placeholder="Master password for permissions"
          onChange={(val) => handlePasswordChange("owner_password", val)}
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

const PdfSecure = () => {
  const config = PDF_TOOL_CONFIGS["pdf-encrypt"];
  const isDark = useDarkMode();

  const {
    files,
    encrypting,
    stats,
    addFiles,
    removeFile,
    addFromGoogleDrive,
    addFromDropbox,
    updateFileSettings,
    encryptAllFiles,
  } = usePdfEncrypt();

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

  const canEncrypt = stats.pending > 0 && !encrypting;
  const canAddMore = files.length < config.maxFiles;
  const hasAllPasswords = files.every((f) => f.settings.user_password);

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
          {!hasAllPasswords && (
            <div className="mt-4 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                <ErrorSvg className="w-5 h-5" /> Set a password before encryption
              </p>
            </div>
          )}

          {/* Encrypt Button */}
          {canEncrypt && hasAllPasswords && (
            <GlassButton
              loading={encrypting}
              primaryColor={config.primaryColor}
              onClick={encryptAllFiles}
            >
              {encrypting ? "Encrypting..." : `Secure PDF`}
            </GlassButton>
          )}
        </div>
      )}

      {/* Session Files Display */}
      <PdfSessionFilesDisplay toolType="pdf-encrypt" config={config} />
    </div>
  );
};

export default PdfSecure;
