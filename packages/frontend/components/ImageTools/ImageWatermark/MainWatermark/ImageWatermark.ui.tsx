// imageWatermark/MainWatermark/ImageWatermark.ui.tsx

import Image from "next/image";
import { RangeSlider } from "@/components/Shared/RangeSlider";
import { RotateSvg } from "@/components/Svg/ToolsSvg";
import GlassButton from "@/components/Layouts/GlassButton";
import type { ToolConfig, WatermarkPosition } from "@/services/imageService/types";
import { InputField } from "@/components/Layouts/InputField";

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

const COLORS = [
  "#000000",
  "#FFFFFF",
  "#1E40AF",
  "#B91C1C",
  "#047857",
  "#B45309",
  "#4338CA",
];

export const ImageWatermarkUI = (p: Props) => (
  <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3 md:mt-[1vw] mt-[1vh] animate-in fade-in slide-in-from-bottom-4">
    {/* Header */}
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex-1 min-w-0">
        <h3 className="text-sm leading-none font-semibold truncate text-zinc-800 dark:text-zinc-200">
          {p.file.name}
        </h3>
        <p className="text-xs text-zinc-500 mt-1">
          Add text or image watermark
        </p>
      </div>

      <button
        onClick={p.reset}
        disabled={p.processing}
        className="ml-3 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <div className="w-5 h-5">
          <RotateSvg />
        </div>
        <span className="md:block hidden text-sm">Change</span>
      </button>
    </div>

    <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-6">
      {/* LEFT COLUMN: Controls */}
      <div className="space-y-5">
        {/* Mode Selector - Tabs Style */}
        <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          {["text", "image"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => p.setMode(type as "text" | "image")}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
                p.mode === type
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              {type === "text" ? "Text Watermark" : "Image Watermark"}
            </button>
          ))}
        </div>

        {/* TEXT MODE SETTINGS */}
        {p.mode === "text" && (
          <div className="space-y-6 fade-in duration-300">
            {/* Text Input */}
            <div>
              <label className="text-xs uppercase font-bold text-zinc-500 mb-1.5 block">
                Watermark Text
              </label>
              <InputField
                label=""
                type="text"
                value={p.text}
                onChange={(value) => p.setText(value)}
                placeholder="Enter Watermark Text"
              />
            </div>

            {/* Font Size Slider */}
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

            {/* Color Picker */}
            <div>
              <label className="text-xs uppercase font-bold text-zinc-500 mb-2 block">
                Text Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => p.setColor(c)}
                    className={`w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-700 transition-transform hover:scale-110 cursor-pointer ${
                      p.color === c
                        ? "dark:ring-offset-zinc-900 scale-105"
                        : ""
                    }`}
                    style={{ 
                      backgroundColor: c,
                      border: p.color === c ? `2px solid ${p.config.primaryColor}` : "none"
                    }}
                  />
                ))}
                <div className="relative md:w-12 w-8 h-7 rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:scale-110 transition-transform">
                  <input
                    type="color"
                    value={p.color}
                    onChange={(e) => p.setColor(e.target.value)}
                    className="absolute -top-1 -left-1 w-9 h-9 cursor-pointer p-0 border-0 opacity-0"
                  />
                  <div
                    className="w-full h-full bg-[conic-gradient(at_center,var(--tw-gradient-stops))] from-red-500 via-yellow-500 to-orange-500"
                    title="Custom Color"
                  />
                </div>
              </div>
            </div>

            {/* Opacity Slider */}
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
        )}

        {/* IMAGE MODE SETTINGS */}
        {p.mode === "image" && (
          <div className="space-y-6 fade-in duration-300">
            {/* Image Upload */}
            <div>
              <label className="text-xs uppercase font-bold text-zinc-500 mb-2 block">
                Watermark Image
              </label>
              <input
                ref={p.watermarkInputRef}
                type="file"
                accept="image/png,image/webp"
                onChange={p.handleWatermarkSelect}
                className="hidden"
              />
              <button
                onClick={() => p.watermarkInputRef.current?.click()}
                className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all text-sm font-medium cursor-pointer"
              >
                {p.watermarkFile
                  ? p.watermarkFile.name
                  : "Upload Watermark Image"}
              </button>
            </div>

            {/* Scale Slider */}
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

            {/* Opacity Slider */}
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
        )}

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        {/* Position Selector */}
        <div>
          <label className="text-xs uppercase font-bold text-zinc-500 mb-2 block">
            Position
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {p.positions.map((pos) => (
              <button
                key={pos.value}
                onClick={() => p.setPosition(pos.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all outline-none cursor-pointer border ${
                  p.position === pos.value
                    ? "text-white border-transparent"
                    : "text-zinc-700 dark:text-zinc-300 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                }`}
                style={{
                  backgroundColor:
                    p.position === pos.value ? p.config.primaryColor : undefined,
                }}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Preview */}
      <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-xl p-1 border border-zinc-100 dark:border-zinc-800/50">
        <div className="mb-3 px-1">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Preview
          </span>
        </div>
        
        <div className="relative w-full aspect-video bg-zinc-950 rounded-lg overflow-hidden">
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
    </div>

    {/* Error Display */}
    {p.error && (
      <div className="mt-6 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
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