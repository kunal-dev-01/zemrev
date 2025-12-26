import { useState, useEffect, useCallback } from "react";
import { PdfRotateViewer } from "./PdfRotateViewer";
import type {
  PdfProcessedFile,
  PdfFileSettings,
  PdfToolConfig,
} from "@/services/pdfService/types";
import {
  FileError,
  FileInfo,
  RemoveButton,
  ToolIconBadge,
} from "@/components/Shared/FileUI";
import { InputField } from "@/components/Layouts/InputField";

interface PdfRotateFileItemProps {
  file: PdfProcessedFile;
  config: PdfToolConfig;
  updateSettings: (id: string, settings: PdfFileSettings) => void;
  removeFile: (id: string) => void;
  isDark: boolean;
}

const ROTATION_ANGLES = [
  { label: "Normal", value: 0, icon: "—" },
  { label: "90° CW", value: 90, icon: "↻" },
  { label: "180°", value: 180, icon: "↻↻" },
  { label: "270° CCW", value: 270, icon: "↺" },
];

const getInitialAngle = (rotations: string | undefined): number => {
  if (!rotations) return 0;
  const parts = rotations.split(":");
  return parts.length === 2 ? parseInt(parts[1]) || 0 : 0;
};

export const PdfRotateFileItem = ({
  file,
  config,
  updateSettings,
  removeFile,
  isDark,
}: PdfRotateFileItemProps) => {
  const [rotationMode, setRotationMode] = useState<"all" | "custom">("all");
  const [customPages, setCustomPages] = useState("1,2,3");
  const [selectedAngle, setSelectedAngle] = useState(() =>
    getInitialAngle(file.settings.rotations)
  );

  // Sync angle when file settings change externally
  useEffect(() => {
    setSelectedAngle(getInitialAngle(file.settings.rotations));
  }, [file.settings.rotations]);

  // Handle angle change
  const handleAngleChange = useCallback(
    (angle: number) => {
      setSelectedAngle(angle);
      const rotationValue =
        rotationMode === "all" ? `all:${angle}` : `${customPages}:${angle}`;
      updateSettings(file.id, { rotations: rotationValue });
    },
    [rotationMode, customPages, file.id, updateSettings]
  );

  // Handle mode change
  const handleModeChange = useCallback(
    (mode: "all" | "custom") => {
      setRotationMode(mode);
      const rotationValue =
        mode === "all"
          ? `all:${selectedAngle}`
          : `${customPages}:${selectedAngle}`;
      updateSettings(file.id, { rotations: rotationValue });
    },
    [selectedAngle, customPages, file.id, updateSettings]
  );

  // Handle custom pages change
  const handleCustomPagesChange = useCallback(
    (pages: string) => {
      setCustomPages(pages);
      if (rotationMode === "custom") {
        updateSettings(file.id, { rotations: `${pages}:${selectedAngle}` });
      }
    },
    [rotationMode, selectedAngle, file.id, updateSettings]
  );

  return (
    <div className="border border-zinc-200 dark:border-zinc-900 rounded-2xl overflow-hidden transition-all">
      {/* Header */}
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

      {/* Content */}
      <div className="p-4 grid md:grid-cols-2 gap-6">
        {/* Left: Controls (Bottom on mobile) */}
        <div className="space-y-5 order-2 md:order-1">
          {/* Rotation Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Rotation Mode
            </label>
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900/50 rounded-lg">
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

          {/* Custom Pages Input */}
          {rotationMode === "custom" && (
            <div className="space-y-2 fade-in duration-300">
              <InputField
                label="PAGE NUMBERS"
                type="text"
                value={customPages}
                onChange={handleCustomPagesChange}
                placeholder="e.g., 1,3,5 or 1-5"
              />
            </div>
          )}

          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

          {/* Rotation Angle Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Rotation Angle
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ROTATION_ANGLES.map((rot) => (
                <button
                  key={rot.value}
                  type="button"
                  onClick={() => handleAngleChange(rot.value)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all cursor-pointer ${
                    selectedAngle === rot.value
                      ? "bg-rose-50 border-[#DB2777] text-[#DB2777] dark:bg-[#DB2777]/10 font-medium"
                      : "bg-transparent border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-900 dark:border-zinc-900 dark:text-zinc-400"
                  }`}
                >
                  <span className="text-2xl mb-1">{rot.icon}</span>
                  <span className="text-[10px] sm:text-xs whitespace-nowrap">
                    {rot.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Rotation Summary */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-900">
            <div className="text-xs font-semibold text-zinc-500 mb-1">
              Current Settings
            </div>
            <div className="text-sm text-zinc-700 dark:text-zinc-300 font-mono break-all">
              {file.settings.rotations || "all:0"}
            </div>
          </div>

          {file.error && <FileError error={file.error} className="mt-3" />}
        </div>

        {/* Right: Preview (Top on mobile) */}
        <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-xl p-1 border border-zinc-100 dark:border-zinc-800/50 order-1 md:order-2">
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
