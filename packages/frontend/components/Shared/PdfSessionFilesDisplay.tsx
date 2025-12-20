import { useCallback, useEffect, useState } from "react";

import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { zipDownloadUtils } from "@/utils/zipDownload.utils";

import {
  DownloadSvg,
  FolderOpenSvg,
  TrashSvg,
} from "@/components/Svg/CommonSvg";

import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import { useFormatUtils } from "@/hooks/appHooks/useFormatUtils";

import type {
  PdfToolConfig,
  PdfToolType,
  PdfStoredFile,
} from "@/services/pdfService/types";

import ActionButton, {
  FileActionButton,
  ConfirmModal,
} from "./FileUITwo";

import { ClearAllButton, ToolIconBadge } from "./FileUI";

// ======================================================
// TYPES
// ======================================================

interface PdfSessionFilesDisplayProps {
  toolType: PdfToolType;
  config: PdfToolConfig;
}

// ======================================================
// COMPONENT
// ======================================================

export const PdfSessionFilesDisplay = ({
  toolType,
  config,
}: PdfSessionFilesDisplayProps) => {
  const isDark = useDarkMode();

  const [sessionFiles, setSessionFiles] = useState<PdfStoredFile[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const { formatSize, formatTimeAgo, truncateFileName } = useFormatUtils();

  // ============================================================================
  // LOAD FILES FROM SESSION STORAGE
  // ============================================================================

  const loadFiles = useCallback(() => {
    const files = pdfSessionStorage.getFiles(toolType);
    setSessionFiles(files);
  }, [toolType]);

  // ============================================================================
  // INITIAL LOAD
  // ============================================================================

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // ============================================================================
  // REAL-TIME UPDATES (EVENT DRIVEN)
  // ============================================================================

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const event = e as CustomEvent;
      if (event.detail?.toolType === toolType) {
        loadFiles();
      }
    };

    window.addEventListener("pdfSessionStorageUpdated", handleUpdate);

    return () => {
      window.removeEventListener("pdfSessionStorageUpdated", handleUpdate);
    };
  }, [toolType, loadFiles]);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const handleDownload = async (fileId: string) => {
    const fileMeta = pdfSessionStorage.getFile(toolType, fileId);
    if (!fileMeta) return;

    const blob = await pdfSessionStorage.getBlob(fileId);
    if (!blob) return;

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileMeta.name;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = async () => {
    if (sessionFiles.length === 0) return;

    setIsDownloading(true);

    try {
      const filesToZip: { name: string; blob: Blob }[] = [];

      for (const file of sessionFiles) {
        const blob = await pdfSessionStorage.getBlob(file.id);
        if (blob) {
          filesToZip.push({ name: file.name, blob });
        }
      }

      if (filesToZip.length > 0) {
        await zipDownloadUtils.downloadAsZip(
          filesToZip,
          "completed-files"
        );
      }
    } catch (error) {
      console.error("ZIP download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    await pdfSessionStorage.deleteFile(toolType, fileId);
    setSessionFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleClearAll = async () => {
    await pdfSessionStorage.clearTool(toolType);
    setSessionFiles([]);
    setShowConfirmClear(false);
  };

  // ============================================================================
  // GUARD
  // ============================================================================

  if (sessionFiles.length === 0) return null;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3 md:mt-[1vw] mt-[1vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-lg"
              style={{
                backgroundColor: isDark
                  ? config.dropzoneColorDark
                  : config.dropzoneColor,
              }}
            >
              <div
                className="w-6 h-6"
                style={{ color: config.primaryColor }}
              >
                <FolderOpenSvg />
              </div>
            </div>

            <div>
              <h3 className="md:text-lg text-md font-semibold text-zinc-800 dark:text-zinc-200">
                Completed Files
              </h3>
              <p className="md:text-sm text-xs text-zinc-600 dark:text-zinc-400">
                {sessionFiles.length} file
                {sessionFiles.length !== 1 ? "s" : ""} • Expires in 2 hours
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ActionButton
              onClick={handleDownloadAll}
              disabled={isDownloading}
              loading={isDownloading}
              text="Download All"
              loadingText="Downloading..."
              bgColor={config.primaryColor}
            />

            <ClearAllButton disabled={isDownloading} onClick={() => setShowConfirmClear(true)} />
          </div>
        </div>

        {/* File List */}
        <div className="space-y-2">
          {sessionFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between md:p-3 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <ToolIconBadge
                  primaryColor={config.primaryColor}
                  bgColor={config.dropzoneColor}
                  bgColorDark={config.dropzoneColorDark}
                  isDark={isDark}
                />

                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium text-zinc-800 dark:text-zinc-200 truncate"
                    title={file.name}
                  >
                    {truncateFileName(file.name)}
                  </p>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatSize(file.size)} •{" "}
                    {formatTimeAgo(file.timestamp)}
                  </p>
                </div>
              </div>

              <div className="flex items-center ml-2">
                <FileActionButton
                  icon={<DownloadSvg />}
                  onClick={() => handleDownload(file.id)}
                  title="Download"
                />

                <FileActionButton
                  icon={<TrashSvg />}
                  onClick={() => handleDelete(file.id)}
                  title="Delete"
                  variant="danger"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm Clear Modal */}
      <ConfirmModal
        isOpen={showConfirmClear}
        title="Clear All Files?"
        message="This action cannot be undone. All files will be permanently deleted."
        confirmText="Clear All"
        cancelText="Cancel"
        isDangerous
        onConfirm={handleClearAll}
        onCancel={() => setShowConfirmClear(false)}
      />
    </>
  );
};
