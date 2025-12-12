// imageWatermark/MainWatermark/ImageWatermark.ui.tsx

import Image from "next/image";
import { RangeSlider } from "@/components/Shared/RangeSlider";
import { RotateSvg } from "@/components/Svg/ToolsSvg";
import GlassButton from "@/components/Layouts/GlassButton";
import type { ToolConfig, WatermarkPosition } from "@/services/imageService/types";

type Props = {
  config: ToolConfig;
  file: File;
  imageUrl: string;
  mode: "text" | "image";
  setMode: (m: "text" | "image") => void;
  text: string;
  setText: (t: string) => void;
  fontSize: number;
  setFontSize: (n: number) => void;
  color: string;
  setColor: (c: string) => void;
  opacity: number;
  setOpacity: (n: number) => void;
  scale: number;
  setScale: (n: number) => void;
  imageOpacity: number;
  setImageOpacity: (n: number) => void;
  position: WatermarkPosition;
  setPosition: (p: WatermarkPosition) => void;
  watermarkFile: File | null;
  watermarkPreview: string | null;
  watermarkInputRef: React.RefObject<HTMLInputElement>;
  processing: boolean;
  error: string | null;
  reset: () => void;
  handleWatermarkSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleApplyWatermark: () => void;
  positions: { label: string; value: WatermarkPosition }[];
  opacityPresets: { label: string; value: number }[];
  getPositionStyles: () => string;
  getWatermarkWrapperStyle: () => React.CSSProperties;
  getWatermarkImageStyle: () => React.CSSProperties;
};

export const ImageWatermarkUI = (p: Props) => (
  <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-zinc-900/40 p-3 md:p-6 md:mt-[1vw] mt-[1vh]">
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="md:text-lg text-md font-semibold text-zinc-800 dark:text-zinc-200 truncate">
          {p.file.name}
        </h3>
        <p className="md:text-sm text-xs text-zinc-600 dark:text-zinc-400">
          Add text or image watermark
        </p>
      </div>

      <button
        onClick={p.reset}
        disabled={p.processing}
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
          onClick={() => p.setMode("text")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all outline-none cursor-pointer border ${
            p.mode === "text"
              ? "text-white border-transparent"
              : "text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-700"
          }`}
          style={{
            backgroundColor: p.mode === "text" ? p.config.primaryColor : undefined,
          }}
        >
          Text Watermark
        </button>
        <button
          onClick={() => p.setMode("image")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all outline-none cursor-pointer border ${
            p.mode === "image"
              ? "text-white border-transparent"
              : "text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-700"
          }`}
          style={{
            backgroundColor: p.mode === "image" ? p.config.primaryColor : undefined,
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
            src={p.imageUrl}
            alt="Preview"
            fill
            className="object-contain"
            unoptimized
          />

          {/* Watermark Preview Overlay */}
          {p.mode === "text" ? (
            <div
              className={p.getPositionStyles()}
              style={{
                fontSize: `${p.fontSize * 0.5}px`,
                color: p.color,
                opacity: p.opacity / 100,
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                fontWeight: "bold",
              }}
            >
              {p.text}
            </div>
          ) : (
            p.watermarkPreview && (
              <div className={p.getPositionStyles()}>
                <div style={p.getWatermarkWrapperStyle()}>
                  <Image
                    src={p.watermarkPreview}
                    alt="Watermark"
                    width={400}
                    height={400}
                    style={p.getWatermarkImageStyle()}
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
      <div className="space-y-3">
        {/* TEXT MODE SETTINGS */}
        {p.mode === "text" && (
          <>
            <div>
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2 block">
                Text
              </label>
              <input
                type="text"
                value={p.text}
                onChange={(e) => p.setText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-sm text-zinc-800 dark:text-zinc-200 outline-none"
                placeholder="Your watermark text"
              />
            </div>

            <div>
              <RangeSlider
                label="Font Size"
                value={p.fontSize}
                min={12}
                max={120}
                step={1}
                unit="px"
                color={p.config.primaryColor}
                onChange={p.setFontSize}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2 block">
                Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={p.color}
                  onChange={(e) => p.setColor(e.target.value)}
                  className="w-14 h-10 rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={p.color}
                  onChange={(e) => p.setColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-sm text-zinc-800 dark:text-zinc-200 outline-none"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>

            <div>
              <RangeSlider
                label="Opacity"
                value={p.opacity}
                min={10}
                max={100}
                step={1}
                unit="%"
                color={p.config.primaryColor}
                onChange={p.setOpacity}
                presets={p.opacityPresets}
              />
            </div>
          </>
        )}

        {/* IMAGE MODE SETTINGS */}
        {p.mode === "image" && (
          <>
            <div>
              <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2 block">
                Watermark Image
              </label>
              <input
                ref={p.watermarkInputRef}
                type="file"
                accept="image/*"
                onChange={p.handleWatermarkSelect}
                className="hidden"
              />
              <button
                onClick={() => p.watermarkInputRef.current?.click()}
                className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all text-sm font-medium cursor-pointer select-none"
              >
                {p.watermarkFile
                  ? p.watermarkFile.name
                  : "Choose logo/watermark image"}
              </button>
            </div>

            <div>
              <RangeSlider
                label="Scale"
                value={p.scale}
                min={10}
                max={100}
                step={1}
                unit="%"
                color={p.config.primaryColor}
                onChange={p.setScale}
              />
            </div>

            <div>
              <RangeSlider
                label="Opacity"
                value={p.imageOpacity}
                min={10}
                max={100}
                step={1}
                unit="%"
                color={p.config.primaryColor}
                onChange={p.setImageOpacity}
                presets={p.opacityPresets}
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
            {p.positions.map((pos) => (
              <button
                key={pos.value}
                onClick={() => p.setPosition(pos.value)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all outline-none cursor-pointer border ${
                  p.position === pos.value
                    ? "text-white border-transparent"
                    : "text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-700"
                }`}
                style={{
                  backgroundColor:
                    p.position === pos.value
                      ? p.config.primaryColor
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
    {p.error && (
      <div className="mb-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <p className="text-sm text-red-600 dark:text-red-400">{p.error}</p>
      </div>
    )}

    {/* Apply Button */}
    <GlassButton
      loading={p.processing}
      primaryColor={p.config.primaryColor}
      onClick={p.handleApplyWatermark}
    >
      {p.processing ? "Processing..." : "Apply Watermark"}
    </GlassButton>
  </div>
);