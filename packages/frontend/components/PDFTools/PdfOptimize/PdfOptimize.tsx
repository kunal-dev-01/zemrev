import { useCallback, useState, useRef, useEffect } from "react";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdf.tool.config";
import { useOptimizePdf } from "@/hooks/pdfHooks/useOptimizePdf.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import GlassButton from "@/components/Layouts/GlassButton";
import type {
  PdfProcessedFile,
  PdfFileSettings,
  PdfToolConfig,
} from "@/services/pdfService/types";
import {
  FileError,
  FileInfo,
  FilesStatusSummary,
  RemoveButton,
  SettingsToggleButton,
  ToolIconBadge,
} from "@/components/Shared/FileUI";

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

  const getActiveCount = (): number => {
    return OPTIMIZATION_OPTIONS.filter((opt) => file.settings[opt.key] === true)
      .length;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="bg-transparent border border-zinc-200 dark:border-zinc-900 rounded-2xl p-2 md:p-3 relative">
      <div className="flex items-center gap-3">
        {/* PDF Icon Box */}
        <ToolIconBadge
          primaryColor={config.primaryColor}
          bgColor={config.dropzoneColor}
          bgColorDark={config.dropzoneColorDark}
          isDark={isDark}
        />

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <FileInfo name={file.name} size={file.size} />
        </div>

        {/* Settings Button */}
        {file.status === "pending" && (
          <div ref={settingsRef}>
            <SettingsToggleButton
              isOpen={isSettingsOpen}
              label={getActiveCount() + " Active"}
              onClick={() => setIsSettingsOpen((v) => !v)}
            />

            {/* Dropdown */}
            {isSettingsOpen && (
              <>
                <div
                  className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 md:w-[20vw] w-[calc(100vw-3.3rem)] origin-top-right ring-1 ring-black/5 dark:ring-white/5"
                  style={{
                    animation: "dropdownEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                  }}
                >
                  <div className="space-y-1">
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
                </div>
              </>
            )}
          </div>
        )}

        {/* Remove Button */}
        <RemoveButton onClick={() => removeFile(file.id)} />
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
        <div className="border border-zinc-200 dark:border-zinc-900 rounded-2xl md:p-6 p-3 md:mt-[1vw] mt-[1vh]">
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

          {/* Optimize Button */}
            <GlassButton
              loading={optimizing}
              primaryColor={config.primaryColor}
              onClick={optimizeAllFiles}
            >
              {optimizing ? "Optimizing..." : `Optimize PDF`}
            </GlassButton>
        </div>
      )}

      {/* Session Files Display */}
      <PdfSessionFilesDisplay toolType="optimize-pdf" config={config} />
    </div>
  );
};

export default PdfOptimize;