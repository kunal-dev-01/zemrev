import { useState, useEffect } from "react";
import { PdfRotateViewer } from "./PdfRotateViewer";
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
import { InputField } from "@/components/Layouts/InputField";

interface PdfRotateFileItemProps {
  file: PdfProcessedFile;
  config: PdfToolConfig;
  updateSettings: (id: string, settings: PdfFileSettings) => void;
  removeFile: (id: string) => void;
  isDark: boolean;
}

// Added "Normal (0)" option
const ROTATION_ANGLES = [
  { label: "Normal", value: 0, icon: "—" },
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
  const [customPages, setCustomPages] = useState("1,2,3");
  
  // LOGIC: Initialize state from the actual file settings
  const getInitialAngle = () => {
    const rotations = file.settings.rotations || "all:0";
    const parts = rotations.split(":");
    if (parts.length === 2) {
      return parseInt(parts[1]) || 0;
    }
    return 0;
  };

  const [selectedAngle, setSelectedAngle] = useState(getInitialAngle());

  // Update local state if file settings change externally (optional but good practice)
  useEffect(() => {
    setSelectedAngle(getInitialAngle());
  }, [file.settings.rotations]);

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
    // When switching modes, re-apply the currently selected angle
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
          {/* MODE SELECTOR */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Rotation Mode
            </label>
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
              {["all", "custom"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleModeChange(mode as "all" | "custom")}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
                    rotationMode === mode
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
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

          {/* ROTATION ANGLE SELECTOR */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Rotation Angle
            </label>
            {/* Grid changed to 4 columns to accommodate 0 degree option */}
            <div className="grid grid-cols-4 gap-2">
              {ROTATION_ANGLES.map((rot) => (
                <button
                  key={rot.value}
                  type="button"
                  onClick={() => handleAngleChange(rot.value)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all cursor-pointer ${
                    selectedAngle === rot.value
                      ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400 font-semibold"
                      : "bg-transparent border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400"
                  }`}
                >
                  <span className="text-2xl mb-1">{rot.icon}</span>
                  <span className="text-[10px] sm:text-xs whitespace-nowrap">{rot.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ROTATION SUMMARY */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="text-xs font-semibold text-zinc-500 mb-1">
              Current Settings
            </div>
            <div className="text-sm text-zinc-700 dark:text-zinc-300 font-mono break-all">
              {file.settings.rotations || "all:0"}
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