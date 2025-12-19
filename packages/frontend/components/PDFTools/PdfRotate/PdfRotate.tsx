import { PdfRotateFileItem } from "./PdfRotateFileItem";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdf.tool.config";
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
        <div className="md:mt-[1vw] mt-[1vh] fade-in ">

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

          <GlassButton
            loading={rotating}
            primaryColor={config.primaryColor}
            onClick={rotateAllFiles}
          >
            {rotating ? "Rotating PDF..." : "Rotate PDF"}
          </GlassButton>
        </div>
      )}

      <PdfSessionFilesDisplay toolType="pdf-rotate" config={config} />
    </div>
  );
};

export default PdfRotate;
