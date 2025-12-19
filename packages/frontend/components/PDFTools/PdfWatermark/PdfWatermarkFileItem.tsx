import { useState, useRef, useEffect, useCallback } from "react";
import { PdfWatermarkViewer } from "./PdfWatermarkViewer";
import { CancelSvg, ChevronDownSvg } from "@/components/Svg/CommonSvg";
import { UploadSvg } from "@/components/Svg/ToolsSvg";
import { WatermarkFonts } from "./WatermarkFonts";
import { WATERMARK_FONTS } from "@/services/pdfService/types";
import type {
  PdfProcessedFile,
  PdfToolConfig,
  SignatureItem,
} from "@/services/pdfService/types";
import { InputField } from "@/components/Layouts/InputField";
import { RangeSlider } from "@/components/Shared/RangeSlider";
import Image from "next/image";
import { RemoveButton, ToolIconBadge } from "@/components/Shared/FileUI";

interface PdfWatermarkFileItemProps {
  file: PdfProcessedFile;
  config: PdfToolConfig;
  addWatermark: (fileId: string, watermark: SignatureItem) => void;
  updateWatermark: (fileId: string, watermarkId: string, updates: Partial<SignatureItem>) => void;
  deleteWatermark: (fileId: string, watermarkId: string) => void;
  removeFile: (id: string) => void;
  isDark: boolean;
}

const COLORS = ["#000000", "#1E40AF", "#B91C1C", "#047857", "#B45309", "#4338CA", "#6D28D9"];

