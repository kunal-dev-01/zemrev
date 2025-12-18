// ============================================================================
// FILE: src/components/PdfTools/SignPdf/PdfSignFileItem.tsx (UPDATED)
// ============================================================================

import { useState, useRef, useEffect } from "react";
import { PdfSignViewer } from "./PdfSignViewer";
import { CancelSvg, ChevronDownSvg } from "@/components/Svg/CommonSvg";
import { UploadSvg } from "@/components/Svg/ToolsSvg";
import { SignatureFonts } from "./SignatureFonts";
import type {
  PdfProcessedFile,
  PdfToolConfig,
  SignatureItem,
} from "@/services/pdfService/types";
import { SIGNATURE_FONTS } from "@/services/pdfService/types";
import { InputField } from "@/components/Layouts/InputField";
import { RangeSlider } from "@/components/Shared/RangeSlider";
import Image from "next/image";
import { RemoveButton, ToolIconBadge } from "@/components/Shared/FileUI";

interface PdfSignFileItemProps {
  file: PdfProcessedFile;
  config: PdfToolConfig;
  addSignature: (fileId: string, signature: SignatureItem) => void;
  updateSignature: (
    fileId: string,
    signatureId: string,
    updates: Partial<SignatureItem>
  ) => void;
  deleteSignature: (fileId: string, signatureId: string) => void;
  removeFile: (id: string) => void;
  isDark: boolean;
}

const COLORS = [
  "#000000",
  "#1E40AF",
  "#B91C1C",
  "#047857",
  "#B45309",
  "#4338CA",
  "#6D28D9",
];

