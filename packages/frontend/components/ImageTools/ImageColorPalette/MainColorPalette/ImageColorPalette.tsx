// ImageColorPalette/MainColorPalette/ImageColorPalette.tsx

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { RangeSlider } from "@/components/Shared/RangeSlider";
import { TOOL_CONFIGS } from "@/config/tool.config";
import { RotateSvg } from "@/components/Svg/ToolsSvg";
import { CopySvg, CheckSvg } from "@/components/Svg/CommonSvg";
import { useImagePalette } from "@/hooks/imageHooks/useImagePalette.hook";
import GlassButton from "@/components/Layouts/GlassButton";

const ImageColorPalette = () => {
  const config = TOOL_CONFIGS.palette;
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [numColors, setNumColors] = useState(5);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [savedPalettes, setSavedPalettes] = useState<any[]>([]);

  const {
    file,
    imageUrl,
    extracting,
    error,
    paletteData,
    setImageFile,
    setFromGoogleDrive,
    setFromDropbox,
    setFromUrl,
    extractColorPalette,
    copyColorCode,
    getSavedPalettes,
    deleteSavedPalette,
    clearAllSavedPalettes,
    reset,
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

  // ============================================================================
  // FILE HANDLING
  // ============================================================================
  const handleFilesSelected = useCallback(
    (files: File[]) => {
      if (files.length > 0) {
        setImageFile(files[0]);
      }
    },
    [setImageFile]
  );

  const handleUrlUpload = useCallback(
    async (url: string) => {
      await setFromUrl(url);
    },
    [setFromUrl]
  );

  // ============================================================================
  // EXTRACT PALETTE
  // ============================================================================
  const handleExtract = useCallback(async () => {
    await extractColorPalette(numColors);
  }, [numColors, extractColorPalette]);

  // ============================================================================
  // COPY COLOR
  // ============================================================================
  const handleCopyColor = useCallback(
    (code: string) => {
      copyColorCode(code);
      setCopiedColor(code);
      setTimeout(() => setCopiedColor(null), 2000);
    },
    [copyColorCode]
  );

  // Number of colors presets
  const colorPresets = [
    { label: "3", value: 3 },
    { label: "5", value: 5 },
    { label: "7", value: 7 },
    { label: "10", value: 10 },
  ];

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="w-full md:mt-[1vw] mt-[1vh]">
      {/* Saved Palettes Section */}
      {savedPalettes.length > 0 && !file && (
        <div className="mb-[1vh] md:mb-[1vw] border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="md:text-lg text-md font-semibold text-zinc-800 dark:text-zinc-200">
              Saved Palettes ({savedPalettes.length})
            </h3>
            <button
              onClick={clearAllSavedPalettes}
              className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all duration-200 text-sm font-semibold cursor-pointer"
            >
              Clear All
            </button>
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
                  {palette.data.palette.map((color: any, index: number) => (
                    <div
                      key={index}
                      onClick={() => handleCopyColor(color.hex)}
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
      )}

      {/* Drag & Drop */}
      {!file && (
        <DragDropZone
          config={config}
          onFilesSelected={handleFilesSelected}
          onUrlUpload={() => setUrlModalOpen(true)}
          onGooglePick={() => setFromGoogleDrive}
          onDropboxPick={() => setFromDropbox}
          currentFileCount={0}
        />
      )}

      {/* Palette Interface */}
      {file && imageUrl && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3 md:mt-[1vw] mt-[1vh]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h3 className="md:text-lg text-md font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                {file.name}
              </h3>
              <p className="md:text-sm text-xs text-zinc-600 dark:text-zinc-400">
                Extract dominant colors from image
              </p>
            </div>

            <button
              onClick={reset}
              disabled={extracting}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200 flex items-center gap-2 cursor-pointer"
            >
              <div className="w-5 h-5">
                <RotateSvg />
              </div>
              <span className="md:block hidden">Change Image</span>
            </button>
          </div>

          {/* Image Preview */}
          <div className="relative w-full h-[40vh] dark:bg-zinc-900 bg-zinc-100 rounded-xl overflow-hidden mb-4">
            <Image
              src={imageUrl}
              alt="Preview"
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          {/* Number of Colors Selector */}
          {!paletteData && (
            <div className="mb-6">
              <RangeSlider
                label="Number of Colors"
                value={numColors}
                min={3}
                max={10}
                step={1}
                unit=""
                color={config.primaryColor}
                onChange={setNumColors}
                presets={colorPresets}
                disabled={extracting}
              />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Extract Button */}
          {!paletteData && (
            <GlassButton
              loading={extracting}
              primaryColor={config.primaryColor}
              onClick={handleExtract}
            >
              {extracting ? "Extracting..." : "Extract Color Palette"}
            </GlassButton>
          )}

          {/* Palette Results */}
          {paletteData && (
            <div className="space-y-4">
              {/* Color Distribution Bar */}
              <div className="space-y-3">
                <h4 className="text-sm md:text-md font-semibold text-zinc-800 dark:text-zinc-200">
                  Extracted Colors ({paletteData.total_colors})
                </h4>
                <div className="flex gap-1 h-16 md:h-20 rounded-xl overflow-hidden shadow-md">
                  {paletteData.palette.map((color, index) => (
                    <div
                      key={index}
                      onClick={() => handleCopyColor(color.hex)}
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
                    className="flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-all"
                  >
                    {/* Color Swatch */}
                    <div
                      className="w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl border-2 border-zinc-300 dark:border-zinc-600 shrink-0 shadow-sm"
                      style={{ backgroundColor: color.hex }}
                    />

                    {/* Color Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-semibold text-xs md:text-base text-zinc-800 dark:text-zinc-200 truncate">
                          {color.hex}
                        </span>
                        <button
                          onClick={() => handleCopyColor(color.hex)}
                          className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-all duration-200 cursor-pointer shrink-0"
                          title="Copy HEX"
                        >
                          <div className="w-3.5 h-3.5 md:w-4 md:h-4">
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
                onClick={reset}
                className="w-full px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg active:scale-95 cursor-pointer"
                style={{ backgroundColor: config.primaryColor }}
              >
                Extract From Another Image
              </button>
            </div>
          )}
        </div>
      )}

      {/* URL Upload Modal */}
      <UrlUploadModal
        isOpen={urlModalOpen}
        onClose={() => setUrlModalOpen(false)}
        onSubmit={handleUrlUpload}
        config={config}
      />
    </div>
  );
};

export default ImageColorPalette;