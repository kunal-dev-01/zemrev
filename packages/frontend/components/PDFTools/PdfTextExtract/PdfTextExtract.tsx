// ============================================================================
// FILE: src/components/PDFTools/PdfTextExtract/PdfTextExtract.tsx
// PURPOSE: PDF Text Extractor - Extract and display text from PDFs
// ============================================================================

import { useCallback, useState, useEffect } from "react";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PDF_TOOL_CONFIGS } from "@/config/pdfToolConfigs";
import {
  CancelSvg,
  TrashSvg,
  DownloadSvg,
} from "@/components/Svg/CommonSvg";
import { useExtractText } from "@/hooks/pdfHooks/useExtractText.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import GlassButton from "@/components/Layouts/GlassButton";
import { PDFToImageSVg } from "@/components/Svg/PdfSvg";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import type {
  PdfProcessedFile,
  PdfToolConfig,
  PdfStoredFile,
} from "@/services/pdfService/types";

// ============================================================================
// TYPES
// ============================================================================

interface ExtractedTextData {
  id: string;
  fileName: string;
  text: string;
  charCount: number;
  wordCount: number;
  timestamp: number;
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
  color: string;
}

interface PdfFileItemProps {
  file: PdfProcessedFile;
  config: PdfToolConfig;
  updateSettings: (id: string, settings: { preserve_layout: boolean }) => void;
  removeFile: (id: string) => void;
  isDark: boolean;
}

interface ExtractedTextDisplayProps {
  data: ExtractedTextData;
  config: PdfToolConfig;
  onDelete: (id: string) => void;
}

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
// ============================================================================

const PdfFileItem = ({
  file,
  config,
  updateSettings,
  removeFile,
  isDark,
}: PdfFileItemProps) => {
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

  return (
    <div className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="p-3 rounded-lg shrink-0"
          style={{
            backgroundColor: isDark
              ? config.dropzoneColorDark
              : config.dropzoneColor,
          }}
        >
          <div
            style={{ color: config.primaryColor }}
            className="w-6 h-6"
          >
            <PDFToImageSVg />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate"
            title={file.name}
          >
            {truncateFileName(file.name)}
          </h3>
          <p className="text-xs px-1 rounded-md bg-zinc-200 dark:bg-zinc-800 inline-block text-zinc-500 dark:text-zinc-400 mt-1">
            {formatBytes(file.size)}
          </p>
        </div>

        <button
          onClick={() => removeFile(file.id)}
          className="px-3 py-1.5 rounded-xl border dark:border-zinc-700 border-zinc-200 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200 cursor-pointer"
          aria-label="Remove file"
        >
          <CancelSvg className="w-5 h-5" />
        </button>
      </div>

      {/* Toggle Setting */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3">
        <ToggleSwitch
          checked={file.settings.preserve_layout || false}
          onChange={(v) => updateSettings(file.id, { preserve_layout: v })}
          label="Preserve Layout"
          description="Maintain original text formatting"
          color={config.primaryColor}
        />
      </div>
    </div>
  );
};

// ============================================================================
// SUB-COMPONENT: ExtractedTextDisplay
// ============================================================================

const ExtractedTextDisplay = ({
  data,
  config,
  onDelete,
}: ExtractedTextDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(data.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([data.text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = data.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const jsonData = {
      fileName: data.fileName,
      extractedAt: new Date(data.timestamp).toISOString(),
      charCount: data.charCount,
      wordCount: data.wordCount,
      text: data.text,
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = data.fileName.replace(".txt", ".json");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-zinc-900/40 p-4 md:mt-[1vw] mt-[1vh]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {data.fileName}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            <span>{data.charCount.toLocaleString()} characters</span>
            <span>•</span>
            <span>{data.wordCount.toLocaleString()} words</span>
            <span>•</span>
            <span>{formatTimeAgo(data.timestamp)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-2"
            style={{
              backgroundColor: copied ? "#10B981" : config.primaryColor,
              color: "white",
            }}
          >
            {copied ? "✓ Copied" : "📋 Copy"}
          </button>

          <button
            onClick={handleDownloadTxt}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all text-sm font-medium cursor-pointer flex items-center gap-2"
          >
            <DownloadSvg className="w-4 h-4" />
            TXT
          </button>

          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all text-sm font-medium cursor-pointer flex items-center gap-2"
          >
            <DownloadSvg className="w-4 h-4" />
            JSON
          </button>

          <button
            onClick={() => onDelete(data.id)}
            className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-sm font-medium cursor-pointer"
          >
            <TrashSvg className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Text Content */}
      <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 max-h-[400px] overflow-y-auto">
        <pre className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
          {data.text}
        </pre>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PdfTextExtract = () => {
  const config = PDF_TOOL_CONFIGS["pdf-extract-text"];
  const isDark = useDarkMode();

  const {
    files,
    extracting,
    addFiles,
    removeFile,
    addFromGoogleDrive,
    addFromDropbox,
    updateSettings,
    extractAll,
    clearAll,
  } = useExtractText();

  const [extractedTexts, setExtractedTexts] = useState<ExtractedTextData[]>([]);

  // ============================================================================
  // LOAD EXTRACTED TEXTS
  // ============================================================================

  const loadExtractedTexts = useCallback(async () => {
    const sessionFiles = pdfSessionStorage.getFiles("extract-text");
    const texts: ExtractedTextData[] = [];

    for (const file of sessionFiles) {
      const blob = await pdfSessionStorage.getBlob(file.id);
      if (blob) {
        const text = await blob.text();
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        
        texts.push({
          id: file.id,
          fileName: file.name,
          text,
          charCount: text.length,
          wordCount,
          timestamp: file.timestamp,
        });
      }
    }

    setExtractedTexts(texts);
  }, []);

  useEffect(() => {
    loadExtractedTexts();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.toolType === "extract-text") {
        loadExtractedTexts();
      }
    };

    window.addEventListener("pdfSessionStorageUpdated", handleUpdate);
    return () => {
      window.removeEventListener("pdfSessionStorageUpdated", handleUpdate);
    };
  }, [loadExtractedTexts]);

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

  const handleDeleteExtracted = async (id: string) => {
    await pdfSessionStorage.deleteFile("extract-text", id);
    loadExtractedTexts();
  };

  const handleExtractAll = async () => {
    await extractAll();
    setTimeout(() => loadExtractedTexts(), 500);
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const canExtract = files.length > 0 && !extracting;
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 dark:bg-zinc-900 bg-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5">
              <p className="md:text-sm text-xs text-zinc-600 dark:text-zinc-400">
                {files.length} file{files.length !== 1 ? "s" : ""} ready
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

          <div className="space-y-2 mb-4">
            {files.map((file) => (
              <PdfFileItem
                key={file.id}
                file={file}
                config={config}
                updateSettings={updateSettings}
                removeFile={removeFile}
                isDark={isDark}
              />
            ))}
          </div>

          {canExtract && (
            <GlassButton
              loading={extracting}
              primaryColor={config.primaryColor}
              onClick={handleExtractAll}
            >
              {extracting
                ? "Extracting Text..."
                : `Extract Text`}
            </GlassButton>
          )}
        </div>
      )}

      {/* Extracted Texts Display */}
      {extractedTexts.map((textData) => (
        <ExtractedTextDisplay
          key={textData.id}
          data={textData}
          config={config}
          onDelete={handleDeleteExtracted}
        />
      ))}
    </div>
  );
};

export default PdfTextExtract;