const POSITION_PRESETS = [
  { label: "Top Left", xPercent: 3, yPercent: 3 },
  { label: "Top Center", xPercent: 32, yPercent: 3 },
  { label: "Top Right", xPercent: 62, yPercent: 3 },
  { label: "Center Left", xPercent: 3, yPercent: 50 },
  { label: "Center", xPercent: 32, yPercent: 50 },
  { label: "Center Right", xPercent: 62, yPercent: 50 },
  { label: "Bottom Left", xPercent: 3, yPercent: 90 },
  { label: "Bottom Center", xPercent: 32, yPercent: 90 },
  { label: "Bottom Right", xPercent: 62, yPercent: 90 },
];

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${["B", "KB", "MB"][i]}`;
};

export const PdfWatermarkFileItem = ({
  file,
  config,
  addWatermark,
  updateWatermark,
  deleteWatermark,
  removeFile,
  isDark,
}: PdfWatermarkFileItemProps) => {
  const [activeTab, setActiveTab] = useState<"text" | "image">("text");
  const [newWatermarkText, setNewWatermarkText] = useState("CONFIDENTIAL");
  const [selectedFont, setSelectedFont] = useState("Bebas Neue");
  const [selectedPage, setSelectedPage] = useState(-1);
  const [selectedWatermarkId, setSelectedWatermarkId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [opacity, setOpacity] = useState(30);
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 595, height: 842 });
  const [rotation, setRotation] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFontDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync controls when watermark is selected
  useEffect(() => {
    if (selectedWatermarkId) {
      const wm = file.settings.signatures?.find((s) => s.id === selectedWatermarkId);
      if (wm) {
        if (wm.type) setActiveTab(wm.type);
        if (wm.text) setNewWatermarkText(wm.text);
        if (wm.font) setSelectedFont(wm.font);
        if (wm.color) setSelectedColor(wm.color);
        if (wm.opacity !== undefined) setOpacity(wm.opacity * 100);
        if (wm.rotation !== undefined) setRotation(wm.rotation);
        if (wm.page >= 0) setSelectedPage(wm.page);
      }
    }
  }, [selectedWatermarkId, file.settings.signatures]);

  // Handle image upload
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setImageFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(uploadedFile);
    }
  }, []);

  // Handle property change
  const handlePropertyChange = useCallback(<K extends keyof SignatureItem>(
    key: K,
    value: SignatureItem[K]
  ) => {
    if (selectedWatermarkId) {
      updateWatermark(file.id, selectedWatermarkId, { [key]: value });
    }
  }, [selectedWatermarkId, file.id, updateWatermark]);

  // Handle add watermark
  const handleAddWatermark = useCallback(() => {
    if (activeTab === "text" && !newWatermarkText.trim()) {
      alert("Please enter watermark text");
      return;
    }

    if (activeTab === "image" && !imageFile) {
      alert("Please upload a watermark image");
      return;
    }

    const newWatermark: SignatureItem = {
      id: `wm_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      type: activeTab,
      text: activeTab === "text" ? newWatermarkText : undefined,
      font: activeTab === "text" ? selectedFont : undefined,
      color: activeTab === "text" ? selectedColor : undefined,
      rotation,
      opacity: opacity / 100,
      imageFile: activeTab === "image" ? imageFile! : undefined,
      imagePreview: activeTab === "image" ? imagePreview! : undefined,
      x: 50,
      y: 100,
      width: 300,
      height: 100,
      page: selectedPage,
    };

    addWatermark(file.id, newWatermark);

    if (activeTab === "image") {
      setImageFile(null);
      setImagePreview(null);
    }
    setRotation(0);
  }, [activeTab, newWatermarkText, imageFile, imagePreview, selectedFont, selectedColor, opacity, rotation, selectedPage, addWatermark, file.id]);

  // Handle position preset
  const handlePositionPreset = useCallback((pos: typeof POSITION_PRESETS[0]) => {
    if (selectedWatermarkId) {
      const x = (pdfDimensions.width * pos.xPercent) / 100;
      const y = (pdfDimensions.height * pos.yPercent) / 100;
      updateWatermark(file.id, selectedWatermarkId, { x, y });
    }
  }, [selectedWatermarkId, pdfDimensions, file.id, updateWatermark]);

  const totalWatermarks = file.settings.signatures?.length || 0;
  const isApplyToAllPages = selectedPage === -1;
  const displayButtonText = isApplyToAllPages 
    ? "Add Watermark to All Pages" 
    : `Add Watermark to Page ${selectedPage + 1}`;

  return (
    <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all">
      <WatermarkFonts />

      {/* Header */}
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
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
              {totalWatermarks} watermark{totalWatermarks !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <RemoveButton onClick={() => removeFile(file.id)} />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col-reverse lg:grid lg:grid-cols-2 gap-6">
        {/* Left: Controls */}
        <div className="space-y-5">
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
                {type === "text" ? "Text Watermark" : "Image Watermark"}
              </button>
            ))}
          </div>

          {/* Text Watermark Controls */}
          {activeTab === "text" && (
            <div className="space-y-6 fade-in duration-300">
              <div>
                <label className="text-xs uppercase font-bold text-zinc-500">
                  Watermark Text
                </label>
                <InputField
                  type="text"
                  label=""
                  value={newWatermarkText}
                  onChange={(value) => {
                    setNewWatermarkText(value);
                    handlePropertyChange("text", value);
                  }}
                  placeholder="Enter Watermark Text"
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
                            handlePropertyChange("font", font.value);
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

              {/* Color Picker */}
              <div>
                <label className="text-xs uppercase font-bold text-zinc-500">
                  Text Color
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
                          ? "ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-zinc-900 scale-105"
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

          {/* Image Watermark Upload */}
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

          {/* Position Presets */}
          <div>
            <label className="text-xs uppercase font-bold text-zinc-500 mb-2 block">
              Quick Position
            </label>
            <div className="grid grid-cols-3 gap-2">
              {POSITION_PRESETS.map((pos) => (
                <button
                  key={pos.label}
                  type="button"
                  onClick={() => handlePositionPreset(pos)}
                  disabled={!selectedWatermarkId}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                    selectedWatermarkId
                      ? "border-zinc-200 dark:border-zinc-700  text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      : "border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600"
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Page Range Selector */}
          <div>
            <label className="text-xs uppercase font-bold text-zinc-500 mb-2 block">
              Apply To
            </label>
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 mb-3">
              <button
                type="button"
                onClick={() => setSelectedPage(-1)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
                  selectedPage === -1
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                All Pages
              </button>
              <button
                type="button"
                onClick={() => setSelectedPage(0)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
                  selectedPage >= 0
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                Specific Page
              </button>
            </div>

            {selectedPage >= 0 && (
              <div className="fade-in duration-300">
                <InputField
                  label=""
                  type="number"
                  value={selectedPage + 1}
                  min={1}
                  max={100}
                  placeholder="Enter page number"
                  onChange={(value) => setSelectedPage(Math.max(0, parseInt(value) - 1 || 0))}
                />
              </div>
            )}
          </div>

          {/* Add Watermark Button */}
          <button
            type="button"
            onClick={handleAddWatermark}
            className="w-full py-2 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            style={{ backgroundColor: config.primaryColor }}
          >
            <CancelSvg className="w-5 h-5 rotate-45 text-white" />
            {displayButtonText}
          </button>
        </div>

        {/* Right: Preview */}
        <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-xl p-1 border border-zinc-100 dark:border-zinc-800/50">
          {file.originalFile && (
            <PdfWatermarkViewer
              file={file.originalFile}
              settings={file.settings}
              onUpdateWatermark={(wmId, updates) => updateWatermark(file.id, wmId, updates)}
              onDeleteWatermark={(wmId) => deleteWatermark(file.id, wmId)}
              onSelectWatermark={(id) => setSelectedWatermarkId(id)}
              selectedWatermarkId={selectedWatermarkId}
              activePage={selectedPage === -1 ? 1 : selectedPage + 1}
              onPageChange={(pageNum) => setSelectedPage(pageNum - 1)}
              onDimensionsChange={(width, height) => setPdfDimensions({ width, height })}
            />
          )}
        </div>
      </div>
    </div>
  );
};