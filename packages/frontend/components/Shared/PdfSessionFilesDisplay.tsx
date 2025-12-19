import { useCallback, useEffect, useState } from "react";

import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { zipDownloadUtils } from "@/utils/zipDownload.utils";
import {
  DownloadSvg,
  FolderOpenSvg,
  TrashSvg,
} from "@/components/Svg/CommonSvg";
import { PDFToImageSVg } from "@/components/Svg/PdfSvg";

import { useDarkMode } from "@/hooks/appHooks/useDarkMode";

import type {
  PdfToolConfig,
  PdfToolType,
  PdfStoredFile,
} from "@/services/pdfService/types";
import { ClearAllButton } from "./FileUI";

interface PdfSessionFilesDisplayProps {
  toolType: PdfToolType;
  config: PdfToolConfig;
}

export const PdfSessionFilesDisplay = ({
  toolType,
  config,
}: PdfSessionFilesDisplayProps) => {
  const isDark = useDarkMode();
  const [sessionFiles, setSessionFiles] = useState<PdfStoredFile[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

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
  // REAL-TIME UPDATES (Event-driven, NO POLLING!)
  // ============================================================================
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      // Only refresh if event is for this tool
      if (customEvent.detail?.toolType === toolType) {
        loadFiles();
      }
    };

    window.addEventListener("pdfSessionStorageUpdated", handleUpdate);

    return () => {
      window.removeEventListener("pdfSessionStorageUpdated", handleUpdate);
    };
  }, [toolType, loadFiles]);

  // ============================================================================
  // ACTIONS - DOWNLOAD SINGLE FILE
  // ============================================================================

  const handleDownload = async (fileId: string) => {
    const fileMeta = pdfSessionStorage.getFile(toolType, fileId);
    if (!fileMeta) return;

    const blob = await pdfSessionStorage.getBlob(fileId);
    if (!blob) return;

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileMeta.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = async () => {
    if (sessionFiles.length === 0) return;

    setIsDownloading(true);
    try {
      const filesToZip = [];

      for (const file of sessionFiles) {
        const blob = await pdfSessionStorage.getBlob(file.id);
        if (blob) {
          filesToZip.push({
            name: file.name,
            blob: blob,
          });
        }
      }

      if (filesToZip.length > 0) {
        await zipDownloadUtils.downloadAsZip(filesToZip, "completed-files");
      }
    } catch (error) {
      console.error("Error downloading files as ZIP:", error);
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
  };

  // ============================================================================
  // HELPERS
  // ============================================================================

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const truncateFileName = (name: string, maxLength = 30) => {
    if (name.length <= maxLength) return name;

    const ext = name.split(".").pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
    const truncated = nameWithoutExt.substring(
      0,
      maxLength - (ext?.length || 0) - 4
    );

    return `${truncated}...${ext}`;
  };

  if (sessionFiles.length === 0) return null;

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
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
            <div style={{ color: config.primaryColor }} className="w-6 h-6">
              <FolderOpenSvg />
            </div>
          </div>

          <div>
            <h3 className="ms:text-lg text-md font-semibold text-zinc-800 dark:text-zinc-200">
              Completed Files
            </h3>
            <p className="md:text-sm text-xs text-zinc-600 dark:text-zinc-400">
              {sessionFiles.length} file
              {sessionFiles.length !== 1 ? "s" : ""} • Expires in 2 hours
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadAll}
            disabled={isDownloading}
            className="px-3 py-1.5 rounded-xl font-medium text-white flex items-center gap-2 transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ backgroundColor: config.primaryColor }}
          >
            <span className="w-5 h-5">
              <DownloadSvg />
            </span>
            <span className="md:block hidden">
              {isDownloading ? "Downloading..." : "Download All"}
            </span>
          </button>

          <ClearAllButton onClick={handleClearAll} />
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
              <div
                className="md:px-4 md:py-3 px-3 py-2 rounded-xl shrink-0"
                style={{
                  backgroundColor: isDark
                    ? config.dropzoneColorDark
                    : config.dropzoneColor,
                }}
              >
                <div style={{ color: config.primaryColor }} className="w-5 h-5">
                  <PDFToImageSVg />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="font-medium text-zinc-800 dark:text-zinc-200 truncate"
                  title={file.name}
                >
                  {truncateFileName(file.name)}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {formatSize(file.size)} • {formatTimeAgo(file.timestamp)}
                </p>
              </div>
            </div>

            <div className="flex items-center ml-2">
              <button
                onClick={() => handleDownload(file.id)}
                className="py-1.5 px-3 rounded-xl transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                title="Download"
              >
                <DownloadSvg
                  className={`w-5 h-5 text-[${config.primaryColor}]`}
                />
              </button>

              <button
                onClick={() => handleDelete(file.id)}
                className="py-1.5 px-3 rounded-xl transition-all hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 cursor-pointer"
                title="Delete"
              >
                <TrashSvg className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
