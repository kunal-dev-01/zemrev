// components/ImageTools/ImageResizer/Shared/ResizerSettingsPanel.tsx

import { ChevronDownSvg } from "@/components/Svg/CommonSvg";
import type { FileSettings, ProcessedFile, ToolConfig, ResizeMode } from "@/services/imageService/types";
import { useState, useRef, useEffect } from "react";

interface ResizerSettingsPanelProps {
  file: ProcessedFile;
  config: ToolConfig;
  isClosing: boolean;
  onUpdateSettings: (settings: FileSettings) => void;
  onClose: () => void;
}

const RESIZE_MODES = [
  { value: "contain", label: "Contain", desc: "Fit within dimensions" },
  { value: "cover", label: "Cover", desc: "Fill dimensions (crop)" },
  { value: "stretch", label: "Stretch", desc: "Force exact size" },
  { value: "exact", label: "Exact", desc: "Exact dimensions" },
];

const PRESETS = [
  { label: "200x200", width: 200, height: 200 },
  { label: "500x500", width: 500, height: 500 },
  { label: "1024x1024", width: 1024, height: 1024 },
  { label: "1920x1080", width: 1920, height: 1080 },
  { label: "Custom", width: null, height: null },
];

export const ResizerSettingsPanel = ({
  file,
  config,
  isClosing,
  onUpdateSettings,
  onClose,
}: ResizerSettingsPanelProps) => {
  const [isModeOpen, setIsModeOpen] = useState(false);
  const modeRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modeRef.current && !modeRef.current.contains(e.target as Node)) {
        setIsModeOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isClosing ? "fade-out" : "fade-in"
      }`}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden transition-all duration-300 ${
          isClosing ? "fade-out" : "fade-in"
        }`}
        style={{ width: "100%", maxWidth: "600px", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          /* REMOVE NUMBER INPUT ARROWS */
          input[type=number]::-webkit-inner-spin-button,
          input[type=number]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type=number] {
            -moz-appearance: textfield;
          }
        `}</style>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[90vh]">

          {/* ---------- PRESETS ---------- */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Quick Presets</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() =>
                    preset.width && preset.height &&
                    onUpdateSettings({ width: preset.width, height: preset.height })
                  }
                  className={`px-3 py-2 rounded-xl text-sm font-bold border transition-all ${
                    file.settings.width === preset.width && file.settings.height === preset.height
                      ? "text-white"
                      : "text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  }`}
                  style={{
                    backgroundColor:
                      file.settings.width === preset.width && file.settings.height === preset.height
                        ? config.primaryColor
                        : undefined,
                    borderColor:
                      file.settings.width === preset.width && file.settings.height === preset.height
                        ? config.primaryColor
                        : undefined,
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* ---------- WIDTH & HEIGHT ---------- */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold mb-2 block">Width (px)</label>
              <input
                type="number"
                value={file.settings.width || ""}
                onChange={(e) => onUpdateSettings({ width: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm outline-none"
                placeholder="1920"
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Height (px)</label>
              <input
                type="number"
                value={file.settings.height || ""}
                onChange={(e) => onUpdateSettings({ height: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm outline-none"
                placeholder="1080"
              />
            </div>
          </div>

          {/* ---------- RESIZE MODE DROPDOWN ---------- */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Resize Mode</label>

            <div ref={modeRef} className="relative">
              <button
                onClick={() => setIsModeOpen(!isModeOpen)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm flex items-center justify-between"
              >
                <span className="font-medium capitalize">{file.settings.mode}</span>
                <ChevronDownSvg />
              </button>

              {/* Animated dropdown */}
              <div
                className={`
                  mt-1 overflow-hidden rounded-xl transition-all duration-300 ease-in-out
                  ${isModeOpen ? "max-h-64 p-2 border border-zinc-200 dark:border-zinc-700"
                               : "max-h-0 p-0 border-transparent"}
                `}
              >
                <div className="space-y-1">
                  {RESIZE_MODES.map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => {
                        onUpdateSettings({ mode: mode.value as ResizeMode });
                        setIsModeOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-sm text-left transition-all ${
                        file.settings.mode === mode.value
                          ? "text-white"
                          : "text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      }`}
                      style={{
                        backgroundColor: file.settings.mode === mode.value ? config.primaryColor : undefined,
                        borderColor: file.settings.mode === mode.value ? config.primaryColor : undefined,
                      }}
                    >
                      <div className="font-bold">{mode.label}</div>
                      <div className="text-xs opacity-80">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div> 
      </div>
    </div>
  );
};
