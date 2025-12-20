// ImageColorPalette/MainColorPalette/ImageColorPalette.tsx

import { useState, useCallback } from "react";
import Image from "next/image";
import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { RangeSlider } from "@/components/Shared/RangeSlider";
import { TOOL_CONFIGS } from "@/config/image.tool.config";
import { useImagePalette } from "@/hooks/imageHooks/useImagePalette.hook";
import GlassButton from "@/components/Layouts/GlassButton";
import { FileError, FileInfo } from "@/components/Shared/FileUI";
import { SavedPalettesSection } from "./SavedPalettesSection";
import { PaletteResults } from "./PaletteResults";
import { IconActionButton, ImageToolIconBadge } from "@/components/Shared/FileUITwo";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";

const ImageColorPalette = () => {
  const config = TOOL_CONFIGS.palette;
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [numColors, setNumColors] = useState(5);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const isDark = useDarkMode();

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
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3 md:mt-[1vw] mt-[1vh] animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <ImageToolIconBadge
              primaryColor={config.primaryColor}
              bgColor={config.dropzoneColor}
              bgColorDark={config.dropzoneColorDark}
              isDark={isDark}
            />
            <div className="flex-1 min-w-0 ml-2">
              <FileInfo name={file.name} size={file.size} />
            </div>

            <IconActionButton
              onClick={reset}
              disabled={extracting}
              label="Change"
            />
          </div>

          <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN: Controls */}
            <div className="space-y-5">
              {/* Number of Colors Selector */}
              {!paletteData && (
                <>
                  <div>
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

                  <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
                </>
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
                  {extracting
                    ? "Extracting Colors..."
                    : "Extract Color Palette"}
                </GlassButton>
              )}

              {/* Palette Results in Left Column when extracted */}
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

            {/* RIGHT COLUMN: Image Preview */}
            <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-xl p-1 border border-zinc-100 dark:border-zinc-800/50">
              <div className="mb-3 px-1">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Preview
                </span>
              </div>

              <div className="relative w-full aspect-video bg-zinc-950 rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt="Preview"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          </div>
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
