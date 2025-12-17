import { useCallback, useState, useEffect } from "react";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PDF_TOOL_CONFIGS } from "@/config/pdf.tool.config";
import { useExtractText } from "@/hooks/pdfHooks/useExtractText.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import GlassButton from "@/components/Layouts/GlassButton";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import {
  PdfFileItem,
  ExtractedTextDisplay,
  ExtractedTextData,
} from "./PdfTextExtract.parts";

const PdfTextExtract = () => {
  const config = PDF_TOOL_CONFIGS["pdf-extract-text"];
  const isDark = useDarkMode();

  const {
    files,
    extracting,
    addFiles,
    removeFile,
    addFromGoogleDrive,
    addFromDropbox,
    updateSettings,
    extractAll,
  } = useExtractText();

  const [extractedTexts, setExtractedTexts] = useState<ExtractedTextData[]>([]);

  const loadExtractedTexts = useCallback(async () => {
    const sessionFiles = pdfSessionStorage.getFiles("extract-text");
    const texts: ExtractedTextData[] = [];

    for (const file of sessionFiles) {
      const blob = await pdfSessionStorage.getBlob(file.id);
      if (blob) {
        const text = await blob.text();
        texts.push({
          id: file.id,
          fileName: file.name,
          text,
          charCount: text.length,
          wordCount: text.split(/\s+/).filter(Boolean).length,
          timestamp: file.timestamp,
        });
      }
    }

    setExtractedTexts(texts);
  }, []);

  useEffect(() => {
    loadExtractedTexts();

    const handleUpdate = (e: Event) => {
      const ce = e as CustomEvent;
      if (ce.detail?.toolType === "extract-text") loadExtractedTexts();
    };

    window.addEventListener("pdfSessionStorageUpdated", handleUpdate);
    return () =>
      window.removeEventListener("pdfSessionStorageUpdated", handleUpdate);
  }, [loadExtractedTexts]);

  const canAddMore = files.length < config.maxFiles;

  return (
    <div className="w-full md:mt-[1vw] mt-[1vh]">
      <PdfDragDropZone
        config={config}
        onFilesSelected={addFiles}
        onGooglePick={addFromGoogleDrive}
        onDropboxPick={addFromDropbox}
        currentFileCount={files.length}
        disabled={!canAddMore}
      />

      {files.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3 md:mt-[1vw] mt-[1vh]">
          <div className="space-y-2 mb-4">
            {files.map((file) => (
              <PdfFileItem
                key={file.id}
                file={file}
                config={config}
                updateSettings={updateSettings}
                removeFile={removeFile}
                isDark={isDark}
              />
            ))}
          </div>

          <GlassButton
            loading={extracting}
            primaryColor={config.primaryColor}
            onClick={extractAll}
          >
            {extracting ? "Extracting Text..." : "Extract Text"}
          </GlassButton>
        </div>
      )}

      {extractedTexts.map((text) => (
        <ExtractedTextDisplay
          key={text.id}
          data={text}
          config={config}
          onDelete={async (id) => {
            await pdfSessionStorage.deleteFile("extract-text", id);
            loadExtractedTexts();
          }}
        />
      ))}
    </div>
  );
};

export default PdfTextExtract;
