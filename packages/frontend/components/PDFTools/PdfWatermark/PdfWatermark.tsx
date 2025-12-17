import { PdfWatermarkFileItem } from "./PdfWatermarkFileItem";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdf.tool.config";
import { useAddWatermark } from "@/hooks/pdfHooks/useAddWatermark.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import GlassButton from "@/components/Layouts/GlassButton";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ClearAllButton, FilesStatusSummary } from "@/components/Shared/FileUI";

const PdfWatermark = () => {
  const config = PDF_TOOL_CONFIGS["pdf-watermark"];
  const isDark = useDarkMode();
  const {
    files,
    processing,
    addFiles,
    addFromGoogleDrive,
    addFromDropbox,
    removeFile,
    updateSettings,
    processAll,
    clearAll,
  } = useAddWatermark();

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
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3 md:mt-[1vw] mt-[1vh] fade-in">
          <div className="flex items-center justify-between mb-4">
            <FilesStatusSummary
              pending={files.length}
              processing={0}
              failed={0}
            />
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
              <GlassButton
                loading={processing}
                primaryColor={config.primaryColor}
                onClick={processAll}
              >
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
