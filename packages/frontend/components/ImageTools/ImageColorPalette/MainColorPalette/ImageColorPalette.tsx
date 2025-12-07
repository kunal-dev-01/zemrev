// ============================================================================
// FILE: ImageColorPalette/MainColorPalette/ImageColorPalette.tsx
// ============================================================================

"use client";

import { useState, useCallback } from "react";
import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { TOOL_CONFIGS } from "@/config/tool.config";
import { Spinner } from "@/components/Layouts/Spinner";
import { RotateSvg } from "@/components/Svg/ToolsSvg";
import { CopySvg, CheckSvg } from "@/components/Svg/CommonSvg";
import { useImagePalette } from "@/hooks/imageHooks/useImagePalette.hook";
import Image from "next/image";

const ImageColorPalette = () => {
  const config = TOOL_CONFIGS.palette;
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [numColors, setNumColors] = useState(5);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const {
    file,
    imageUrl,
    extracting,
    error,
    paletteData,
    setImageFile,
    setFromUrl,
    extractColorPalette,
    copyColorCode,
    reset,
  } = useImagePalette();

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
  const handleCopyColor = useCallback((code: string) => {
    copyColorCode(code);
    setCopiedColor(code);
    setTimeout(() => setCopiedColor(null), 2000);
  }, [copyColorCode]);

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="w-full space-y-6 md:mt-[1vw] mt-[1vh]">
      {/* Drag & Drop (shown when no file) */}
      {!file && (
        <DragDropZone
          config={config}
          onFilesSelected={handleFilesSelected}
          onUrlUpload={() => setUrlModalOpen(true)}
          currentFileCount={0}
        />
      )}

      {/* Palette Interface */}
      {file && imageUrl && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                {file.name}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Extract dominant colors from image
              </p>
            </div>

            <button
              onClick={reset}
              disabled={extracting}
              className="px-4 py-1.5 flex items-center gap-2 rounded-lg font-medium border border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 disabled:opacity-50"
            >
              <div className="w-5 h-5">
                <RotateSvg />
              </div>
              Change Image
            </button>
          </div>

          {/* Image Preview */}
          <div className="relative w-full h-[40vh] bg-zinc-900 rounded-lg overflow-hidden mb-6">
            <Image
              src={imageUrl}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>

          {/* Number of Colors Selector */}
          {!paletteData && (
            <div className="mb-6">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
                Number of Colors: {numColors}
              </label>
              <input
                type="range"
                min={3}
                max={10}
                step={1}
                value={numColors}
                onChange={(e) => setNumColors(parseInt(e.target.value))}
                className="w-full"
                style={{ accentColor: config.primaryColor }}
                disabled={extracting}
              />
              <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                <span>3 colors</span>
                <span>10 colors</span>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Extract Button */}
          {!paletteData && (
            <button
              onClick={handleExtract}
              disabled={extracting}
              className="w-full px-6 py-2 rounded-lg font-semibold text-white text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              style={{ backgroundColor: config.primaryColor }}
            >
              {extracting ? (
                <>
                  <Spinner className="w-5 h-5 text-zinc-100" /> Extracting Colors...
                </>
              ) : (
                "Extract Color Palette"
              )}
            </button>
          )}

          {/* Palette Results */}
          {paletteData && (
            <div className="space-y-4">
              {/* Preview Image */}
              <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <img
                  src={paletteData.preview_image.data}
                  alt="Color palette preview"
                  className="w-full h-32 object-cover"
                />
              </div>

              {/* Color Swatches */}
              <div className="space-y-3">
                <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200">
                  Extracted Colors ({paletteData.total_colors})
                </h4>

                {paletteData.palette.map((color, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50"
                  >
                    {/* Color Swatch */}
                    <div
                      className="w-16 h-16 rounded-lg border-2 border-zinc-300 dark:border-zinc-600 shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />

                    {/* Color Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                          {color.hex}
                        </span>
                        <button
                          onClick={() => handleCopyColor(color.hex)}
                          className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-all"
                          title="Copy HEX"
                        >
                          {copiedColor === color.hex ? (
                            <CheckSvg />
                          ) : (
                            <CopySvg />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="font-mono">
                          RGB({color.rgb[0]}, {color.rgb[1]}, {color.rgb[2]})
                        </span>
                        <span className="font-semibold">
                          {color.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Extract Again Button */}
              <button
                onClick={() => {
                  reset();
                }}
                className="w-full px-6 py-2 rounded-lg font-medium text-white transition-all"
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