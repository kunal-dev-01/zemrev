import { useCallback, useState, useRef, useEffect } from "react";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdfToolConfigs";
import { useConvertToPdfA } from "@/hooks/pdfHooks/useConvertToPdfA.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import GlassButton from "@/components/Layouts/GlassButton";
import type {
  PdfProcessedFile,
  PdfFileSettings,
  PdfToolConfig,
  PdfAVersion,
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

        {/* Version Settings Dropdown */}
        <div ref={settingsRef}>
          <SettingsToggleButton
            isOpen={isSettingsOpen}
            label={getCurrentLabel()}
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
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
                {/* Version Options */}
                <div className="space-y-2 mb-4">
                  <label className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 tracking-wider block">
                    PDF/A Version
                  </label>
                  {VERSION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleVersionChange(option.value)}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left transition-all flex items-center justify-between border cursor-pointer ${
                        file.settings.version === option.value
                          ? "text-white border-transparent"
                          : "text-zinc-700 dark:text-zinc-300 bg-transparent border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
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
                        <div
                          className={`text-xs mt-0.5 ${
                            file.settings.version === option.value
                              ? "text-white/80"
                              : "text-zinc-500 dark:text-zinc-400"
                          }`}
                        >
                          {option.desc}
                        </div>
                      </div>
                      <div
                        className={`text-xs ${
                          file.settings.version === option.value
                            ? "text-white/70"
                            : "text-zinc-400"
                        }`}
                      >
                        {option.year}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Info Note */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      💡 PDF/A-2b is recommended for most archival purposes
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

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

          {/* Convert Button */}
          {canConvert && (
            <GlassButton
              loading={converting}
              primaryColor={config.primaryColor}
              onClick={convertAllFiles}
            >
              {converting ? "Converting..." : `Convert to PDF/A`}
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
