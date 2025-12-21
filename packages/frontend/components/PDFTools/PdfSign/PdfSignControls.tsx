import { CancelSvg, ChevronDownSvg } from "@/components/Svg/CommonSvg";
import { UploadSvg } from "@/components/Svg/ToolsSvg";
import { SIGNATURE_FONTS } from "@/services/pdfService/types";
import type { PdfToolConfig, SignatureItem } from "@/services/pdfService/types";
import { InputField } from "@/components/Layouts/InputField";
import { RangeSlider } from "@/components/Shared/RangeSlider";
import Image from "next/image";
import { SignatureFonts } from "./SignatureFonts";

const COLORS = ["#000000", "#1E40AF", "#B91C1C", "#047857", "#B45309", "#4338CA", "#6D28D9"];

interface PdfSignControlsProps {
  activeTab: "text" | "image";
  setActiveTab: (tab: "text" | "image") => void;
  newSignatureText: string;
  setNewSignatureText: (text: string) => void;
  selectedFont: string;
  setSelectedFont: (font: string) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  opacity: number;
  setOpacity: (opacity: number) => void;
  rotation: number;
  setRotation: (rotation: number) => void;
  isFontDropdownOpen: boolean;
  setIsFontDropdownOpen: (open: boolean) => void;
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
  setSelectedPage: (page: number) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePropertyChange: <K extends keyof SignatureItem>(key: K, value: SignatureItem[K]) => void;
  handleAddSignature: () => void;
  config: PdfToolConfig;
  pageDisplay: number;
  dropdownRef: React.RefObject<HTMLDivElement>;
  fileId: string;
}

export const PdfSignControls = ({
  activeTab,
  setActiveTab,
  newSignatureText,
  setNewSignatureText,
  selectedFont,
  setSelectedFont,
  selectedColor,
  setSelectedColor,
  opacity,
  setOpacity,
  rotation,
  setRotation,
  isFontDropdownOpen,
  setIsFontDropdownOpen,
  imagePreview,
  setSelectedPage,
  handleImageUpload,
  handlePropertyChange,
  handleAddSignature,
  config,
  pageDisplay,
  dropdownRef,
}: PdfSignControlsProps) => {
  return (
    <div className="space-y-5">
      <SignatureFonts />

      {/* Tabs */}
      <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
        {["text", "image"].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setActiveTab(type as "text" | "image")}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
              activeTab === type
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            {type === "text" ? "Signature" : "Add Stamp"}
          </button>
        ))}
      </div>

      {/* Text Signature Controls */}
      {activeTab === "text" && (
        <div className="space-y-6 fade-in duration-300">
          <div>
            <label className="text-xs uppercase font-bold text-zinc-500">
              Signature Text
            </label>
            <InputField
              type="text"
              label=""
              value={newSignatureText}
              onChange={(value) => {
                setNewSignatureText(value);
                handlePropertyChange("text", value);
              }}
              placeholder="Enter Your Signature"
            />
          </div>

          {/* Font Dropdown */}
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
                  {SIGNATURE_FONTS.find((f) => f.value === selectedFont)?.label || selectedFont}
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
                  {SIGNATURE_FONTS.map((font) => (
                    <button
                      key={font.value}
                      type="button"
                      onClick={() => {
                        setSelectedFont(font.value);
                        setIsFontDropdownOpen(false);
                        handlePropertyChange("font", font.value);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-lg transition-colors cursor-pointer ${
                        selectedFont === font.value
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
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

          {/* Color Picker */}
          <div>
            <label className="text-xs uppercase font-bold text-zinc-500">
              Ink Color
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setSelectedColor(c);
                    handlePropertyChange("color", c);
                  }}
                  className={`w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-700 transition-transform hover:scale-110 cursor-pointer ${
                    selectedColor === c
                      ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900 scale-105"
                      : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <div className="relative md:w-12 w-8 h-7 rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:scale-110 transition-transform">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => {
                    setSelectedColor(e.target.value);
                    handlePropertyChange("color", e.target.value);
                  }}
                  className="absolute -top-1 -left-1 w-9 h-9 cursor-pointer p-0 border-0 opacity-0"
                />
                <div
                  className="w-full h-full bg-[conic-gradient(at_center,var(--tw-gradient-stops))] from-red-500 via-yellow-500 to-orange-500"
                  title="Custom Color"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload */}
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
                <p className="text-sm text-zinc-500">Upload Signature Image</p>
              </div>
            )}
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      <div className="h-px bg-zinc-100 dark:bg-zinc-800 mt-2" />

      {/* Opacity Slider */}
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
          handlePropertyChange("opacity", val / 100);
        }}
      />

      {/* Rotation Slider */}
      <RangeSlider
        label="Rotation"
        value={rotation}
        min={-180}
        max={180}
        step={5}
        unit="°"
        color={config.primaryColor}
        onChange={(val) => {
          setRotation(val);
          handlePropertyChange("rotation", val);
        }}
      />

      {/* Page Selector */}
      <div>
        <label className="text-xs uppercase font-bold text-zinc-500">
          Target Page
        </label>
        <InputField
          label=""
          type="number"
          value={pageDisplay}
          min={1}
          max={100}
          placeholder="Page number"
          onChange={(value) => setSelectedPage(Math.max(0, parseInt(value) - 1 || 0))}
        />
      </div>

      {/* Add Signature Button */}
      <button
        type="button"
        onClick={handleAddSignature}
        className="w-full py-2 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        style={{ backgroundColor: config.primaryColor }}
      >
        <CancelSvg className="w-5 h-5 rotate-45 text-white" />
        Add Signature to Page {pageDisplay}
      </button>
    </div>
  );
};