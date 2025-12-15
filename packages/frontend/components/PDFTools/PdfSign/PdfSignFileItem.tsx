import { useState, useEffect } from "react";
import { PdfSignViewer } from "./PdfSignViewer";
import { RangeSlider } from "@/components/Shared/RangeSlider";
import { CancelSvg } from "@/components/Svg/CommonSvg";
import { PDFToImageSVg } from "@/components/Svg/PdfSvg";
import { UploadSvg } from "@/components/Svg/ToolsSvg";
import type { PdfProcessedFile, PdfFileSettings, PdfToolConfig } from "@/services/pdfService/types";

interface PdfSignFileItemProps {
  file: PdfProcessedFile;
  config: PdfToolConfig;
  updateSettings: (id: string, settings: PdfFileSettings) => void;
  removeFile: (id: string) => void;
  isDark: boolean;
}

export const PdfSignFileItem = ({
  file,
  config,
  updateSettings,
  removeFile,
  isDark,
}: PdfSignFileItemProps) => {
  const [activeTab, setActiveTab] = useState<"text" | "image">("text");

  // Sync tab with file state
  useEffect(() => {
    setActiveTab(file.settings.signatureFile ? "image" : "text");
  }, [file.settings.signatureFile]);

  // Handlers
  const handleTabChange = (type: "text" | "image") => {
    setActiveTab(type);
    if (type === "text") updateSettings(file.id, { signatureFile: undefined });
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
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                {type === "text" ? "Text" : "Image"}
              </button>
            ))}
          </div>

          {/* TEXT SIGNATURE CONTROLS */}
          {activeTab === "text" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500">Signature Text</label>
                <input
                  type="text"
                  value={file.settings.signature_text || "John Doe"}
                  onChange={(e) => updateSettings(file.id, { signature_text: e.target.value })}
                  className="w-full px-3 py-2 bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none transition-all"
                  placeholder="Enter signature text"
                />
              </div>
            </div>
          )}

          {/* IMAGE SIGNATURE CONTROLS */}
          {activeTab === "image" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                {file.settings.signatureFile ? (
                  <p className="text-sm font-medium text-green-600">✅ {(file.settings.signatureFile as File).name}</p>
                ) : (
                  <div className="text-center">
                    <div className="w-14 h-14 mx-auto mb-1 text-zinc-600 dark:text-zinc-300">
                      <UploadSvg />
                    </div>
                    <p className="text-sm text-zinc-500">Upload Signature Image</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => e.target.files?.[0] && updateSettings(file.id, { signatureFile: e.target.files[0] })} 
                  className="hidden" 
                />
              </label>
            </div>
          )}

          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

          {/* POSITION CONTROLS */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <RangeSlider 
                label="X Position" 
                value={file.settings.x ?? 50} 
                min={0} 
                max={400} 
                step={10} 
                color={config.primaryColor} 
                onChange={(v) => updateSettings(file.id, { x: v })} 
                unit="pt" 
              />
              <RangeSlider 
                label="Y Position" 
                value={file.settings.y ?? 700} 
                min={0} 
                max={760} 
                step={10} 
                color={config.primaryColor} 
                onChange={(v) => updateSettings(file.id, { y: v })} 
                unit="pt" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <RangeSlider 
                label="Width" 
                value={file.settings.width || 200} 
                min={50} 
                max={400} 
                step={10} 
                color={config.primaryColor} 
                onChange={(v) => updateSettings(file.id, { width: v })} 
                unit="pt" 
              />
              <RangeSlider 
                label="Height" 
                value={file.settings.height || 80} 
                min={20} 
                max={200} 
                step={10} 
                color={config.primaryColor} 
                onChange={(v) => updateSettings(file.id, { height: v })} 
                unit="pt" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500">Page Number</label>
              <input
                type="number"
                value={file.settings.page || 0}
                onChange={(e) => updateSettings(file.id, { page: parseInt(e.target.value) || 0 })}
                min={0}
                className="w-full px-3 py-2 bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none transition-all"
                placeholder="0 = First Page"
              />
              <p className="text-xs text-zinc-400">0 = First page, 1 = Second page, etc.</p>
            </div>
          </div>
        </div>

        {/* PREVIEW COLUMN */}
        <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-xl p-1 border border-zinc-100 dark:border-zinc-800/50">
          {file.originalFile && (
            <PdfSignViewer 
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