"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { SessionFilesDisplay } from "@/components/Shared/SessionFilesDisplay";
import { RangeSlider } from "@/components/Shared/RangeSlider";
import { TOOL_CONFIGS } from "@/config/tool.config";
import { Spinner } from "@/components/Layouts/Spinner";
import { RotateSvg } from "@/components/Svg/ToolsSvg";
import { useImageWatermark } from "@/hooks/imageHooks/useImageWatermark.hook";
import type { WatermarkPosition } from "@/services/imageService/types";
import GlassButton from "@/components/Layouts/GlassButton";

const ImageWatermark = () => {
  const config = TOOL_CONFIGS.watermark;
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const watermarkInputRef = useRef<HTMLInputElement>(null);

  // Watermark mode
  const [mode, setMode] = useState<"text" | "image">("text");

  // Text watermark settings
  const [text, setText] = useState("Watermark");
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#FFFFFF");
  const [opacity, setOpacity] = useState(0.7);

  // Image watermark settings
  const [scale, setScale] = useState(0.3);
  const [imageOpacity, setImageOpacity] = useState(0.7);

  // Common settings
  const [position, setPosition] = useState<WatermarkPosition>("bottom-right");

  const {
    file,
    imageUrl,
    watermarkFile,
    watermarkPreview,
    processing,
    error,
    setImageFile,
    setFromUrl,
    setWatermark,
    applyTextWatermark,
    applyImageWatermark,
    reset,
  } = useImageWatermark();

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

  const handleWatermarkSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setWatermark(e.target.files[0]);
      }
    },
    [setWatermark]
  );

  // ============================================================================
  // APPLY WATERMARK
  // ============================================================================
  const handleApplyWatermark = useCallback(async () => {
    if (mode === "text") {
      await applyTextWatermark({
        text,
        fontSize,
        color,
        opacity,
        position,
      });
    } else {
      await applyImageWatermark({
        scale,
        opacity: imageOpacity,
        position,
      });
    }
  }, [
    mode,
    text,
    fontSize,
    color,
    opacity,
    scale,
    imageOpacity,
    position,
    applyTextWatermark,
    applyImageWatermark,
  ]);

  // Position options
  const positions: { label: string; value: WatermarkPosition }[] = [
    { label: "Top Left", value: "top-left" },
    { label: "Top Right", value: "top-right" },
    { label: "Center", value: "center" },
    { label: "Bottom Left", value: "bottom-left" },
    { label: "Bottom Right", value: "bottom-right" },
  ];

  // Opacity presets (0.01 to 1.0)
  const opacityPresets = [
    { label: "25%", value: 0.25 },
    { label: "50%", value: 0.5 },
    { label: "75%", value: 0.75 },
    { label: "100%", value: 1.0 },
  ];

  // Get position styles for preview
  const getPositionStyles = () => {
    const baseStyles = "absolute pointer-events-none flex items-center";
    switch (position) {
      case "top-left":
        return `${baseStyles} top-4 left-4 justify-start`;
      case "top-right":
        return `${baseStyles} top-4 right-4 justify-end`;
      case "center":
        return `${baseStyles} top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 justify-center`;
      case "bottom-left":
        return `${baseStyles} bottom-4 left-4 justify-start`;
      case "bottom-right":
        return `${baseStyles} bottom-4 right-4 justify-end`;
      default:
        return `${baseStyles} bottom-4 right-4 justify-end`;
    }
  };

  // Get watermark wrapper styles based on position
  const getWatermarkWrapperStyle = () => {
    const maxDimension = 400; // Maximum size in pixels
    const scaledSize = maxDimension * scale;
    
    return {
      width: `${scaledSize}px`,
      maxWidth: '90%',
    };
  };

  // Get watermark image styles
  const getWatermarkImageStyle = () => {
    return {
      width: '100%',
      height: 'auto',
      opacity: imageOpacity,
    };
  };

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
          currentFileCount={0}
        />
      )}

      {/* Watermark Interface */}
      {file && imageUrl && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-zinc-900/40 p-3 md:p-6 md:mt-[1vw] mt-[1vh]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="md:text-lg text-md font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                {file.name}
              </h3>
              <p className="md:text-sm text-xs text-zinc-600 dark:text-zinc-400">
                Add text or image watermark
              </p>
            </div>

            <button
              onClick={reset}
              disabled={processing}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200 flex items-center gap-2 cursor-pointer"
            >
              <div className="w-5 h-5">
                <RotateSvg />
              </div>
              <span className="md:block hidden">Change Image</span>
            </button>
          </div>

          {/* Mode Selector */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-3 block">
              Watermark Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode("text")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all outline-none cursor-pointer border ${
                  mode === "text"
                    ? "text-white border-transparent"
                    : "text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-700"
                }`}
                style={{
                  backgroundColor:
                    mode === "text" ? config.primaryColor : undefined,
                }}
              >
                Text Watermark
              </button>
              <button
                onClick={() => setMode("image")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all outline-none cursor-pointer border ${
                  mode === "image"
                    ? "text-white border-transparent"
                    : "text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-700"
                }`}
                style={{
                  backgroundColor:
                    mode === "image" ? config.primaryColor : undefined,
                }}
              >
                Image Watermark
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left: Preview */}
            <div>
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-3 block">
                Preview
              </label>
              <div className="relative w-full aspect-video bg-zinc-900 rounded-xl overflow-hidden">
                <Image
                  src={imageUrl}
                  alt="Preview"
                  fill
                  className="object-contain"
                  unoptimized
                />

                {/* Watermark Preview Overlay */}
                {mode === "text" ? (
                  <div
                    className={getPositionStyles()}
                    style={{
                      fontSize: `${fontSize * 0.5}px`,
                      color,
                      opacity,
                      textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                      fontWeight: "bold",
                    }}
                  >
                    {text}
                  </div>
                ) : (
                  watermarkPreview && (
                    <div className={getPositionStyles()}>
                      <div style={getWatermarkWrapperStyle()}>
                        <Image
                          src={watermarkPreview}
                          alt="Watermark"
                          width={400}
                          height={400}
                          style={getWatermarkImageStyle()}
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Right: Controls */}
            <div className="space-y-4">
              {/* TEXT MODE SETTINGS */}
              {mode === "text" && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2 block">
                      Text
                    </label>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-0"
                      placeholder="Your watermark text"
                    />
                  </div>

                  <div>
                    <RangeSlider
                      label="Font Size"
                      value={fontSize}
                      min={12}
                      max={120}
                      step={1}
                      unit="px"
                      color={config.primaryColor}
                      onChange={setFontSize}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2 block">
                      Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-14 h-10 rounded-xl cursor-pointer border border-zinc-200 dark:border-zinc-700"
                      />
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>

                  <div>
                    <RangeSlider
                      label="Opacity"
                      value={opacity}
                      min={0.1}
                      max={1.0}
                      step={0.01}
                      unit=""
                      color={config.primaryColor}
                      onChange={setOpacity}
                      presets={opacityPresets}
                    />
                  </div>
                </>
              )}

              {/* IMAGE MODE SETTINGS */}
              {mode === "image" && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2 block">
                      Watermark Image
                    </label>
                    <input
                      ref={watermarkInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleWatermarkSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => watermarkInputRef.current?.click()}
                      className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all text-sm font-medium cursor-pointer select-none"
                    >
                      {watermarkFile
                        ? watermarkFile.name
                        : "Choose logo/watermark image"}
                    </button>
                  </div>

                  <div>
                    <RangeSlider
                      label="Scale"
                      value={scale}
                      min={0.1}
                      max={1.0}
                      step={0.01}
                      unit=""
                      color={config.primaryColor}
                      onChange={setScale}
                    />
                  </div>

                  <div>
                    <RangeSlider
                      label="Opacity"
                      value={imageOpacity}
                      min={0.1}
                      max={1.0}
                      step={0.01}
                      unit=""
                      color={config.primaryColor}
                      onChange={setImageOpacity}
                      presets={opacityPresets}
                    />
                  </div>
                </>
              )}

              {/* COMMON: Position */}
              <div>
                <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2 block">
                  Position
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {positions.map((pos) => (
                    <button
                      key={pos.value}
                      onClick={() => setPosition(pos.value)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all outline-none cursor-pointer border ${
                        position === pos.value
                          ? "text-white border-transparent"
                          : "text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-700"
                      }`}
                      style={{
                        backgroundColor:
                          position === pos.value
                            ? config.primaryColor
                            : undefined,
                      }}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Apply Button */}
          <GlassButton
            loading={processing}
            primaryColor={config.primaryColor}
            onClick={handleApplyWatermark}
          >
            {processing ? "Processing..." : "Apply Watermark"}
          </GlassButton>
        </div>
      )}

      {/* Session Files Display */}
      <SessionFilesDisplay toolType="watermark" config={config} />

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

export default ImageWatermark;