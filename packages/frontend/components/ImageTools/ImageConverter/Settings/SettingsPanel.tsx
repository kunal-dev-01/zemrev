// components/ImageTools/ImageConverter/Settings/SettingsPanel.tsx

import { ToggleSwitch } from "@/components/Shared/ToggleSwitch";
import type {
  FileSettings,
  ProcessedFile,
  ToolConfig,
} from "@/services/imageService/types";

interface SettingsPanelProps {
  file: ProcessedFile;
  config: ToolConfig;
  isClosing: boolean;
  onUpdateSettings: (settings: FileSettings) => void;
  onClose: () => void;
}

const FORMATS = [
  { value: "jpeg", label: "JPEG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WEBP" },
  { value: "avif", label: "AVIF" },
  { value: "tiff", label: "TIFF" },
  { value: "heic", label: "HEIC" },
  { value: "heif", label: "HEIF" },
];

const QUALITY_OPTIONS = [
  { value: 100, label: "Maximum", desc: "Best quality" },
  { value: 90, label: "High", desc: "Recommended" },
  { value: 80, label: "Good", desc: "Balanced" },
  { value: 70, label: "Medium", desc: "Smaller size" },
  { value: 60, label: "Low", desc: "Web optimized" },
  { value: 50, label: "Very Low", desc: "Minimal size" },
];

export const SettingsPanel = ({
  file,
  config,
  isClosing,
  onUpdateSettings,
  onClose,
}: SettingsPanelProps) => {
  const currentFileFormat = file.name.split(".").pop()?.toLowerCase() || "";

  const availableFormats = FORMATS.filter(
    (format) =>
      format.value !== currentFileFormat &&
      format.value !== currentFileFormat.replace("jpg", "jpeg")
  );

  const showQuality = ["jpeg", "jpg", "webp", "avif"].includes(
    file.settings.format!
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isClosing ? "fade-out" : "fade-in"
      }`}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden ${
          isClosing ? "fade-out" : "fade-in"
        }`}
        style={{
          width: "100%",
          maxWidth: "800px",
          maxHeight: "500px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 space-y-6">
          {/* Format Selection */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {availableFormats.map((format) => (
              <button
                key={format.value}
                onClick={() => {
                  onUpdateSettings({ format: format.value } as FileSettings);
                }}
                className={`px-3 py-2 rounded-xl text-sm font-bold transition-all border ${
                  file.settings.format === format.value
                    ? "text-white"
                    : "text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                }`}
                style={{
                  backgroundColor:
                    file.settings.format === format.value
                      ? config.primaryColor
                      : undefined,
                  borderColor:
                    file.settings.format === format.value
                      ? config.primaryColor
                      : undefined,
                }}
              >
                {format.label}
              </button>
            ))}
          </div>

          {/* Quality Selection */}
          {showQuality && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
              {QUALITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onUpdateSettings({ quality: option.value });
                  }}
                  className={`px-3 py-2 rounded-xl text-sm font-medium text-left transition-all flex items-center justify-between border ${
                    file.settings.quality === option.value
                      ? "text-white"
                      : "text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  }`}
                  style={{
                    backgroundColor:
                      file.settings.quality === option.value
                        ? config.primaryColor
                        : undefined,
                    borderColor:
                      file.settings.quality === option.value
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
                  <span className="text-sm font-bold">{option.value}%</span>
                </button>
              ))}
            </div>
          )}

          {/* Strip Metadata Toggle */}
          <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-1">
            <ToggleSwitch
              checked={file.settings.stripMetadata ?? true}
              onChange={(value) => onUpdateSettings({ stripMetadata: value })}
              label="Strip Metadata"
              description="Remove EXIF, GPS, and other metadata"
              color={config.primaryColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
