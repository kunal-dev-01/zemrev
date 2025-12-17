// ImageColorPalette/MainColorPalette/ImageColorPalette.tsx

import { useState, useCallback } from "react";
import Image from "next/image";
import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { RangeSlider } from "@/components/Shared/RangeSlider";
import { TOOL_CONFIGS } from "@/config/image.tool.config";
import { RotateSvg } from "@/components/Svg/ToolsSvg";
import { useImagePalette } from "@/hooks/imageHooks/useImagePalette.hook";
import GlassButton from "@/components/Layouts/GlassButton";
import { FileError } from "@/components/Shared/FileUI";
import { SavedPalettesSection } from "./SavedPalettesSection";
import { PaletteResults } from "./PaletteResults";

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
    setFromGoogleDrive,
    setFromDropbox,
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
                unit="co"
                color={config.primaryColor}
                onChange={setNumColors}
                presets={colorPresets}
                disabled={extracting}
              />
            </div>
          )}

          {/* Error Display */}
          {error && <FileError error={error} />}

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
            <PaletteResults 
              paletteData={paletteData}
              config={config}
              onCopyColor={handleCopyColor}
              copiedColor={copiedColor}
              onReset={reset}
            />
          )}
        </div>
      )}

      {/* Saved Palettes Section */}
      <SavedPalettesSection onCopyColor={handleCopyColor} />

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