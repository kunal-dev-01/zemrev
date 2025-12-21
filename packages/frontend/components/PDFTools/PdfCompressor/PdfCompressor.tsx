import { useCallback, useState, useRef, useEffect } from "react";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdf.tool.config";
import { usePdfCompressor } from "@/hooks/pdfHooks/usePdfCompressor.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import GlassButton from "@/components/Layouts/GlassButton";
import {
  ClearAllButton,
  FileInfo,
  FilesStatusSummary,
  RemoveButton,
  SettingsToggleButton,
  ToolIconBadge,
} from "@/components/Shared/FileUI";

// ============================================================================
// SUB-COMPONENT: PdfFileItem
// Handles individual file display and settings dropdown
// ============================================================================
const PdfFileItem = ({
  file,
  config,
  updateFileSettings,
  removeFile,
  isDark,
}: any) => {
  const [isQualityOpen, setIsQualityOpen] = useState(false);
  const qualityRef = useRef<HTMLDivElement>(null);

  const compressionOptions = [
    { value: "screen", label: "Screen", desc: "72 DPI - Smallest size" },
    { value: "ebook", label: "eBook", desc: "150 DPI - Recommended" },
    { value: "printer", label: "Printer", desc: "300 DPI - High Quality" },
    { value: "prepress", label: "Prepress", desc: "300 DPI - Highest" },
  ];

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        qualityRef.current &&
        !qualityRef.current.contains(event.target as Node)
      ) {
        setIsQualityOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCurrentLabel = (val: string) => {
    return (
      compressionOptions.find((opt) => opt.value === val)?.label || "eBook"
    );
  };

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

        {/* Compression Settings Dropdown */}
        <div ref={qualityRef}>
          <SettingsToggleButton
            isOpen={isQualityOpen}
            label={getCurrentLabel(file.settings.level)}
            onClick={() => setIsQualityOpen(!isQualityOpen)}
          />

          {isQualityOpen && (
            <>
              <div
                className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 min-w-full md:min-w-[15vw]  origin-top-right ring-1 ring-black/5 dark:ring-white/5"
                style={{
                  animation:
                    "dropdownEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                }}
              >
                <div className="mb-2">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 block">
                    Compression Level
                  </label>
                </div>
                <div className="flex flex-col gap-2">
                  {compressionOptions.map((option) => {
                    const isActive = file.settings.level === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          updateFileSettings(file.id, { level: option.value });
                          setIsQualityOpen(false);
                        }}
                        className={`
                          relative flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all duration-200 cursor-pointer outline-none
                          ${
                            isActive
                              ? "border-transparent"
                              : "bg-transparent border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                          }
                        `}
                        style={
                          {
                            backgroundColor: isActive
                              ? config.primaryColor
                              : undefined,
                            borderColor: isActive
                              ? config.primaryColor
                              : undefined,
                            "--tw-ring-color": config.primaryColor,
                          } as React.CSSProperties
                        }
                      >
                        <div>
                          <div
                            className={`font-bold text-sm ${
                              isActive
                                ? "text-white"
                                : "text-zinc-700 dark:text-zinc-300"
                            }`}
                          >
                            {option.label}
                          </div>
                          <div
                            className={`text-xs mt-0.5 ${
                              isActive
                                ? "text-white/80"
                                : "text-zinc-500 dark:text-zinc-400"
                            }`}
                          >
                            {option.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
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
const PdfCompressor = () => {
  const config = PDF_TOOL_CONFIGS["pdf-compressor"];
  const isDark = useDarkMode();

  const {
    files,
    compressing,
    stats,
    addFiles,
    removeFile,
    addFromGoogleDrive,
    addFromDropbox,
    updateFileSettings,
    compressAllFiles,
    clearAll,
  } = usePdfCompressor();

  // ============================================================================
  // FILE HANDLING
  // ============================================================================
  const handleFilesSelected = useCallback(
    async (newFiles: File[]) => {
      await addFiles(newFiles, config.defaultSettings.level as string);
    },
    [addFiles, config]
  );

  // ============================================================================
  // COMPUTED
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
        onGooglePick={() =>
          addFromGoogleDrive(config.defaultSettings.level as string)
        }
        onDropboxPick={() =>
          addFromDropbox(config.defaultSettings.level as string)
        }
        currentFileCount={files.length}
        disabled={!canAddMore}
      />

      {/* Pending Files Panel */}
      {files.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-900 rounded-2xl  md:p-6 p-3 md:mt-[1vw] mt-[1vh] fade-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <FilesStatusSummary
              pending={stats.pending}
              processing={stats.processing}
              failed={stats.error}
            />

            <ClearAllButton onClick={clearAll} />
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

          {/* Compress All Button */}
          <GlassButton
            loading={compressing}
            primaryColor={config.primaryColor}
            onClick={compressAllFiles}
          >
            {compressing
              ? "Compressing..."
              : `Compress ${stats.pending} File${
                  stats.pending !== 1 ? "s" : ""
                }`}
          </GlassButton>
        </div>
      )}

      {/* Session Files Display */}
      <PdfSessionFilesDisplay toolType="compress-pdf" config={config} />
    </div>
  );
};

export default PdfCompressor;
