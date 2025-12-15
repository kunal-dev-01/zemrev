import { useCallback, useState, useRef, useEffect } from "react";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdfToolConfigs";
import {
  CancelSvg,
  TrashSvg,
  SettingsSvg,
  ChevronDownSvg,
} from "@/components/Svg/CommonSvg";
import { usePdfCompressor } from "@/hooks/pdfHooks/usePdfCompressor.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import { useFileUtils } from "@/hooks/appHooks/useFileUtils";
import GlassButton from "@/components/Layouts/GlassButton";
import { PDFToImageSVg } from "@/components/Svg/PdfSvg";

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
  const { formatBytes } = useFileUtils();

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
            {file.name}
          </h3>
          <p className="text-xs px-1 rounded-md bg-zinc-200 dark:bg-zinc-800 inline-block text-zinc-500 dark:text-zinc-400 mt-1">
            {formatBytes(file.size)}
          </p>
        </div>

        {/* Compression Settings Dropdown */}
        <div ref={qualityRef}>
          <button
            onClick={() => setIsQualityOpen(!isQualityOpen)}
            className="min-w-[120px] px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200 flex items-center justify-between transition-all cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            <div className="flex items-center gap-1">
              <div className="w-5 h-5" style={{ color: config.primaryColor }}>
                <SettingsSvg />
              </div>
              <span className="font-medium text-sm">
                {getCurrentLabel(file.settings.level)}
              </span>
            </div>
            <ChevronDownSvg />
          </button>

          {isQualityOpen && (
            <div className="absolute z-20 right-0 mt-1 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl w-[280px] shadow-xl">
              <div className="flex flex-col gap-1">
                {compressionOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      updateFileSettings(file.id, { level: option.value });
                      setIsQualityOpen(false);
                    }}
                    className={`px-3 py-2 rounded-xl text-sm font-medium text-left transition-all flex items-center justify-between border cursor-pointer ${
                      file.settings.level === option.value
                        ? "text-white"
                        : "text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    }`}
                    style={{
                      backgroundColor:
                        file.settings.level === option.value
                          ? config.primaryColor
                          : undefined,
                      borderColor:
                        file.settings.level === option.value
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
  const canCompress = stats.pending > 0 && !compressing;
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
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3 md:mt-[1vw] mt-[1vh] fade-in">
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

          {/* Compress All Button */}
          {canCompress && (
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
          )}
        </div>
      )}

      {/* Session Files Display */}
      <PdfSessionFilesDisplay toolType="compress-pdf" config={config} />
    </div>
  );
};

export default PdfCompressor;
