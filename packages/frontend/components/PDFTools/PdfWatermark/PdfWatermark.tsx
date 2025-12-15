import { useCallback } from "react";
import { PdfWatermarkFileItem } from "./PdfWatermarkFileItem";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdfToolConfigs";
import { TrashSvg } from "@/components/Svg/CommonSvg";
import { useAddWatermark } from "@/hooks/pdfHooks/useAddWatermark.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import GlassButton from "@/components/Layouts/GlassButton";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const PdfWatermark = () => {
  const config = PDF_TOOL_CONFIGS["pdf-watermark"];
  const isDark = useDarkMode();
  const { files, processing, addFiles, addFromGoogleDrive, addFromDropbox, removeFile, updateSettings, processAll, clearAll } = useAddWatermark();

  // Derived state
  const pendingFiles = files.filter((f) => f.status === "pending");
  const canProcess = pendingFiles.length > 0 && !processing;

  return (
    <div className="w-full md:mt-[1vw] mt-[1vh]">
      {files.length !== 1 && (
        <PdfDragDropZone
        config={config}
        onFilesSelected={addFiles}
        onGooglePick={addFromGoogleDrive}
        onDropboxPick={addFromDropbox}
        currentFileCount={files.length}
        disabled={files.length >= config.maxFiles}
      />
      )}

      {files.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3 md:mt-[1vw] mt-[1vh] animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-2 dark:bg-zinc-900 bg-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 md:text-sm text-xs text-zinc-600 dark:text-zinc-400">
                {files.length} File{files.length !== 1 ? 's' : ''} Loaded
             </div>
             <button onClick={clearAll} className="px-3 py-1.5 rounded-xl font-medium text-red-600 bg-red-50 dark:bg-red-900/20 flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 cursor-pointer">
                <span className="w-5 h-5">
                <TrashSvg />
              </span>
              <span className="md:block hidden">Clear All</span>
             </button>
          </div>

          <div className="space-y-4">
            {files.map((file) => (
              <PdfWatermarkFileItem
                key={file.id}
                file={file}
                config={config}
                updateSettings={updateSettings}
                removeFile={removeFile}
                isDark={isDark}
              />
            ))}
          </div>

          {canProcess && (
            <div className="mt-6">
              <GlassButton loading={processing} primaryColor={config.primaryColor} onClick={processAll}>
                {processing ? "Adding Watermark..." : "Add Watermark"}
              </GlassButton>
            </div>
          )}
        </div>
      )}

      <PdfSessionFilesDisplay toolType="add-watermark" config={config} />
    </div>
  );
};

export default PdfWatermark;