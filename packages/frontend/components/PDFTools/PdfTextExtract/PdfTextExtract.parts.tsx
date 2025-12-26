import { useState } from "react";
import {
  TrashSvg,
  DownloadSvg,
  CheckSvg,
  CopySvg,
} from "@/components/Svg/CommonSvg";
import { ToggleSwitch } from "@/components/Shared/ToggleSwitch";
import {
  FileError,
  FileInfo,
  RemoveButton,
  ToolIconBadge,
} from "@/components/Shared/FileUI";
import type {
  PdfProcessedFile,
  PdfToolConfig,
} from "@/services/pdfService/types";

/* ========================================================================== */
/* TYPES */
/* ========================================================================== */

export interface ExtractedTextData {
  id: string;
  fileName: string;
  text: string;
  charCount: number;
  wordCount: number;
  timestamp: number;
}

/* ========================================================================== */
/* SUB-COMPONENT: PdfFileItem */
/* ========================================================================== */

export const PdfFileItem = ({
  file,
  config,
  updateSettings,
  removeFile,
  isDark,
}: {
  file: PdfProcessedFile;
  config: PdfToolConfig;
  updateSettings: (id: string, settings: { preserve_layout: boolean }) => void;
  removeFile: (id: string) => void;
  isDark: boolean;
}) => {
  return (
    <div className="border border-zinc-200 dark:border-zinc-900 rounded-2xl p-3">
      <div className="flex items-center gap-3 mb-3">
        <ToolIconBadge
          primaryColor={config.primaryColor}
          bgColor={config.dropzoneColor}
          bgColorDark={config.dropzoneColorDark}
          isDark={isDark}
        />

        <div className="flex-1 min-w-0">
          <FileInfo name={file.name} size={file.size} />
        </div>

        <RemoveButton onClick={() => removeFile(file.id)} />
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-900 pt-3">
        <ToggleSwitch
          checked={file.settings.preserve_layout || false}
          onChange={(v) => updateSettings(file.id, { preserve_layout: v })}
          label="Preserve Layout"
          description="Maintain original text formatting"
          color={config.primaryColor}
        />
      </div>

      {file.error && (
        <FileError error={file.error} className="mt-3" />
      )}
    </div>
  );
};

/* ========================================================================== */
/* SUB-COMPONENT: ExtractedTextDisplay */
/* ========================================================================== */

export const ExtractedTextDisplay = ({
  data,
  config,
  onDelete,
}: {
  data: ExtractedTextData;
  config: PdfToolConfig;
  onDelete: (id: string) => void;
}) => {
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

  const downloadcss =
    "px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all text-sm font-medium cursor-pointer flex items-center gap-2";

  return (
    <div className="border border-zinc-200 dark:border-zinc-900 rounded-2xl p-4 md:mt-[1vw] mt-[1vh]">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-3 items-start justify-between mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
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
            {copied ? (
              <CheckSvg className="text-white w-5 h-5" />
            ) : (
              <CopySvg className="w-5 h-5 text-white" />
            )}
          </button>

          <button onClick={handleDownloadTxt} className={downloadcss}>
            <DownloadSvg className="w-4 h-4" />
            TXT
          </button>

          <button onClick={handleExportJson} className={downloadcss}>
            <DownloadSvg className="w-4 h-4" />
            JSON
          </button>

          <button onClick={() => onDelete(data.id)} className={downloadcss}>
            <TrashSvg className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>

      <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 max-h-100 overflow-y-auto">
        <pre className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
          {data.text}
        </pre>
      </div>
    </div>
  );
};
