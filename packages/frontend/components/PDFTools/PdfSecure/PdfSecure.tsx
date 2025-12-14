// ============================================================================
// FILE: src/components/PDFTools/PdfSecure/PdfSecure.tsx
// PURPOSE: PDF Secure Component - Add password protection to PDFs
// ============================================================================

import { useCallback, useState } from "react";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdfToolConfigs";
import { CancelSvg, ErrorSvg, TrashSvg } from "@/components/Svg/CommonSvg";
import { usePdfEncrypt } from "@/hooks/pdfHooks/usePdfEncrypt.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import GlassButton from "@/components/Layouts/GlassButton";
import { PDFToImageSVg, SecurePdfSvg } from "@/components/Svg/PdfSvg";
import type {
  PdfProcessedFile,
  PdfFileSettings,
  PdfToolConfig,
} from "@/services/pdfService/types";
import { EyeCloseSvg, EyeSvg } from "@/components/Svg/ToolsSvg";

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
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);

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

  const truncateFileName = (name: string, maxLength: number = 30): string => {
    if (name.length <= maxLength) return name;
    const ext = name.split(".").pop() || "";
    const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
    const truncated = nameWithoutExt.substring(0, maxLength - ext.length - 4);
    return `${truncated}...${ext}`;
  };

  const hasPassword = Boolean(file.settings.user_password);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700">
      <div className="flex items-center gap-3 mb-3">
        {/* PDF Icon Box */}
        <div
          className="p-3 rounded-lg shrink-0"
          style={{
            backgroundColor: isDark
              ? config.dropzoneColorDark
              : config.dropzoneColor,
          }}
        >
          <div style={{ color: config.primaryColor }} className="w-6 h-6">
            <PDFToImageSVg />
          </div>
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate"
            title={file.name}
          >
            {truncateFileName(file.name)}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs px-1 rounded-md bg-zinc-200 dark:bg-zinc-800 inline-block text-zinc-500 dark:text-zinc-400">
              {formatBytes(file.size)}
            </p>
            {hasPassword && (
              <div className="text-xs px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                <span className="w-3 h-3 flex items-center justify-center"><SecurePdfSvg /></span> Protected
              </div>
            )}
          </div>
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

      {/* Password Inputs - Below with Border */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 space-y-3">
        {/* User Password */}
        <div>
          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 block">
            User Password (Required)
          </label>
          <div className="relative">
            <input
              type={showUserPassword ? "text" : "password"}
              value={file.settings.user_password || ""}
              onChange={(e) =>
                handlePasswordChange("user_password", e.target.value)
              }
              placeholder="Enter password to open PDF"
              className="w-full px-3 py-2 pr-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-sm outline-none"
            />
            <button
              type="button"
              onClick={() => setShowUserPassword(!showUserPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition cursor-pointer"
            >
              {showUserPassword ? (
                <EyeSvg />
              ) : (
                <EyeCloseSvg />
              )}
            </button>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Users must enter this password to open the PDF
          </p>
        </div>

        {/* Owner Password (Optional) */}
        <div>
          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 block">
            Owner Password (Optional)
          </label>
          <div className="relative">
            <input
              type={showOwnerPassword ? "text" : "password"}
              value={file.settings.owner_password || ""}
              onChange={(e) =>
                handlePasswordChange("owner_password", e.target.value)
              }
              placeholder="Master password for permissions"
              className="w-full px-3 py-2 pr-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-sm outline-none"
            />
            <button
              type="button"
              onClick={() => setShowOwnerPassword(!showOwnerPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition cursor-pointer"
            >
              {showOwnerPassword ? (
                <EyeSvg />
              ) : (
                <EyeCloseSvg />
              )}
            </button>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Controls permissions like printing and editing
          </p>
        </div>
      </div>

      {/* Error Message */}
      {file.status === "error" && file.error && (
        <div className="mt-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400">{file.error}</p>
        </div>
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
    clearAll,
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 dark:bg-zinc-900 bg-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5">
              <p className="md:text-sm text-xs text-zinc-600 dark:text-zinc-400">
                {stats.pending > 0 && `${stats.pending} pending`}
                {stats.processing > 0 && ` • ${stats.processing} processing`}
                {stats.error > 0 && ` • ${stats.error} failed`}
              </p>
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
                <ErrorSvg className="w-5 h-5" /> Please set a password for all files before encrypting
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
              {encrypting
                ? "Encrypting..."
                : `Secure ${stats.pending} File${stats.pending !== 1 ? "s" : ""}`}
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