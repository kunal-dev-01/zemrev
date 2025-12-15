import { useState } from "react";
import { PdfRotateViewer } from "./PdfRotateViewer";
import { CancelSvg } from "@/components/Svg/CommonSvg";
import { PDFToImageSVg } from "@/components/Svg/PdfSvg";
import type { PdfProcessedFile, PdfFileSettings, PdfToolConfig } from "@/services/pdfService/types";

interface PdfRotateFileItemProps {
  file: PdfProcessedFile;
  config: PdfToolConfig;
  updateSettings: (id: string, settings: PdfFileSettings) => void;
  removeFile: (id: string) => void;
  isDark: boolean;
}

const ROTATION_ANGLES = [
  { label: "90° CW", value: 90, icon: "↻" },
  { label: "180°", value: 180, icon: "↻↻" },
  { label: "270° CCW", value: 270, icon: "↺" },
];

export const PdfRotateFileItem = ({
  file,
  config,
  updateSettings,
  removeFile,
  isDark,
}: PdfRotateFileItemProps) => {
  const [rotationMode, setRotationMode] = useState<"all" | "custom">("all");
  const [selectedAngle, setSelectedAngle] = useState(90);
  const [customPages, setCustomPages] = useState("1,2,3");

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${["B", "KB", "MB"][i]}`;
  };

  const handleAngleChange = (angle: number) => {
    setSelectedAngle(angle);
    if (rotationMode === "all") {
      updateSettings(file.id, { rotations: `all:${angle}` });
    } else {
      updateSettings(file.id, { rotations: `${customPages}:${angle}` });
    }
  };

  const handleModeChange = (mode: "all" | "custom") => {
    setRotationMode(mode);
    if (mode === "all") {
      updateSettings(file.id, { rotations: `all:${selectedAngle}` });
    } else {
      updateSettings(file.id, { rotations: `${customPages}:${selectedAngle}` });
    }
  };

  const handleCustomPagesChange = (pages: string) => {
    setCustomPages(pages);
    if (rotationMode === "custom") {
      updateSettings(file.id, { rotations: `${pages}:${selectedAngle}` });
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all">
      {/* HEADER */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
        <div className="p-2.5 rounded-xl shrink-0" style={{ backgroundColor: isDark ? config.dropzoneColorDark : config.dropzoneColor }}>
          <div style={{ color: config.primaryColor }} className="w-6 h-6">
            <PDFToImageSVg />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm leading-none font-semibold truncate text-zinc-800 dark:text-zinc-200">{file.name}</h3>
          <p className="text-xs text-zinc-500 px-1 bg-zinc-200 dark:bg-zinc-800 rounded-md inline-block">{formatBytes(file.size)}</p>
        </div>
        <button
          type="button"
          onClick={() => removeFile(file.id)}
          className="px-3 py-1.5 rounded-xl border dark:border-zinc-700 border-zinc-200 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200 cursor-pointer"
        >
          <CancelSvg className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 grid lg:grid-cols-2 gap-6">
        {/* CONTROLS COLUMN */}
        <div className="space-y-5">
          {/* MODE SELECTOR */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Rotation Mode</label>
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
              {["all", "custom"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleModeChange(mode as "all" | "custom")}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
                    rotationMode === mode
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  {mode === "all" ? "All Pages" : "Custom Pages"}
                </button>
              ))}
            </div>
          </div>

          {/* CUSTOM PAGES INPUT */}
          {rotationMode === "custom" && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <label className="text-xs font-semibold text-zinc-500">Page Numbers</label>
              <input
                type="text"
                value={customPages}
                onChange={(e) => handleCustomPagesChange(e.target.value)}
                className="w-full px-3 py-2 bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none transition-all"
                placeholder="e.g., 1,3,5 or 1-5"
              />
              <p className="text-xs text-zinc-400">Examples: 1,3,5 or 1-5 or 1,3-5,8</p>
            </div>
          )}

          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

          {/* ROTATION ANGLE SELECTOR */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Rotation Angle</label>
            <div className="grid grid-cols-3 gap-3">
              {ROTATION_ANGLES.map((rot) => (
                <button
                  key={rot.value}
                  type="button"
                  onClick={() => handleAngleChange(rot.value)}
                  className={`flex flex-col items-center justify-center py-2 rounded-xl border transition-all cursor-pointer ${
                    selectedAngle === rot.value
                      ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400 font-semibold"
                      : "bg-transparent border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400"
                  }`}
                >
                  <span className="text-3xl mb-1">{rot.icon}</span>
                  <span className="text-xs">{rot.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ROTATION SUMMARY */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="text-xs font-semibold text-zinc-500 mb-1">Current Settings</div>
            <div className="text-sm text-zinc-700 dark:text-zinc-300 font-mono">
              {file.settings.rotations || "all:90"}
            </div>
          </div>
        </div>

        {/* PREVIEW COLUMN */}
        <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-xl p-1 border border-zinc-100 dark:border-zinc-800/50">
          {file.originalFile && (
            <PdfRotateViewer 
              file={file.originalFile} 
              settings={file.settings} 
              primaryColor={config.primaryColor} 
            />
          )}
        </div>
      </div>
    </div>
  );
};