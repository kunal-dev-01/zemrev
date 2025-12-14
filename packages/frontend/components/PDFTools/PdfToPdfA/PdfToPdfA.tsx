// ============================================================================
// FILE: src/components/PDFTools/PdfToPdfA/PdfToPdfA.tsx
// PURPOSE: PDF to PDF/A Component - Convert to archival format
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
import { useConvertToPdfA } from "@/hooks/pdfHooks/useConvertToPdfA.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import GlassButton from "@/components/Layouts/GlassButton";
import { PDFToImageSVg } from "@/components/Svg/PdfSvg";
import type {
  PdfProcessedFile,
  PdfFileSettings,
  PdfToolConfig,
  PdfAVersion,
} from "@/services/pdfService/types";

// ============================================================================
// TYPES
// ============================================================================

interface VersionOption {
  value: PdfAVersion;
  label: string;
  desc: string;
  year: string;
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

const VERSION_OPTIONS: VersionOption[] = [
  {
    value: "1b",
    label: "1D",
    desc: "Basic preservation",
    year: "2005",
  },
  {
    value: "2b",
    label: "2D",
    desc: "Recommended standard",
    year: "2011",
  },
  {
    value: "3b",
    label: "3D",
    desc: "Modern features",
    year: "2012",
  },
];

// ============================================================================
// SUB-COMPONENT: PdfFileItem
// Handles individual file display and version settings
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

  const handleVersionChange = (version: PdfAVersion) => {
    updateFileSettings(file.id, { version });
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

  const getCurrentLabel = (): string => {
    const option = VERSION_OPTIONS.find(
      (opt) => opt.value === file.settings.version
    );
    return option?.label || "PDF/A-2b";
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

        {/* Version Settings Dropdown */}
        <div ref={settingsRef}>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="min-w-[95px] px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200 flex items-center justify-between transition-all cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            <div className="flex items-center gap-1">
              <SettingsSvg />
              <span className="font-medium text-sm">{getCurrentLabel()}</span>
            </div>
            <ChevronDownSvg />
          </button>

          {isSettingsOpen && (
            <div className="absolute z-20 right-0 mt-1 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl w-[320px] shadow-xl">
              {/* Version Options */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 block">
                  PDF/A Version
                </label>
                {VERSION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleVersionChange(option.value)}
                    className={`w-full px-3 py-2 rounded-xl text-sm font-medium text-left transition-all flex items-center justify-between border cursor-pointer ${
                      file.settings.version === option.value
                        ? "text-white"
                        : "text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    }`}
                    style={{
                      backgroundColor:
                        file.settings.version === option.value
                          ? config.primaryColor
                          : undefined,
                      borderColor:
                        file.settings.version === option.value
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
                    <div className="text-xs opacity-70">{option.year}</div>
                  </button>
                ))}
              </div>

              {/* Info Note */}
              <div className="mt-3 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  💡 PDF/A-2b is recommended for most archival purposes
                </p>
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

const PdfToPdfA = () => {
  const config = PDF_TOOL_CONFIGS["pdf-to-pdfa"];
  const isDark = useDarkMode();

  const {
    files,
    converting,
    stats,
    addFiles,
    removeFile,
    addFromGoogleDrive,
    addFromDropbox,
    updateFileSettings,
    convertAllFiles,
    clearAll,
  } = useConvertToPdfA();

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

  const canConvert = stats.pending > 0 && !converting;
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

          {/* Convert Button */}
          {canConvert && (
            <GlassButton
              loading={converting}
              primaryColor={config.primaryColor}
              onClick={convertAllFiles}
            >
              {converting
                ? "Converting..."
                : `Convert to PDF/A`}
            </GlassButton>
          )}
        </div>
      )}

      {/* Session Files Display */}
      <PdfSessionFilesDisplay toolType="convert-pdfa" config={config} />
    </div>
  );
};

export default PdfToPdfA;