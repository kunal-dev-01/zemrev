// ImageWatermark/MainWatermark/ImageWatermark.tsx

"use client";

import { useState, useCallback, useRef } from "react";
import { DragDropZone } from "@/components/Shared/DragDropZone";
import { UrlUploadModal } from "@/components/Shared/UrlUploadModal";
import { SessionFilesDisplay } from "@/components/Shared/SessionFilesDisplay";
import { TOOL_CONFIGS } from "@/config/tool.config";
import { Spinner } from "@/components/Layouts/Spinner";
import { RotateSvg } from "@/components/Svg/ToolsSvg";
import { CheckSvg } from "@/components/Svg/CommonSvg";
import { useImageWatermark } from "@/hooks/imageHooks/useImageWatermark.hook";
import type { WatermarkPosition } from "@/services/imageService/types";

const ImageWatermark = () => {
  const config = TOOL_CONFIGS.watermark;
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const watermarkInputRef = useRef<HTMLInputElement>(null);

  // Watermark mode: 'text' or 'image'
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

  // Get position styles for preview
  const getPositionStyles = () => {
    const baseStyles = "absolute pointer-events-none";
    switch (position) {
      case "top-left":
        return `${baseStyles} top-4 left-4`;
      case "top-right":
        return `${baseStyles} top-4 right-4`;
      case "center":
        return `${baseStyles} top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`;
      case "bottom-left":
        return `${baseStyles} bottom-4 left-4`;
      case "bottom-right":
        return `${baseStyles} bottom-4 right-4`;
      default:
        return `${baseStyles} bottom-4 right-4`;
    }
  };

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

      {/* Watermark Interface */}
      {file && imageUrl && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                {file.name}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Add text or image watermark
              </p>
            </div>

            <button
              onClick={reset}
              disabled={processing}
              className="px-4 py-1.5 flex items-center gap-2 rounded-lg font-medium border border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 disabled:opacity-50"
            >
              <div className="w-5 h-5">
                <RotateSvg />
              </div>
              Change Image
            </button>
          </div>

          {/* Mode Selector */}
          <div className="mb-6">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
              Watermark Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode("text")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === "text"
                    ? "text-white"
                    : "text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
                style={{
                  backgroundColor: mode === "text" ? config.primaryColor : undefined,
                }}
              >
                📝 Text Watermark
              </button>
              <button
                onClick={() => setMode("image")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === "image"
                    ? "text-white"
                    : "text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
                style={{
                  backgroundColor: mode === "image" ? config.primaryColor : undefined,
                }}
              >
                🖼️ Image Watermark
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left: Preview */}
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
                Preview
              </label>
              <div className="relative w-full aspect-video bg-zinc-900 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
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
                      <img
                        src={watermarkPreview}
                        alt="Watermark"
                        style={{
                          maxWidth: `${scale * 100}%`,
                          opacity: imageOpacity,
                        }}
                        className="max-h-24"
                      />
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
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Text
                    </label>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-800 dark:text-zinc-200"
                      placeholder="Your watermark text"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Font Size: {fontSize}px
                    </label>
                    <input
                      type="range"
                      min={12}
                      max={120}
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full"
                      style={{ accentColor: config.primaryColor }}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-16 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-800 dark:text-zinc-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Opacity: {Math.round(opacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.1}
                      value={opacity}
                      onChange={(e) => setOpacity(parseFloat(e.target.value))}
                      className="w-full"
                      style={{ accentColor: config.primaryColor }}
                    />
                  </div>
                </>
              )}

              {/* IMAGE MODE SETTINGS */}
              {mode === "image" && (
                <>
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
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
                      className="w-full px-4 py-2 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all"
                    >
                      {watermarkFile ? watermarkFile.name : "Choose logo/watermark"}
                    </button>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Scale: {Math.round(scale * 100)}%
                    </label>
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full"
                      style={{ accentColor: config.primaryColor }}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Opacity: {Math.round(imageOpacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.1}
                      value={imageOpacity}
                      onChange={(e) => setImageOpacity(parseFloat(e.target.value))}
                      className="w-full"
                      style={{ accentColor: config.primaryColor }}
                    />
                  </div>
                </>
              )}

              {/* COMMON: Position */}
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                  Position
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {positions.map((pos) => (
                    <button
                      key={pos.value}
                      onClick={() => setPosition(pos.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        position === pos.value
                          ? "text-white"
                          : "text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                      style={{
                        backgroundColor:
                          position === pos.value ? config.primaryColor : undefined,
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
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Apply Button */}
          <button
            onClick={handleApplyWatermark}
            disabled={processing || (mode === "image" && !watermarkFile)}
            className="w-full px-6 py-2 rounded-lg font-semibold text-white text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            style={{ backgroundColor: config.primaryColor }}
          >
            {processing ? (
              <>
                <Spinner className="w-5 h-5 text-zinc-100" /> Applying Watermark...
              </>
            ) : (
              <>
                Apply Watermark
              </>
            )}
          </button>
        </div>
      )}

      {/* Session Files Display (Completed) */}
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