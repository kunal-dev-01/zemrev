import { useState, useRef, useEffect, useCallback } from "react";
import { PdfWatermarkViewer } from "./PdfWatermarkViewer";
import type {
  PdfProcessedFile,
  PdfToolConfig,
  SignatureItem,
} from "@/services/pdfService/types";
import { RemoveButton, ToolIconBadge } from "@/components/Shared/FileUI";
import { PdfWatermarkControls } from "./PdfWatermarkControls";

interface PdfWatermarkFileItemProps {
  file: PdfProcessedFile;
  config: PdfToolConfig;
  addWatermark: (fileId: string, watermark: SignatureItem) => void;
  updateWatermark: (fileId: string, watermarkId: string, updates: Partial<SignatureItem>) => void;
  deleteWatermark: (fileId: string, watermarkId: string) => void;
  removeFile: (id: string) => void;
  isDark: boolean;
}

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
  const [rotation, setRotation] = useState(0);
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 595, height: 842 });
  const dropdownRef = useRef<HTMLDivElement>(null!);

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

  const totalWatermarks = file.settings.signatures?.length || 0;
  const isApplyToAllPages = selectedPage === -1;
  const displayButtonText = isApplyToAllPages 
    ? "Add Watermark to All Pages" 
    : `Add Watermark to Page ${selectedPage + 1}`;

  return (
    <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all">
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
        <PdfWatermarkControls
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          newWatermarkText={newWatermarkText}
          setNewWatermarkText={setNewWatermarkText}
          selectedFont={selectedFont}
          setSelectedFont={setSelectedFont}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          opacity={opacity}
          setOpacity={setOpacity}
          rotation={rotation}
          setRotation={setRotation}
          isFontDropdownOpen={isFontDropdownOpen}
          setIsFontDropdownOpen={setIsFontDropdownOpen}
          imagePreview={imagePreview}
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
          selectedWatermarkId={selectedWatermarkId}
          handleImageUpload={handleImageUpload}
          handlePropertyChange={handlePropertyChange}
          handleAddWatermark={handleAddWatermark}
          config={config}
          pdfDimensions={pdfDimensions}
          handlePositionPreset={(pos) => {
            if (selectedWatermarkId) {
              const x = (pdfDimensions.width * pos.xPercent) / 100;
              const y = (pdfDimensions.height * pos.yPercent) / 100;
              updateWatermark(file.id, selectedWatermarkId, { x, y });
            }
          }}
          displayButtonText={displayButtonText}
          dropdownRef={dropdownRef}
          fileId={file.id}
        />

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