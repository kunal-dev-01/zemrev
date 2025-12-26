import { PdfWatermarkFileItem } from "./PdfWatermarkFileItem";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdf.tool.config";
import { ErrorSvg } from "@/components/Svg/CommonSvg";
import { useWatermarkPdf } from "@/hooks/pdfHooks/useWatermarkPdf.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import GlassButton from "@/components/Layouts/GlassButton";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { FileError } from "@/components/Shared/FileUI";

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
    addWatermarkLayer,
    updateWatermarkLayer,
    deleteWatermarkLayer,
    processAllFiles,
  } = useWatermarkPdf();

  const totalWatermarks = files.reduce(
    (acc, f) => acc + (f.settings.signatures?.length || 0),
    0
  );
  const canProcess = totalWatermarks > 0;
  const isMaxFilesReached = files.length >= config.maxFiles;

  return (
    <div className="w-full md:mt-[1vw] mt-[1vh]">
      {files.length === 0 && (
        <PdfDragDropZone
          config={config}
          onFilesSelected={addFiles}
          onGooglePick={addFromGoogleDrive}
          onDropboxPick={addFromDropbox}
          currentFileCount={files.length}
          disabled={isMaxFilesReached}
        />
      )}

      {files.length > 0 && (
        <div className="md:mt-[1vw] mt-[1vh] fade-in">
          <div className="space-y-4">
            {files.map((file) => (
              <div key={file.id}>
                <PdfWatermarkFileItem
                  key={file.id}
                  file={file}
                  config={config}
                  addWatermark={addWatermarkLayer}
                  updateWatermark={updateWatermarkLayer}
                  deleteWatermark={deleteWatermarkLayer}
                  removeFile={removeFile}
                  isDark={isDark}
                />

                {file.status === "error" && file.error && (
                  <FileError error={file.error} className="mt-1" />
                )}
              </div>
            ))}
          </div>

          {canProcess && (
            <GlassButton
              loading={processing}
              primaryColor={config.primaryColor}
              onClick={processAllFiles}
            >
              {processing
                ? "Adding Watermarks..."
                : `Add Watermark${totalWatermarks !== 1 ? "s" : ""} to PDF`}
            </GlassButton>
          )}

          {!canProcess && totalWatermarks === 0 && (
            <div className="mt-[1vh] md:mt-[1vw] p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <ErrorSvg className="w-5 h-5 inline-block mr-1" />
                Please add at least one watermark before processing
              </p>
            </div>
          )}
        </div>
      )}

      <PdfSessionFilesDisplay toolType="add-watermark" config={config} />
    </div>
  );
};

export default PdfWatermark;
