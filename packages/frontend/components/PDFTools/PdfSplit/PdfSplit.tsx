import { useCallback, useState, useRef, useEffect } from "react";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdf.tool.config";
import { usePdfSplit } from "@/hooks/pdfHooks/usePdfSplit.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import GlassButton from "@/components/Layouts/GlassButton";
import type {
  PdfProcessedFile,
  PdfFileSettings,
  PdfToolConfig,
} from "@/services/pdfService/types";
import {
  FileInfo,
  FilesStatusSummary,
  RemoveButton,
  SettingsToggleButton,
  ToolIconBadge,
} from "@/components/Shared/FileUI";
import { InputField } from "@/components/Layouts/InputField";

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

  const handlePageInputChange = (value: string) => {
    setPageInput(value);
    updateFileSettings(file.id, { pages: value });
  };

  const handlePresetClick = (value: string) => {
    setPageInput(value);
    updateFileSettings(file.id, { pages: value });
    setIsSettingsOpen(false);
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

        {/* Page Settings Dropdown */}
        <div ref={settingsRef}>
          <SettingsToggleButton
            isOpen={isSettingsOpen}
            label={getCurrentLabel(file.settings.pages || "1-3")}
            onClick={() => setIsSettingsOpen((v) => !v)}
          />

          {isSettingsOpen && (
            <>
              <div
                className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 md:min-w-[15vw] min-w-full origin-top-right ring-1 ring-black/5 dark:ring-white/5"
                style={{
                  animation:
                    "dropdownEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                }}
              >
                {/* Custom Page Input */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 block">
                    Custom Page Range
                  </label>
                  <InputField
                    label=""
                    type="text"
                    value={pageInput}
                    onChange={handlePageInputChange}
                    placeholder="e.g., 1-5, 7, 10-15"
                  />
                </div>

                {/* Preset Buttons */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 block">
                    Quick Presets
                  </label>
                  <div className="space-y-2">
                    {PAGE_PRESETS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handlePresetClick(option.value)}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left transition-all flex items-center justify-between border cursor-pointer ${
                          file.settings.pages === option.value
                            ? "text-white border-transparent"
                            : "text-zinc-700 dark:text-zinc-300 bg-transparent border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
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
                          <div
                            className={`text-xs mt-0.5 ${
                              file.settings.pages === option.value
                                ? "text-white/80"
                                : "text-zinc-500 dark:text-zinc-400"
                            }`}
                          >
                            {option.desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Remove Button */}
        <RemoveButton onClick={() => removeFile(file.id)} />
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
  } = usePdfSplit();

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFilesSelected = useCallback(
    async (newFiles: File[]) => {
      await addFiles(newFiles, config.defaultSettings.pages as string);
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

          {/* Split All Button */}
          <GlassButton
            loading={splitting}
            primaryColor={config.primaryColor}
            onClick={splitAllFiles}
          >
            {splitting ? "Splitting..." : `Split PDF`}
          </GlassButton>
        </div>
      )}

      {/* Session Files Display */}
      <PdfSessionFilesDisplay toolType="pdf-split" config={config} />
    </div>
  );
};

export default PdfSplit;
