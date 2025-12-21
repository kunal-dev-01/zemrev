import { useCallback, useEffect, useRef, useState } from "react";

import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import GlassButton from "@/components/Layouts/GlassButton";

import { PDF_TOOL_CONFIGS } from "@/config/pdf.tool.config";
import { useOcrSearchable } from "@/hooks/pdfHooks/useOcrSearchable.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";

import type {
  PdfProcessedFile,
  PdfFileSettings,
  PdfToolConfig,
} from "@/services/pdfService/types";
import {
  FileError,
  FilesStatusSummary,
  RemoveButton,
  SettingsToggleButton,
  ToolIconBadge,
} from "@/components/Shared/FileUI";

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-900 p-2 md:p-3">
      <div className="flex items-center gap-3">
        {/* Icon */}
        <ToolIconBadge
          primaryColor={config.primaryColor}
          bgColor={config.dropzoneColor}
          bgColorDark={config.dropzoneColorDark}
          isDark={isDark}
        />

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
          <SettingsToggleButton
            isOpen={isSettingsOpen}
            label={currentDpiLabel}
            onClick={() => setIsSettingsOpen((v) => !v)}
          />

          {isSettingsOpen && (
            <>
              <div
                className="absolute right-0 top-full mt-1 z-20 md:min-w-[15vw] min-w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 origin-top-right ring-1 ring-black/5 dark:ring-white/5"
                style={{
                  animation:
                    "dropdownEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                }}
              >
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 block">
                  OCR Quality (DPI)
                </label>

                <div className="space-y-2">
                  {DPI_PRESETS.map((preset) => {
                    const active = file.settings.dpi === preset.value;

                    return (
                      <button
                        key={preset.value}
                        onClick={() => handleDpiChange(preset.value)}
                        className={`
                          relative w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all duration-200 cursor-pointer outline-none
                          ${
                            active
                              ? "border-transparent"
                              : "bg-transparent border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                          }
                        `}
                        style={
                          {
                            backgroundColor: active
                              ? config.primaryColor
                              : undefined,
                            borderColor: active
                              ? config.primaryColor
                              : undefined,
                            "--tw-ring-color": config.primaryColor,
                          } as React.CSSProperties
                        }
                      >
                        <div>
                          <div
                            className={`font-bold text-sm ${
                              active
                                ? "text-white"
                                : "text-zinc-700 dark:text-zinc-300"
                            }`}
                          >
                            {preset.label}
                          </div>
                          <div
                            className={`text-xs mt-0.5 ${
                              active
                                ? "text-white/80"
                                : "text-zinc-500 dark:text-zinc-400"
                            }`}
                          >
                            {preset.desc}
                          </div>
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            active
                              ? "text-white/70"
                              : "text-zinc-500 dark:text-zinc-400"
                          }`}
                        >
                          {preset.value}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-800/50">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    💡 Higher DPI = Better accuracy but slower processing
                  </p>
                </div>
              </div>
            </>
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
        <div className="mt-[1vh] rounded-2xl border border-zinc-200 p-3 dark:border-zinc-900 md:mt-[1vw] md:p-6">
          <div className="mb-4 flex items-center">
            <FilesStatusSummary
              pending={stats.pending}
              processing={stats.processing}
              failed={stats.error}
            />
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

          <GlassButton
            loading={processing}
            primaryColor={config.primaryColor}
            onClick={processAllFiles}
          >
            {processing ? "Processing OCR..." : "Make Searchable"}
          </GlassButton>
        </div>
      )}

      <PdfSessionFilesDisplay toolType="ocr-searchable" config={config} />
    </div>
  );
};

export default PdfOCR;
