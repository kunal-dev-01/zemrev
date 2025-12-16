import { PdfRotateFileItem } from "./PdfRotateFileItem";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdfToolConfigs";
import { usePdfRotate } from "@/hooks/pdfHooks/usePdfRotate.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import GlassButton from "@/components/Layouts/GlassButton";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const PdfRotate = () => {
  const config = PDF_TOOL_CONFIGS["pdf-rotate"];
  const isDark = useDarkMode();

  const {
    files,
    rotating,
    addFiles,
    addFromGoogleDrive,
    addFromDropbox,
    removeFile,
    updateFileSettings,
    rotateAllFiles,
  } = usePdfRotate();

  // Derived state
  const pendingFiles = files.filter((f) => f.status === "pending");
  const canRotate = pendingFiles.length > 0 && !rotating;
  const canAddMore = files.length < config.maxFiles;

  return (
    <div className="w-full md:mt-[1vw] mt-[1vh]">
      {/* ROTATION PRESET SELECTOR */}
      {canAddMore && (
        <PdfDragDropZone
          config={config}
          onFilesSelected={addFiles}
          onGooglePick={addFromGoogleDrive}
          onDropboxPick={addFromDropbox}
          currentFileCount={files.length}
          disabled={!canAddMore}
        />
      )}

      {files.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3 md:mt-[1vw] mt-[1vh] animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 dark:bg-zinc-900 bg-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 md:text-sm text-xs text-zinc-600 dark:text-zinc-400">
              {files.length} File{files.length !== 1 ? "s" : ""} Loaded
            </div>
          </div>

          <div className="space-y-2">
            {files.map((file) => (
              <PdfRotateFileItem
                key={file.id}
                file={file}
                config={config}
                updateSettings={updateFileSettings}
                removeFile={removeFile}
                isDark={isDark}
              />
            ))}
          </div>

          {canRotate && (
            <GlassButton
              loading={rotating}
              primaryColor={config.primaryColor}
              onClick={rotateAllFiles}
            >
              {rotating ? "Rotating PDF..." : "Rotate PDF"}
            </GlassButton>
          )}
        </div>
      )}

      <PdfSessionFilesDisplay toolType="pdf-rotate" config={config} />
    </div>
  );
};

export default PdfRotate;