export const PdfSignFileItem = ({
  file,
  config,
  addSignature,
  updateSignature,
  deleteSignature,
  removeFile,
  isDark,
}: PdfSignFileItemProps) => {
  const [activeTab, setActiveTab] = useState<"text" | "image">("text");
  const [newSignatureText, setNewSignatureText] = useState("John Doe");
  const [selectedFont, setSelectedFont] = useState("Dancing Script");
  const [selectedPage, setSelectedPage] = useState(0);
  const [selectedSignatureId, setSelectedSignatureId] = useState<string | null>(
    null
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [selectedColor, setSelectedColor] = useState("#000000");
  const [opacity, setOpacity] = useState(100);
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  
  // Rotation State
  const [rotation, setRotation] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsFontDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync controls when a signature is selected
  useEffect(() => {
    if (selectedSignatureId) {
      const sig = file.settings.signatures?.find(
        (s) => s.id === selectedSignatureId
      );
      if (sig) {
        if (sig.type) setActiveTab(sig.type);
        if (sig.text) setNewSignatureText(sig.text);
        if (sig.font) setSelectedFont(sig.font);
        if (sig.color) setSelectedColor(sig.color);
        if (sig.opacity !== undefined) setOpacity(sig.opacity * 100);
        if (sig.rotation !== undefined) setRotation(sig.rotation); // Sync Rotation
        setSelectedPage(sig.page);
      }
    }
  }, [selectedSignatureId, file.settings.signatures]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${["B", "KB", "MB"][i]}`;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePropertyChange = <K extends keyof SignatureItem>(
    key: K,
    value: SignatureItem[K]
  ) => {
    if (selectedSignatureId) {
      updateSignature(file.id, selectedSignatureId, { [key]: value });
    }
  };

  const handleAddSignature = () => {
    if (activeTab === "text" && !newSignatureText.trim()) {
      alert("Please enter signature text");
      return;
    }

    if (activeTab === "image" && !imageFile) {
      alert("Please upload a signature image");
      return;
    }

    const newSignature: SignatureItem = {
      id: `sig_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      type: activeTab,
      text: activeTab === "text" ? newSignatureText : undefined,
      font: activeTab === "text" ? selectedFont : undefined,
      color: activeTab === "text" ? selectedColor : undefined,
      rotation: rotation, // Rotation value pass ho raha hnn
      opacity: opacity / 100,
      imageFile: activeTab === "image" ? imageFile! : undefined,
      imagePreview: activeTab === "image" ? imagePreview! : undefined,
      x: 50,
      y: 100,
      width: 200,
      height: 80,
      page: selectedPage,
    };

    addSignature(file.id, newSignature);

    if (activeTab === "image") {
      setImageFile(null);
      setImagePreview(null);
    }
    
    // Reset rotation for next signature
    setRotation(0);
  };

  const totalSignatures = file.settings.signatures?.length || 0;

  return (
    <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all">
      <SignatureFonts />

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
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              {totalSignatures} signature{totalSignatures !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <RemoveButton onClick={() => removeFile(file.id)} />
      </div>

      <div className="p-4 flex flex-col-reverse lg:grid lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          {/* TABS */}
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
                    if (selectedSignatureId) handlePropertyChange("text", value);
                  }}
                  placeholder="Enter Your Signature"
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
                            if (selectedSignatureId) handlePropertyChange("font", font.value);
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

              {/* COLOR PICKER */}
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
                        if (selectedSignatureId) handlePropertyChange("color", c);
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
                        if (selectedSignatureId) handlePropertyChange("color", e.target.value);
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

          {activeTab === "image" && (
            <div className="space-y-4 fade-in duration-300">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                {imagePreview ? (
                  <Image src={imagePreview} alt="preview" width={500} height={500} unoptimized className="max-h-28 max-w-full object-contain" />
                ) : (
                  <div className="text-center">
                    <div className="w-14 h-14 mx-auto mb-1 text-zinc-600 dark:text-zinc-300">
                      <UploadSvg />
                    </div>
                    <p className="text-sm text-zinc-500">Upload Signature Image</p>
                  </div>
                )}
                <input type="file" accept="image/png,image/svg+xml" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          )}

          <div className="h-px bg-zinc-100 dark:bg-zinc-800 mt-2" />

          {/* OPACITY SLIDER */}
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
              if (selectedSignatureId) handlePropertyChange("opacity", val / 100);
            }}
          />

          {/* ROTATION SLIDER */}
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
              if (selectedSignatureId) handlePropertyChange("rotation", val);
            }}
          />

          {/* PAGE SELECTOR */}
          <div>
            <label className="text-xs uppercase font-bold text-zinc-500">
              Target Page
            </label>
            <InputField
              label=""
              type="number"
              value={selectedPage + 1}
              min={1}
              max={100}
              placeholder="Page number"
              onChange={(value) => setSelectedPage(Math.max(0, parseInt(value) - 1 || 0))}
            />
          </div>

          <button
            type="button"
            onClick={handleAddSignature}
            className="w-full py-2 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            style={{ backgroundColor: config.primaryColor }}
          >
            <CancelSvg className="w-5 h-5 rotate-45 text-white" />
            Add Signature to Page {selectedPage + 1}
          </button>
        </div>

        {/* PREVIEW COLUMN */}
        <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-xl p-1 border border-zinc-100 dark:border-zinc-800/50">
          {file.originalFile && (
            <PdfSignViewer
              file={file.originalFile}
              settings={file.settings}
              primaryColor={config.primaryColor}
              onUpdateSignature={(sigId, updates) => updateSignature(file.id, sigId, updates)}
              onDeleteSignature={(sigId) => deleteSignature(file.id, sigId)}
              onSelectSignature={(id) => {
                setSelectedSignatureId(id);
                const sig = file.settings.signatures?.find((s) => s.id === id);
                if (sig) {
                  setActiveTab(sig.type);
                  if (sig.text) setNewSignatureText(sig.text);
                  if (sig.font) setSelectedFont(sig.font);
                  if (sig.color) setSelectedColor(sig.color);
                  if (sig.opacity) setOpacity(sig.opacity * 100);
                  if (sig.rotation) setRotation(sig.rotation); // Preview selection sync
                  setSelectedPage(sig.page);
                }
              }}
              selectedSignatureId={selectedSignatureId}
              activePage={selectedPage + 1}
              onPageChange={(pageNum) => setSelectedPage(pageNum - 1)}
            />
          )}
        </div>
      </div>
    </div>
  );
};