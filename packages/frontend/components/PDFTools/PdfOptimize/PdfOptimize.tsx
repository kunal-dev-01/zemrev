// ============================================================================
// FILE: src/components/PDFTools/PdfOptimize/PdfOptimize.tsx
// PURPOSE: PDF Optimize Component - Remove metadata and optimize PDFs
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
import { useOptimizePdf } from "@/hooks/pdfHooks/useOptimizePdf.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import GlassButton from "@/components/Layouts/GlassButton";
import { PDFToImageSVg } from "@/components/Svg/PdfSvg";
import type {
  PdfProcessedFile,
  PdfFileSettings,
  PdfToolConfig,
} from "@/services/pdfService/types";

// ============================================================================
// TYPES
// ============================================================================

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
  color: string;
}

interface OptimizationOption {
  key: keyof PdfFileSettings;
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

const OPTIMIZATION_OPTIONS: OptimizationOption[] = [
  {
    key: "remove_metadata",
    label: "Remove Metadata",
    desc: "Author, title, keywords",
  },
  {
    key: "remove_annotations",
    label: "Remove Annotations",
    desc: "Comments and markups",
  },
  {
    key: "remove_javascript",
    label: "Remove JavaScript",
    desc: "Embedded scripts",
  },
  {
    key: "remove_links",
    label: "Remove Links",
    desc: "Hyperlinks and URLs",
  },
  {
    key: "compress_images",
    label: "Compress Images",
    desc: "Reduce image quality",
  },
];

// ============================================================================
// SUB-COMPONENT: ToggleSwitch
// ============================================================================

const ToggleSwitch = ({
  checked,
  onChange,
  label,
  description,
  color,
}: ToggleSwitchProps) => {
  const handleToggle = () => onChange(!checked);

  return (
    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all">
      {/* Toggle */}
      <div
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle();
          }
        }}
        className={`relative w-11 h-6 flex items-center rounded-full transition-all duration-300 focus:outline-none ${
          checked ? "bg-opacity-90" : "bg-zinc-300 dark:bg-zinc-700"
        }`}
        style={checked ? { backgroundColor: color } : undefined}
      >
        <span
          className={`absolute left-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </div>

      {/* Label & Description */}
      <div className="flex-1 leading-tight">
        <span className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {description}
        </span>
      </div>
    </label>
  );
};

// ============================================================================
// SUB-COMPONENT: PdfFileItem
// Handles individual file display and optimization settings
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

  const handleToggleOption = (key: keyof PdfFileSettings, value: boolean) => {
    updateFileSettings(file.id, { [key]: value });
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

  const getActiveCount = (): number => {
    return OPTIMIZATION_OPTIONS.filter(
      (opt) => file.settings[opt.key] === true
    ).length;
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

        {/* Settings Button */}
        {file.status === "pending" && (
          <div ref={settingsRef}>
            <button
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between gap-2 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5">
                  <SettingsSvg />
                </div>
                <span className="hidden sm:inline font-medium text-sm">
                  {getActiveCount()}/{OPTIMIZATION_OPTIONS.length}
                </span>
              </div>
              <ChevronDownSvg />
            </button>

            {/* Dropdown */}
            {isSettingsOpen && (
              <div className="absolute right-0 mt-1 w-[350px] max-w-[calc(100vw-3.3rem)] p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl z-20 space-y-1">
                {OPTIMIZATION_OPTIONS.map((option) => (
                  <ToggleSwitch
                    key={option.key}
                    checked={(file.settings[option.key] as boolean) || false}
                    onChange={(v) => handleToggleOption(option.key, v)}
                    label={option.label}
                    description={option.desc}
                    color={config.primaryColor}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Remove Button */}
        <button
          onClick={() => removeFile(file.id)}
          className="px-3 py-1.5 rounded-xl border dark:border-zinc-700 border-zinc-200 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200 cursor-pointer"
          aria-label="Remove file"
        >
          <CancelSvg className="w-5 h-5" />
        </button>
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

const PdfOptimize = () => {
  const config = PDF_TOOL_CONFIGS["pdf-optimize"];
  const isDark = useDarkMode();

  const {
    files,
    optimizing,
    stats,
    addFiles,
    removeFile,
    addFromGoogleDrive,
    addFromDropbox,
    updateFileSettings,
    optimizeAllFiles,
    clearAll,
  } = useOptimizePdf();

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

  const canOptimize = stats.pending > 0 && !optimizing;
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

          {/* Optimize Button */}
          {canOptimize && (
            <GlassButton
              loading={optimizing}
              primaryColor={config.primaryColor}
              onClick={optimizeAllFiles}
            >
              {optimizing
                ? "Optimizing..."
                : `Optimize ${stats.pending} File${stats.pending !== 1 ? "s" : ""}`}
            </GlassButton>
          )}
        </div>
      )}

      {/* Session Files Display */}
      <PdfSessionFilesDisplay toolType="optimize-pdf" config={config} />
    </div>
  );
};

export default PdfOptimize;