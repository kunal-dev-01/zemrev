// ImageColorPalette/MainColorPalette/PaletteResults.tsx

import { CheckSvg, CopySvg } from "@/components/Svg/CommonSvg";

export interface ColorData {
  hex: string;
  rgb: [number, number, number];
  percentage: number;
}

interface PaletteData {
  total_colors: number;
  palette: ColorData[];
}

interface ToolConfig {
  primaryColor: string;
}


interface PaletteResultsProps {
  paletteData: PaletteData;
  config: ToolConfig;
  onCopyColor: (code: string) => void;
  copiedColor: string | null;
  onReset: () => void;
}

export const PaletteResults = ({ 
  paletteData, 
  config, 
  onCopyColor, 
  copiedColor, 
  onReset 
}: PaletteResultsProps) => {
  return (
    <div className="space-y-4">
      {/* Color Distribution Bar */}
      <div className="space-y-3">
        <h4 className="text-sm md:text-md font-semibold text-zinc-800 dark:text-zinc-200">
          Extracted Colors ({paletteData.total_colors})
        </h4>
        <div className="flex gap-1 h-16 md:h-20 rounded-xl overflow-hidden">
          {paletteData.palette.map((color, index) => (
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
              {/* Tooltip on hover */}
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 text-white px-2">
                <span className="text-xs md:text-sm font-mono font-bold">
                  {color.hex}
                </span>
                <span className="text-xs font-semibold mt-1">
                  {color.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Color Details */}
      <div className="space-y-3">
        <h4 className="text-sm md:text-md font-semibold text-zinc-800 dark:text-zinc-200">
          Color Details
        </h4>

        {paletteData.palette.map((color, index) => (
          <div
            key={index}
            className="flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent relative group cursor-pointer"
          >
            <div className="scale-85 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 ease-in-out absolute inset-0 -z-10 rounded-xl cursor-pointer dark:bg-zinc-900 bg-zinc-200" />

            {/* Color Swatch */}
            <div
              className="w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl border-2 border-zinc-300 dark:border-zinc-600 shrink-0"
              style={{ backgroundColor: color.hex }}
            />

            {/* Color Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-semibold text-xs md:text-base text-zinc-800 dark:text-zinc-200 truncate">
                  {color.hex}
                </span>
                <button
                  onClick={() => onCopyColor(color.hex)}
                  className="cursor-pointer"
                  title="Copy HEX"
                >
                  <div className="w-5 h-5 transition-all duration-200">
                    {copiedColor === color.hex ? (
                      <CheckSvg />
                    ) : (
                      <CopySvg />
                    )}
                  </div>
                </button>
              </div>
              <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-mono truncate">
                  RGB({color.rgb[0]}, {color.rgb[1]}, {color.rgb[2]})
                </span>
                <span className="font-semibold shrink-0">
                  {color.percentage}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Extract Again Button */}
      <button
        onClick={onReset}
        className="w-full px-6 py-2 rounded-xl font-semibold text-white transition-all cursor-pointer"
        style={{ backgroundColor: config.primaryColor }}
      >
        Extract From Another Image
      </button>
    </div>
  );
};