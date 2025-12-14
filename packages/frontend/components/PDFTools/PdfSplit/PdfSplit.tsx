// ============================================================================
// FILE: src/components/PDFTools/PdfSplit/PdfSplit.tsx
// PURPOSE: PDF Split Component - Extract specific pages from PDF files
// ============================================================================

import { useCallback, useState, useRef, useEffect } from "react";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdfToolConfigs";
import {
  CancelSvg,
  TrashSvg,
  ChevronDownSvg,
  SettingsSvg,
} from "@/components/Svg/CommonSvg";
import { usePdfSplit } from "@/hooks/pdfHooks/usePdfSplit.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import GlassButton from "@/components/Layouts/GlassButton";
import { PDFToImageSVg } from "@/components/Svg/PdfSvg";
import type { 
  PdfProcessedFile, 
  PdfFileSettings,
  PdfToolConfig 
} from "@/services/pdfService/types";

// ============================================================================
// TYPES
// ============================================================================

interface PagePreset {
  value: string;
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

const PAGE_PRESETS: PagePreset[] = [
  { value: "1-3", label: "First 3", desc: "Pages 1-3" },
  { value: "1-5", label: "First 5", desc: "Pages 1-5" },
  { value: "1-10", label: "First 10", desc: "Pages 1-10" },
  { value: "all", label: "All Pages", desc: "Extract all" },
];

// ============================================================================
// SUB-COMPONENT: PdfFileItem
// Handles individual file display and page range settings
// ============================================================================

const PdfFileItem = ({
  file,
  config,
  updateFileSettings,
  removeFile,
  isDark,
}: PdfFileItemProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [pageInput, setPageInput] = useState(file.settings.pages || "1-3");
  const settingsRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPageInput(value);
    updateFileSettings(file.id, { pages: value });
  };

  const handlePresetClick = (value: string) => {
    setPageInput(value);
    updateFileSettings(file.id, { pages: value });
    setIsSettingsOpen(false);
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

  const getCurrentLabel = (val: string): string => {
    return PAGE_PRESETS.find((opt) => opt.value === val)?.label || "Custom";
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2 md:p-3 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 relative">
      <div className="flex items-center gap-3">
        {/* PDF Icon Box */}
        <div
          className="p-2.5 sm:p-3 rounded-lg shrink-0"
          style={{
            backgroundColor: isDark
              ? config.dropzoneColorDark
              : config.dropzoneColor,
          }}
        >
          <div
            style={{ color: config.primaryColor }}
            className="w-5 h-5 sm:w-6 sm:h-6"
          >
            <PDFToImageSVg />
          </div>
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm leading-none font-medium text-zinc-800 dark:text-zinc-200 truncate"
            title={file.name}
          >
            {truncateFileName(file.name)}
          </h3>
          <p className="text-xs px-1 rounded-md bg-zinc-200 dark:bg-zinc-800 inline-block text-zinc-500 dark:text-zinc-400 mt-1">
            {formatBytes(file.size)}
          </p>
        </div>

        {/* Page Settings Dropdown */}
        <div ref={settingsRef}>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="min-w-[120px] px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200 flex items-center justify-between transition-all cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            <div className="flex items-center gap-2">
              <SettingsSvg />
              <span className="font-medium text-sm">
                {getCurrentLabel(file.settings.pages || "1-3")}
              </span>
            </div>
            <ChevronDownSvg />
          </button>

          {isSettingsOpen && (
            <div className="absolute z-20 right-0 mt-1 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl w-[320px] shadow-xl">
              {/* Custom Page Input */}
              <div className="mb-3">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 block">
                  Custom Page Range
                </label>
                <input
                  type="text"
                  value={pageInput}
                  onChange={handlePageInputChange}
                  placeholder="e.g., 1-5, 7, 10-15"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-sm outline-none"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Use ranges (1-5), single pages (7), or both (1-3,5,8-10)
                </p>
              </div>

              {/* Preset Buttons */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 block">
                  Quick Presets
                </label>
                {PAGE_PRESETS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handlePresetClick(option.value)}
                    className={`w-full px-3 py-2 rounded-xl text-sm font-medium text-left transition-all flex items-center justify-between border cursor-pointer ${
                      file.settings.pages === option.value
                        ? "text-white"
                        : "text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    }`}
                    style={{
                      backgroundColor:
                        file.settings.pages === option.value
                          ? config.primaryColor
                          : undefined,
                      borderColor:
                        file.settings.pages === option.value
                          ? config.primaryColor
                          : undefined,
                    }}
                  >
                    <div>
                      <div className="font-bold">{option.label}</div>
                      <div className="text-xs opacity-80 mt-0.5">
                        {option.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
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
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PdfSplit = () => {
  const config = PDF_TOOL_CONFIGS["pdf-split"];
  const isDark = useDarkMode();

  const {
    files,
    splitting,
    stats,
    addFiles,
    removeFile,
    addFromGoogleDrive,
    addFromDropbox,
    updateFileSettings,
    splitAllFiles,
    clearAll,
  } = usePdfSplit();

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFilesSelected = useCallback(
    async (newFiles: File[]) => {
      await addFiles(
        newFiles,
        config.defaultSettings.pages as string
      );
    },
    [addFiles, config.defaultSettings.pages]
  );

  const handleGoogleDrive = useCallback(async () => {
    await addFromGoogleDrive(config.defaultSettings.pages as string);
  }, [addFromGoogleDrive, config.defaultSettings.pages]);

  const handleDropbox = useCallback(async () => {
    await addFromDropbox(config.defaultSettings.pages as string);
  }, [addFromDropbox, config.defaultSettings.pages]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const canSplit = stats.pending > 0 && !splitting;
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

          {/* Split All Button */}
          {canSplit && (
            <GlassButton
              loading={splitting}
              primaryColor={config.primaryColor}
              onClick={splitAllFiles}
            >
              {splitting
                ? "Splitting..."
                : `Split ${stats.pending} File${stats.pending !== 1 ? "s" : ""}`}
            </GlassButton>
          )}
        </div>
      )}

      {/* Session Files Display */}
      <PdfSessionFilesDisplay toolType="pdf-split" config={config} />
    </div>
  );
};

export default PdfSplit;