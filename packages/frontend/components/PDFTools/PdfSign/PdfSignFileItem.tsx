import { useState, useRef, useEffect, useCallback } from "react";
import { PdfSignViewer } from "./PdfSignViewer";
import type {
  PdfProcessedFile,
  PdfToolConfig,
  SignatureItem,
} from "@/services/pdfService/types";
import { RemoveButton, ToolIconBadge } from "@/components/Shared/FileUI";
import { PdfSignControls } from "./PdfSignControls";

interface PdfSignFileItemProps {
  file: PdfProcessedFile;
  config: PdfToolConfig;
  addSignature: (fileId: string, signature: SignatureItem) => void;
  updateSignature: (fileId: string, signatureId: string, updates: Partial<SignatureItem>) => void;
  deleteSignature: (fileId: string, signatureId: string) => void;
  removeFile: (id: string) => void;
  isDark: boolean;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${["B", "KB", "MB"][i]}`;
};

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
  const [selectedSignatureId, setSelectedSignatureId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [opacity, setOpacity] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
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

  // Sync controls when signature is selected
  useEffect(() => {
    if (selectedSignatureId) {
      const sig = file.settings.signatures?.find((s) => s.id === selectedSignatureId);
      if (sig) {
        if (sig.type) setActiveTab(sig.type);
        if (sig.text) setNewSignatureText(sig.text);
        if (sig.font) setSelectedFont(sig.font);
        if (sig.color) setSelectedColor(sig.color);
        if (sig.opacity !== undefined) setOpacity(sig.opacity * 100);
        if (sig.rotation !== undefined) setRotation(sig.rotation);
        setSelectedPage(sig.page);
      }
    }
  }, [selectedSignatureId, file.settings.signatures]);

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
  const handlePropertyChange = useCallback(
    <K extends keyof SignatureItem>(key: K, value: SignatureItem[K]) => {
      if (selectedSignatureId) {
        updateSignature(file.id, selectedSignatureId, { [key]: value });
      }
    },
    [selectedSignatureId, file.id, updateSignature]
  );

  // Handle add signature
  const handleAddSignature = useCallback(() => {
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
      rotation,
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

    setRotation(0);
  }, [activeTab, newSignatureText, imageFile, imagePreview, selectedFont, selectedColor, opacity, rotation, selectedPage, addSignature, file.id]);

  // Handle signature selection sync
  const handleSelectSignature = useCallback(
    (id: string) => {
      setSelectedSignatureId(id);
      const sig = file.settings.signatures?.find((s) => s.id === id);
      if (sig) {
        setActiveTab(sig.type);
        if (sig.text) setNewSignatureText(sig.text);
        if (sig.font) setSelectedFont(sig.font);
        if (sig.color) setSelectedColor(sig.color);
        if (sig.opacity) setOpacity(sig.opacity * 100);
        if (sig.rotation) setRotation(sig.rotation);
        setSelectedPage(sig.page);
      }
    },
    [file.settings.signatures]
  );

  const totalSignatures = file.settings.signatures?.length || 0;
  const pageDisplay = selectedPage + 1;

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-zinc-900/40 overflow-hidden transition-all">
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
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              {totalSignatures} signature{totalSignatures !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <RemoveButton onClick={() => removeFile(file.id)} />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col-reverse lg:grid lg:grid-cols-2 gap-6">
        {/* Left: Controls */}
        <PdfSignControls
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          newSignatureText={newSignatureText}
          setNewSignatureText={setNewSignatureText}
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
          setImagePreview={setImagePreview}
          setSelectedPage={setSelectedPage}
          handleImageUpload={handleImageUpload}
          handlePropertyChange={handlePropertyChange}
          handleAddSignature={handleAddSignature}
          config={config}
          pageDisplay={pageDisplay}
          dropdownRef={dropdownRef}
          fileId={file.id}
        />

        {/* Right: Preview */}
        <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-xl p-1 border border-zinc-100 dark:border-zinc-800/50">
          {file.originalFile && (
            <PdfSignViewer
              file={file.originalFile}
              settings={file.settings}
              onUpdateSignature={(sigId, updates) => updateSignature(file.id, sigId, updates)}
              onDeleteSignature={(sigId) => deleteSignature(file.id, sigId)}
              onSelectSignature={handleSelectSignature}
              selectedSignatureId={selectedSignatureId}
              activePage={pageDisplay}
              onPageChange={(pageNum) => setSelectedPage(pageNum - 1)}
            />
          )}
        </div>
      </div>
    </div>
  );
};