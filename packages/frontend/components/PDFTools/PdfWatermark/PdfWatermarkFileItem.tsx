import { useState, useEffect } from "react";
import { PdfWatermarkViewer } from "./PdfWatermarkViewer";
import { RangeSlider } from "@/components/Shared/RangeSlider";
import { CheckSvg } from "@/components/Svg/CommonSvg";
import { UploadSvg } from "@/components/Svg/ToolsSvg";
import type {
  PdfProcessedFile,
  PdfFileSettings,
  PdfToolConfig,
} from "@/services/pdfService/types";
import {
  FileInfo,
  RemoveButton,
  ToolIconBadge,
} from "@/components/Shared/FileUI";

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

  return (
    <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all">
      {/* HEADER */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
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

          {/* TEXT CONTROLS */}
          {activeTab === "text" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={file.settings.text || "CONFIDENTIAL"}
                  onChange={(e) =>
                    updateSettings(file.id, { text: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none transition-all"
                  placeholder="Watermark Text"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500">
                  Text Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {BACKEND_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() =>
                        updateSettings(file.id, { color: c.value })
                      }
                      className={`w-7 h-7 rounded-full border flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                        file.settings.color === c.value
                          ? "ring-2 ring-offset-2 ring-purple-500 scale-105 border-transparent"
                          : "border-zinc-200 dark:border-zinc-700"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    >
                      {c.value === "white" &&
                        file.settings.color === "white" && (
                          <span className="text-black text-xs">✓</span>
                        )}
                      {c.value !== "white" &&
                        file.settings.color === c.value && (
                          <span className="text-white text-xs">✓</span>
                        )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <RangeSlider
                  label="Font Size"
                  value={file.settings.font_size || 50}
                  min={10}
                  max={150}
                  step={5}
                  color={config.primaryColor}
                  onChange={(v) => updateSettings(file.id, { font_size: v })}
                  unit="pt"
                />
                <RangeSlider
                  label="Rotation"
                  value={file.settings.rotation || 45}
                  min={0}
                  max={360}
                  step={15}
                  color={config.primaryColor}
                  onChange={(v) => updateSettings(file.id, { rotation: v })}
                  unit="°"
                />
              </div>
            </div>
          )}

          {/* IMAGE CONTROLS */}
          {activeTab === "image" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                {file.settings.watermarkFile ? (
                  <p className="text-sm font-medium text-green-600 flex items-center gap-1">
                    <CheckSvg /> {(file.settings.watermarkFile as File).name}
                  </p>
                ) : (
                  <div className="text-center">
                    <div className="w-14 h-14 mx-auto mb-1 text-zinc-600 dark:text-zinc-300">
                      <UploadSvg />
                    </div>
                    <p className="text-sm text-zinc-500">
                      Upload Watermark Image
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files?.[0] &&
                    updateSettings(file.id, {
                      watermarkFile: e.target.files[0],
                    })
                  }
                  className="hidden"
                />
              </label>

              <RangeSlider
                label="Rotation"
                value={file.settings.rotation || 0}
                min={0}
                max={360}
                step={15}
                color={config.primaryColor}
                onChange={(v) => updateSettings(file.id, { rotation: v })}
                unit="°"
              />
            </div>
          )}

          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

          {/* COMMON CONTROLS - OPACITY */}
          <RangeSlider
            label="Opacity"
            value={file.settings.opacity || 0.3}
            min={0.1}
            max={1}
            step={0.1}
            color={config.primaryColor}
            onChange={(v) => updateSettings(file.id, { opacity: v })}
            unit=""
          />

          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

          {/* POSITION CONTROLS - COORDINATE BASED */}
          <div className="space-y-4">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Position & Size
            </label>

            <div className="grid grid-cols-2 gap-4">
              <RangeSlider
                label="X Position"
                value={file.settings.x || 150}
                min={0}
                max={600}
                step={10}
                color={config.primaryColor}
                onChange={(v) => updateSettings(file.id, { x: v })}
                unit="pt"
              />
              <RangeSlider
                label="Y Position"
                value={file.settings.y || 350}
                min={0}
                max={800}
                step={10}
                color={config.primaryColor}
                onChange={(v) => updateSettings(file.id, { y: v })}
                unit="pt"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <RangeSlider
                label="Width"
                value={file.settings.width || 300}
                min={50}
                max={500}
                step={10}
                color={config.primaryColor}
                onChange={(v) => updateSettings(file.id, { width: v })}
                unit="pt"
              />
              <RangeSlider
                label="Height"
                value={file.settings.height || 150}
                min={20}
                max={400}
                step={10}
                color={config.primaryColor}
                onChange={(v) => updateSettings(file.id, { height: v })}
                unit="pt"
              />
            </div>
          </div>
        </div>

        {/* PREVIEW COLUMN */}
        <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-xl p-1 border border-zinc-100 dark:border-zinc-800/50">
          {file.originalFile && (
            <PdfWatermarkViewer
              file={file.originalFile}
              settings={file.settings}
            />
          )}
        </div>
      </div>
    </div>
  );
};
