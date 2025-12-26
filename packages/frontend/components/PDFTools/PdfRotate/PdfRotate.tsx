import { PdfRotateFileItem } from "./PdfRotateFileItem";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdf.tool.config";
import { usePdfRotate } from "@/hooks/pdfHooks/usePdfRotate.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import GlassButton from "@/components/Layouts/GlassButton";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ErrorSvg } from "@/components/Svg/CommonSvg";

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

  const hasAnyRotation = files.some(
    (file) => file.settings.rotations && !file.settings.rotations.endsWith(":0")
  );

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
            disabled={!hasAnyRotation || rotating}
            onClick={rotateAllFiles}
          >
            {rotating ? "Rotating PDF..." : "Rotate PDF"}
          </GlassButton>

          {!hasAnyRotation && (
            <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center">
                <ErrorSvg className="inline w-5 h-5 mr-1" />
                Please select a rotation (90°, 180°, or 270°) for at least one
                page.
              </p>
            </div>
          )}
        </div>
      )}

      <PdfSessionFilesDisplay toolType="pdf-rotate" config={config} />
    </div>
  );
};

export default PdfRotate;
