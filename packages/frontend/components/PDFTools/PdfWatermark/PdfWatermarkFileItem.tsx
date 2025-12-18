// ============================================================================
// UPDATED: PdfWatermarkFileItem.tsx - With Page Range Switch
// ============================================================================

import { useState, useRef, useEffect } from "react";
import { PdfWatermarkViewer } from "./PdfWatermarkViewer";
import { WatermarkFonts } from "./WatermarkFonts";
import { ChevronDownSvg } from "@/components/Svg/CommonSvg";
import { UploadSvg } from "@/components/Svg/ToolsSvg";
import type { PdfProcessedFile, PdfToolConfig } from "@/services/pdfService/types";
import { WATERMARK_FONTS } from "@/services/pdfService/types";
import { InputField } from "@/components/Layouts/InputField";
import { RangeSlider } from "@/components/Shared/RangeSlider";
import Image from "next/image";
import { RemoveButton, ToolIconBadge } from "@/components/Shared/FileUI";

interface PdfWatermarkFileItemProps {
  file: PdfProcessedFile;
  config: PdfToolConfig;
  updateSettings: (id: string, settings: any) => void;
  removeFile: (id: string) => void;
  isDark: boolean;
}

const COLORS = [
  { value: "gray", hex: "#808080" },
  { value: "black", hex: "#000000" },
  { value: "red", hex: "#EF4444" },
  { value: "blue", hex: "#3B82F6" },
  { value: "green", hex: "#10B981" },
  { value: "yellow", hex: "#EAB308" },
  { value: "orange", hex: "#F97316" },
  { value: "purple", hex: "#A855F7" },
];

