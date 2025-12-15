import { useState, useEffect } from "react";
import { PdfWatermarkViewer } from "./PdfWatermarkViewer";
import { RangeSlider } from "@/components/Shared/RangeSlider";
import { CancelSvg } from "@/components/Svg/CommonSvg";
import { PDFToImageSVg } from "@/components/Svg/PdfSvg";
import { UploadSvg } from "@/components/Svg/ToolsSvg";
import type { PdfProcessedFile, PdfFileSettings, PdfToolConfig } from "@/services/pdfService/types";

interface PdfWatermarkFileItemProps {
  file: PdfProcessedFile;
  config: PdfToolConfig;
  updateSettings: (id: string, settings: PdfFileSettings) => void;
  removeFile: (id: string) => void;
  isDark: boolean;
}

// MATCHING BACKEND COLORS EXACTLY
const BACKEND_COLORS = [
  { value: "gray", label: "Gray", hex: "#808080" },
  { value: "black", label: "Black", hex: "#000000" },
  { value: "white", label: "White", hex: "#FFFFFF" },
  { value: "red", label: "Red", hex: "#EF4444" },
  { value: "blue", label: "Blue", hex: "#3B82F6" },
  { value: "green", label: "Green", hex: "#10B981" },
  { value: "yellow", label: "Yellow", hex: "#EAB308" },
  { value: "orange", label: "Orange", hex: "#F97316" },
  { value: "purple", label: "Purple", hex: "#A855F7" },
];

const POSITIONS = [
  { value: "top_left", icon: "↖", label: "Top Left" },
  { value: "top_right", icon: "↗", label: "Top Right" },
  { value: "center", icon: "⊙", label: "Center" },
  { value: "bottom_left", icon: "↙", label: "Bot Left" },
  { value: "bottom_right", icon: "↘", label: "Bot Right" },
];

export const PdfWatermarkFileItem = ({
  file,
  config,
  updateSettings,
  removeFile,
  isDark,
}: PdfWatermarkFileItemProps) => {
  const [activeTab, setActiveTab] = useState<"text" | "image">("text");

  // Sync tab with file state
  useEffect(() => {
    setActiveTab(file.settings.watermarkFile ? "image" : "text");
  }, [file.settings.watermarkFile]);

  // Handlers
  const handleTabChange = (type: "text" | "image") => {
    setActiveTab(type);
    if (type === "text") updateSettings(file.id, { watermarkFile: undefined });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${["B", "KB", "MB"][i]}`;
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
          {/* TABS */}
          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
            {["text", "image"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleTabChange(type as "text" | "image")}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
                  activeTab === type
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 "
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                {type === "text" ? "Text" : "Image"}
              </button>
            ))}
          </div>

          {/* TEXT CONTROLS */}
          {activeTab === "text" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <input
                type="text"
                value={file.settings.text || "CONFIDENTIAL"}
                onChange={(e) => updateSettings(file.id, { text: e.target.value })}
                className="w-full px-3 py-2 bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none transition-all"
                placeholder="Watermark Text"
              />
              
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {BACKEND_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => updateSettings(file.id, { color: c.value })}
                      className={`w-7 h-7 rounded-full border flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                        file.settings.color === c.value ? "ring-2 ring-offset-2 ring-purple-500 scale-105 border-transparent" : "border-zinc-200 dark:border-zinc-700"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    >
                      {c.value === "white" && file.settings.color === "white" && <span className="text-black text-xs">✓</span>}
                      {c.value !== "white" && file.settings.color === c.value && <span className="text-white text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <RangeSlider label="Size" value={file.settings.font_size || 50} min={10} max={150} step={5} color={config.primaryColor} onChange={(v) => updateSettings(file.id, { font_size: v })} unit="pt" />
                <RangeSlider label="Rotate" value={file.settings.rotation || 45} min={0} max={360} step={15} color={config.primaryColor} onChange={(v) => updateSettings(file.id, { rotation: v })} unit="°" />
              </div>
            </div>
          )}

          {/* IMAGE CONTROLS */}
          {activeTab === "image" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                {file.settings.watermarkFile ? (
                   <p className="text-sm font-medium text-green-600">✅ {(file.settings.watermarkFile as File).name}</p>
                ) : (
                   <div className="text-center">
                    <div className="w-14 h-14 mx-auto mb-1 text-zinc-600 dark:text-zinc-300">
                      <UploadSvg/>
                    </div>
                    <p className="text-sm text-zinc-500">Upload Image</p></div>
                )}
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && updateSettings(file.id, { watermarkFile: e.target.files[0] })} className="hidden" />
              </label>
              <RangeSlider label="Rotate" value={file.settings.rotation || 0} min={0} max={360} step={15} color={config.primaryColor} onChange={(v) => updateSettings(file.id, { rotation: v })} unit="°" />
            </div>
          )}

          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

          {/* COMMON CONTROLS */}
          <div className="space-y-4">
            <RangeSlider label="Opacity" value={file.settings.opacity || 0.3} min={0.1} max={1} step={0.1} color={config.primaryColor} onChange={(v) => updateSettings(file.id, { opacity: v })} unit="" />
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500">Position</label>
              <div className="grid grid-cols-3 gap-2">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos.value}
                    type="button" 
                    onClick={() => updateSettings(file.id, { position: pos.value as any })}
                    className={`flex flex-col items-center justify-center py-2 rounded-xl border transition-all cursor-pointer ${
                      file.settings.position === pos.value 
                        ? "bg-purple-50 border-purple-200 text-purple-600 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400 font-medium" 
                        : "bg-transparent border-zinc-200 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400"
                    }`}
                  >
                    <span className="text-xl mb-1">{pos.icon}</span>
                    <span className="text-[10px] uppercase tracking-wide">{pos.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PREVIEW COLUMN */}
        <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-xl p-1 border border-zinc-100 dark:border-zinc-800/50">
           {file.originalFile && (
              <PdfWatermarkViewer file={file.originalFile} settings={file.settings} primaryColor={config.primaryColor} />
           )}
        </div>
      </div>
    </div>
  );
};