// ============================================================================
// FILE: src/components/PdfTools/SignPdf/PdfSignFileItem.tsx (UPDATED)
// ============================================================================

import { useState } from "react";
import { PdfSignViewer } from "./PdfSignViewer";
import { CancelSvg } from "@/components/Svg/CommonSvg";
import { PDFToImageSVg } from "@/components/Svg/PdfSvg";
import { UploadSvg } from "@/components/Svg/ToolsSvg";
import type {
  PdfProcessedFile,
  PdfFileSettings,
  PdfToolConfig,
  SignatureItem,
} from "@/services/pdfService/types";
import { SIGNATURE_FONTS } from "@/services/pdfService/types";
import { InputField } from "@/components/Layouts/InputField";

interface PdfSignFileItemProps {
  file: PdfProcessedFile;
  config: PdfToolConfig;
  updateSettings: (id: string, settings: PdfFileSettings) => void;
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

export const PdfSignFileItem = ({
  file,
  config,
  updateSettings,
  addSignature,
  updateSignature,
  deleteSignature,
  removeFile,
  isDark,
}: PdfSignFileItemProps) => {
  const [activeTab, setActiveTab] = useState<"text" | "image">("text");
  const [newSignatureText, setNewSignatureText] = useState("John Doe");
  const [selectedFont, setSelectedFont] = useState("Arial");
  const [selectedPage, setSelectedPage] = useState(0);
  const [selectedSignatureId, setSelectedSignatureId] = useState<string | null>(
    null
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${["B", "KB", "MB"][i]}`;
  };

  // Handle image upload
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

  // Add new signature
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
      imageFile: activeTab === "image" ? imageFile! : undefined,
      imagePreview: activeTab === "image" ? imagePreview! : undefined,
      x: 50,
      y: 100,
      width: 200,
      height: 80,
      page: selectedPage,
    };

    addSignature(file.id, newSignature);

    // Reset form
    if (activeTab === "image") {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const totalSignatures = file.settings.signatures?.length || 0;

  return (
    <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all">
      {/* HEADER */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
        <div
          className="p-2.5 rounded-xl shrink-0"
          style={{
            backgroundColor: isDark
              ? config.dropzoneColorDark
              : config.dropzoneColor,
          }}
        >
          <div style={{ color: config.primaryColor }} className="w-6 h-6">
            <PDFToImageSVg />
          </div>
        </div>
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
        <button
          type="button"
          onClick={() => removeFile(file.id)}
          className="px-3 py-1.5 rounded-xl border dark:border-zinc-700 border-zinc-200 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200 cursor-pointer"
        >
          <CancelSvg className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 grid lg:grid-cols-2 gap-6">
        {/* CONTROLS COLUMN */}
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
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                {type === "text" ? "Text Signature" : "Image Signature"}
              </button>
            ))}
          </div>

          {/* TEXT SIGNATURE CONTROLS */}
          {activeTab === "text" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500">
                  Signature Text
                </label>
                <input
                  type="text"
                  value={newSignatureText}
                  onChange={(e) => setNewSignatureText(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500">
                  Font Style
                </label>
                <select
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  style={{ fontFamily: selectedFont }}
                >
                  {SIGNATURE_FONTS.map((font) => (
                    <option
                      key={font.value}
                      value={font.value}
                      style={{ fontFamily: font.value }}
                    >
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* IMAGE SIGNATURE CONTROLS */}
          {activeTab === "image" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="max-h-28 max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-14 h-14 mx-auto mb-1 text-zinc-600 dark:text-zinc-300">
                      <UploadSvg />
                    </div>
                    <p className="text-sm text-zinc-500">
                      Upload Signature Image
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

          {/* PAGE SELECTOR */}
          <div className="space-y-2">
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
              onChange={(value) =>
                setSelectedPage(Math.max(0, parseInt(value) - 1 || 0))
              }
            />
          </div>

          {/* ADD BUTTON */}
          <button
            type="button"
            onClick={handleAddSignature}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
              onUpdateSignature={(sigId, updates) =>
                updateSignature(file.id, sigId, updates)
              }
              onDeleteSignature={(sigId) => deleteSignature(file.id, sigId)}
              onSelectSignature={setSelectedSignatureId}
              selectedSignatureId={selectedSignatureId}
            />
          )}
        </div>
      </div>
    </div>
  );
};
