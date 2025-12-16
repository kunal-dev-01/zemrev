// ImageColorPalette/MainColorPalette/SavedPalettesSection.tsx

import { useState, useEffect } from "react";
import { useImagePalette } from "@/hooks/imageHooks/useImagePalette.hook";
import { ClearAllButton } from "@/components/Shared/FileUI";

interface ColorData {
  hex: string;
  percentage: number;
}

interface PaletteData {
  total_colors: number;
  palette: ColorData[];
}

interface SavedPalette {
  id: string;
  filename: string;
  timestamp: number;
  data: PaletteData;
}

interface SavedPalettesSectionProps {
  onCopyColor: (code: string) => void;
}

export const SavedPalettesSection = ({ onCopyColor }: SavedPalettesSectionProps) => {
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);
  
  const {
    file,
    getSavedPalettes,
    deleteSavedPalette,
    clearAllSavedPalettes,
  } = useImagePalette();

  // Load saved palettes on mount and when updated
  useEffect(() => {
    const loadSaved = () => {
      setSavedPalettes(getSavedPalettes());
    };
    
    loadSaved();
    
    window.addEventListener('savedPalettesUpdated', loadSaved);
    return () => window.removeEventListener('savedPalettesUpdated', loadSaved);
  }, [getSavedPalettes]);

  // Don't show if no file is selected or no saved palettes
  if (file || savedPalettes.length === 0) {
    return null;
  }

  return (
    <div className="mt-[1vh] md:mt-[1vw] border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="md:text-lg text-md font-semibold text-zinc-800 dark:text-zinc-200">
          Saved Palettes ({savedPalettes.length})
        </h3>
        <ClearAllButton onClick={clearAllSavedPalettes} />
      </div>

      <div className="space-y-3">
        {savedPalettes.map((palette) => (
          <div
            key={palette.id}
            className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 md:p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm md:text-base font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  {palette.filename}
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {new Date(palette.timestamp).toLocaleString()} • {palette.data.total_colors} colors
                </p>
              </div>
              <button
                onClick={() => deleteSavedPalette(palette.id)}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200 text-sm shrink-0 cursor-pointer"
              >
                Remove
              </button>
            </div>

            {/* Color Bar */}
            <div className="flex gap-0.5 h-12 md:h-14 rounded-lg overflow-hidden shadow-sm">
              {palette.data.palette.map((color, index) => (
                <div
                  key={index}
                  onClick={() => onCopyColor(color.hex)}
                  className="relative cursor-pointer group"
                  style={{
                    backgroundColor: color.hex,
                    flex: `${color.percentage} 1 0%`,
                  }}
                  title={`${color.hex} - ${color.percentage}% (Click to copy)`}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 text-white px-1">
                    <span className="text-xs font-mono font-bold">
                      {color.hex}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};