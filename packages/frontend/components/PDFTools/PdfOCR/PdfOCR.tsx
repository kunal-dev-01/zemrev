import { useCallback, useEffect, useRef, useState } from "react";

import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import GlassButton from "@/components/Layouts/GlassButton";

import {
  ChevronDownSvg,
} from "@/components/Svg/CommonSvg";
import { PDFToImageSVg } from "@/components/Svg/PdfSvg";

import { PDF_TOOL_CONFIGS } from "@/config/pdfToolConfigs";
import { useOcrSearchable } from "@/hooks/pdfHooks/useOcrSearchable.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";

import type {
  PdfProcessedFile,
  PdfFileSettings,
  PdfToolConfig,
} from "@/services/pdfService/types";
import { FileError, RemoveButton } from "@/components/Shared/FileUI";

// ============================================================================
// TYPES
// ============================================================================

interface DpiPreset {
  value: number;
  label: string;
  desc: string;
}

interface PdfFileItemProps {
  file: PdfProcessedFile;
  config: PdfToolConfig;
  updateFileSettings: (id: string, settings: PdfFileSettings) => void;
  removeFile: (id: string) => void;
  isDark: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DPI_PRESETS: DpiPreset[] = [
  { value: 150, label: "Low", desc: "Fast, basic quality" },
  { value: 300, label: "Standard", desc: "Recommended" },
  { value: 400, label: "High", desc: "Better accuracy" },
  { value: 600, label: "Maximum", desc: "Highest quality" },
];

// ============================================================================
// FILE ITEM
// ============================================================================

const PdfFileItem = ({
  file,
  config,
  updateFileSettings,
  removeFile,
  isDark,
}: PdfFileItemProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helpers
  const handleDpiChange = (dpi: number) => {
    updateFileSettings(file.id, { dpi });
    setIsSettingsOpen(false);
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const currentDpiLabel =
    DPI_PRESETS.find((p) => p.value === file.settings.dpi)?.label ??
    `${file.settings.dpi} DPI`;

  return (
    <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-transparent p-2 md:p-3 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className="shrink-0 rounded-lg p-2.5 sm:p-3"
          style={{
            backgroundColor: isDark
              ? config.dropzoneColorDark
              : config.dropzoneColor,
          }}
        >
          <div
            className="h-5 w-5 sm:h-6 sm:w-6"
            style={{ color: config.primaryColor }}
          >
            <PDFToImageSVg />
          </div>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h3
            className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200"
            title={file.name}
          >
            {file.name}
          </h3>

          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-md bg-zinc-200 px-1 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              {formatBytes(file.size)}
            </span>

            <span className="hidden rounded-md bg-blue-100 px-1 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 md:block">
              English
            </span>
          </div>
        </div>

        {/* DPI Dropdown */}
        <div ref={settingsRef}>
          <button
            onClick={() => setIsSettingsOpen((v) => !v)}
            className="flex min-w-[110px] items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-800 transition-all hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            {currentDpiLabel}
            <ChevronDownSvg />
          </button>

          {isSettingsOpen && (
            <div className="absolute right-0 z-20 mt-1 md:w-[15vw] rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
              <label className="mb-1.5 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                OCR Quality (DPI)
              </label>

              <div className="space-y-1">
                {DPI_PRESETS.map((preset) => {
                  const active = file.settings.dpi === preset.value;

                  return (
                    <button
                      key={preset.value}
                      onClick={() => handleDpiChange(preset.value)}
                      className={`flex w-full items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-left text-sm font-medium transition-all ${
                        active
                          ? "text-white"
                          : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      }`}
                      style={
                        active
                          ? {
                              backgroundColor: config.primaryColor,
                              borderColor: config.primaryColor,
                            }
                          : undefined
                      }
                    >
                      <div>
                        <div className="font-bold">{preset.label}</div>
                        <div className="mt-0.5 text-xs opacity-80">
                          {preset.desc}
                        </div>
                      </div>
                      <span className="text-xs opacity-70">
                        {preset.value}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-800/50">
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  💡 Higher DPI = Better accuracy but slower processing
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Remove */}
        <RemoveButton onClick={() => removeFile(file.id)} />
      </div>

      {/* Error */}
      {file.status === "error" && file.error && (
        <FileError error={file.error} />
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PdfOCR = () => {
  const config = PDF_TOOL_CONFIGS["ocr-searchable"];
  const isDark = useDarkMode();

  const {
    files,
    processing,
    stats,
    addFiles,
    removeFile,
    addFromGoogleDrive,
    addFromDropbox,
    updateFileSettings,
    processAllFiles,
  } = useOcrSearchable();

  const handleFilesSelected = useCallback(
    async (newFiles: File[]) => {
      await addFiles(newFiles);
    },
    [addFiles]
  );

  const canProcess = stats.pending > 0 && !processing;
  const canAddMore = files.length < config.maxFiles;

  return (
    <div className="w-full md:mt-[1vw] mt-[1vh]">
      <PdfDragDropZone
        config={config}
        onFilesSelected={handleFilesSelected}
        onGooglePick={addFromGoogleDrive}
        onDropboxPick={addFromDropbox}
        currentFileCount={files.length}
        disabled={!canAddMore}
      />

      {files.length > 0 && (
        <div className="mt-[1vh] rounded-xl border border-zinc-200 bg-white/50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40 md:mt-[1vw] md:p-6">
          <div className="mb-6 flex items-center ">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs text-zinc-600 dark:text-zinc-400 md:text-sm">
                {stats.pending > 0 && `${stats.pending} pending`}
                {stats.processing > 0 && ` • ${stats.processing} processing`}
                {stats.error > 0 && ` • ${stats.error} failed`}
              </p>
            </div>
          </div>

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

          {canProcess && (
            <GlassButton
              loading={processing}
              primaryColor={config.primaryColor}
              onClick={processAllFiles}
            >
              {processing ? "Processing OCR..." : "Make Searchable"}
            </GlassButton>
          )}
        </div>
      )}

      <PdfSessionFilesDisplay
        toolType="ocr-searchable"
        config={config}
      />
    </div>
  );
};

export default PdfOCR;
