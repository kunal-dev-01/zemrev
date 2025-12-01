// ============================================================================
// FILE: src/components/ConversionSettings.tsx
// PURPOSE: Format and quality settings
// ============================================================================

"use client";

import { ConversionSettings as Settings, OutputFormat } from "@/services/imageService/types";

interface Props {
  settings: Settings;
  onChange: (settings: Partial<Settings>) => void;
  disabled?: boolean;
  targetFormat?: OutputFormat; // For slug pages
}

const FORMATS: { value: OutputFormat; label: string }[] = [
  { value: "jpeg", label: "JPEG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WebP" },
  { value: "avif", label: "AVIF" },
  { value: "gif", label: "GIF" },
  { value: "bmp", label: "BMP" },
  { value: "tiff", label: "TIFF" },
  { value: "heic", label: "HEIC" },
  { value: "heif", label: "HEIF" },
];

export const ConversionSettings = ({ 
  settings, 
  onChange, 
  disabled = false,
  targetFormat 
}: Props) => {
  
  return (
    <div className="w-full mt-6 p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40">
      
      <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
        Conversion Settings
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Format Selector */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Output Format
          </label>
          <select
            value={targetFormat || settings.format}
            onChange={(e) => onChange({ format: e.target.value as OutputFormat })}
            disabled={disabled || !!targetFormat}
            className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {FORMATS.map((fmt) => (
              <option key={fmt.value} value={fmt.value}>
                {fmt.label}
              </option>
            ))}
          </select>
          {targetFormat && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Format locked by page
            </p>
          )}
        </div>
        
        {/* Quality Slider */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Quality: {settings.quality}%
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={settings.quality}
            onChange={(e) => onChange({ quality: parseInt(e.target.value) })}
            disabled={disabled}
            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            <span>Lower size</span>
            <span>Higher quality</span>
          </div>
        </div>
        
      </div>
      
    </div>
  );
};