export const PdfWatermarkFileItem = ({
  file,
  config,
  updateSettings,
  removeFile,
  isDark,
}: PdfWatermarkFileItemProps) => {
  const [activeTab, setActiveTab] = useState<"text" | "image">("text");
  const [watermarkText, setWatermarkText] = useState(file.settings.text || "CONFIDENTIAL");
  const [selectedFont, setSelectedFont] = useState(file.settings.font || "Arial");
  const [selectedColor, setSelectedColor] = useState(file.settings.color || "gray");
  const [opacity, setOpacity] = useState((file.settings.opacity || 0.3) * 100);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  
  // PAGE RANGE STATE - NEW
  const [usePageRange, setUsePageRange] = useState(true);
  const [pageRange, setPageRange] = useState(file.settings.page_range || "");
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsFontDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync with file settings
  useEffect(() => {
    setActiveTab(file.settings.watermarkFile ? "image" : "text");
    setUsePageRange(!!(file.settings.page_range && file.settings.page_range.trim()));
  }, [file.settings.watermarkFile, file.settings.page_range]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${["B", "KB", "MB"][i]}`;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
        updateSettings(file.id, { watermarkFile: uploadedFile });
      };
      reader.readAsDataURL(uploadedFile);
    }
  };

  const handleUpdate = (updates: any) => {
    updateSettings(file.id, updates);
  };

  // Handle page range toggle - NEW
  const handlePageRangeToggle = (enabled: boolean) => {
    setUsePageRange(enabled);
    if (!enabled) {
      setPageRange("");
      handleUpdate({ page_range: "" });
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all">
      <WatermarkFonts />

      {/* HEADER */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
        <ToolIconBadge
          primaryColor={config.primaryColor}
          bgColor={config.dropzoneColor}
          bgColorDark={config.dropzoneColorDark}
          isDark={isDark}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm leading-none font-semibold truncate text-zinc-800 dark:text-zinc-200">
            {file.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-zinc-500 px-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-md inline-block">
              {formatBytes(file.size)}
            </p>
          </div>
        </div>
        <RemoveButton onClick={() => removeFile(file.id)} />
      </div>

      <div className="p-4 flex flex-col-reverse lg:grid lg:grid-cols-2 gap-6">
        {/* CONTROLS COLUMN */}
        <div className="space-y-5">
          {/* TABS */}
          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
            {["text", "image"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setActiveTab(type as "text" | "image");
                  if (type === "text") handleUpdate({ watermarkFile: undefined });
                }}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
                  activeTab === type
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                {type === "text" ? "Text Watermark" : "Image Watermark"}
              </button>
            ))}
          </div>

          {/* TEXT CONTROLS */}
          {activeTab === "text" && (
            <div className="space-y-6 fade-in duration-300">
              {/* Text Input */}
              <div>
                <label className="text-xs uppercase font-bold text-zinc-500">
                  Watermark Text
                </label>
                <InputField
                  type="text"
                  label=""
                  value={watermarkText}
                  onChange={(value) => {
                    setWatermarkText(value);
                    handleUpdate({ text: value });
                  }}
                  placeholder="Enter watermark text"
                />
              </div>

              {/* FONT DROPDOWN */}
              <div ref={dropdownRef}>
                <label className="text-xs uppercase font-bold text-zinc-500">
                  Font Style
                </label>
                <div className="relative border border-zinc-200 mt-1.5 dark:border-zinc-700 rounded-lg overflow-hidden transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-600">
                  <button
                    type="button"
                    onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
                    className="w-full px-3 py-2 bg-transparent text-sm flex items-center justify-between cursor-pointer"
                  >
                    <span style={{ fontFamily: selectedFont, fontSize: "1.1em" }}>
                      {WATERMARK_FONTS.find((f) => f.value === selectedFont)?.label || selectedFont}
                    </span>
                    <ChevronDownSvg
                      className={`w-5 h-5 text-zinc-400 transition-transform duration-200 ${
                        isFontDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ maxHeight: isFontDropdownOpen ? "240px" : "0px" }}
                  >
                    <div className="border-t border-zinc-200 dark:border-zinc-700 max-h-60 overflow-y-auto">
                      {WATERMARK_FONTS.map((font) => (
                        <button
                          key={font.value}
                          type="button"
                          onClick={() => {
                            setSelectedFont(font.value);
                            setIsFontDropdownOpen(false);
                            handleUpdate({ font: font.value });
                          }}
                          className={`w-full text-left px-4 py-2.5 text-lg transition-colors cursor-pointer ${
                            selectedFont === font.value
                              ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600"
                              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                          }`}
                          style={{ fontFamily: font.value }}
                        >
                          {font.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* COLOR PICKER */}
              <div>
                <label className="text-xs uppercase font-bold text-zinc-500">
                  Text Color
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => {
                        setSelectedColor(c.value);
                        handleUpdate({ color: c.value });
                      }}
                      className={`w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-700 transition-transform hover:scale-110 cursor-pointer ${
                        selectedColor === c.value
                          ? "ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-zinc-900 scale-105"
                          : ""
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* FONT SIZE & ROTATION */}
              <div className="grid grid-cols-2 gap-4">
                <RangeSlider
                  label="Font Size"
                  value={file.settings.font_size || 50}
                  min={10}
                  max={150}
                  step={5}
                  color={config.primaryColor}
                  onChange={(v) => handleUpdate({ font_size: v })}
                  unit="pt"
                />
                <RangeSlider
                  label="Rotation"
                  value={file.settings.rotation || 45}
                  min={0}
                  max={360}
                  step={15}
                  color={config.primaryColor}
                  onChange={(v) => handleUpdate({ rotation: v })}
                  unit="°"
                />
              </div>
            </div>
          )}

          {/* IMAGE CONTROLS */}
          {activeTab === "image" && (
            <div className="space-y-4 fade-in duration-300">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="preview"
                    width={500}
                    height={500}
                    unoptimized
                    className="max-h-28 max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-14 h-14 mx-auto mb-1 text-zinc-600 dark:text-zinc-300">
                      <UploadSvg />
                    </div>
                    <p className="text-sm text-zinc-500">Upload Watermark Image</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/png,image/svg+xml"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {/* IMAGE ROTATION SLIDER */}
              {imagePreview && (
                <RangeSlider
                  label="Rotation"
                  value={file.settings.rotation || 0}
                  min={0}
                  max={360}
                  step={15}
                  color={config.primaryColor}
                  onChange={(v) => handleUpdate({ rotation: v })}
                  unit="°"
                />
              )}
            </div>
          )}

          <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

          {/* OPACITY */}
          <RangeSlider
            label="Opacity"
            value={opacity}
            min={10}
            max={100}
            step={1}
            unit="%"
            color={config.primaryColor}
            onChange={(val) => {
              setOpacity(val);
              handleUpdate({ opacity: val / 100 });
            }}
          />

          {/* PAGE RANGE SECTION - IMPROVED DESIGN */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase font-bold text-zinc-500">
                Apply to Pages
              </label>
              <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => handlePageRangeToggle(false)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    !usePageRange
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  All Pages
                </button>
                <button
                  type="button"
                  onClick={() => handlePageRangeToggle(true)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    usePageRange
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  Page Range
                </button>
              </div>
            </div>

            {usePageRange && (
              <div className="fade-in duration-300">
                <InputField
                  type="text"
                  label=""
                  value={pageRange}
                  onChange={(value) => {
                    setPageRange(value);
                    handleUpdate({ page_range: value });
                  }}
                  placeholder="e.g., 1-3,5,7-9"
                />
                <p className="text-xs text-zinc-400 mt-1.5 flex items-start gap-1">
                  <svg className="w-3 h-3 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                  Enter page numbers or ranges (e.g., 1-3,5,7-9)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* PREVIEW COLUMN */}
        <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-xl p-1 border border-zinc-100 dark:border-zinc-800/50">
          {file.originalFile && (
            <PdfWatermarkViewer
              file={file.originalFile}
              settings={file.settings}
              primaryColor={config.primaryColor}
              onUpdate={handleUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
};