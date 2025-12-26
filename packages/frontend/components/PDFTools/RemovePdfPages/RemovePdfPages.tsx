import { PdfRemovePagesFileItem } from "./PdfRemovePagesFileItem";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdf.tool.config";
import { ErrorSvg } from "@/components/Svg/CommonSvg";
import { usePdfRemovePages } from "@/hooks/pdfHooks/usePdfRemovePages.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import GlassButton from "@/components/Layouts/GlassButton";

const RemovePdfPages = () => {
  const config = PDF_TOOL_CONFIGS["pdf-remove-pages"];
  const isDark = useDarkMode();

  const {
    files,
    processing,
    stats,
    addFiles,
    addFromGoogleDrive,
    addFromDropbox,
    removeFile,
    updateFileSettings,
    processAllFiles,
  } = usePdfRemovePages();

  const canProcess = stats.pending > 0;
  const hasValidPageRanges = files.every((f) =>
    f.settings.pages_to_remove?.trim()
  );
  const hasAnyPageSelected = files.some((file) =>
    file.settings.pages_to_remove?.trim()
  );

  const isMaxFilesReached = files.length >= config.maxFiles;

  return (
    <div className="w-full md:mt-[1vw] mt-[1vh]">
      {/* Upload Zone */}
      {files.length === 0 && (
        <PdfDragDropZone
          config={config}
          onFilesSelected={(newFiles) => addFiles(newFiles, "")}
          onGooglePick={() => addFromGoogleDrive("")}
          onDropboxPick={() => addFromDropbox("")}
          currentFileCount={files.length}
          disabled={isMaxFilesReached}
        />
      )}

      {/* Files List & Processing */}
      {files.length > 0 && (
        <div className="md:mt-[1vw] mt-[1vh] fade-in">
          {/* File Items */}
          <div className="space-y-4">
            {files.map((file) => (
              <PdfRemovePagesFileItem
                key={file.id}
                file={file}
                config={config}
                updateFileSettings={updateFileSettings}
                removeFile={removeFile}
                isDark={isDark}
              />
            ))}
          </div>

          {/* Process Button or Validation Error */}
          <div className="md:mt-[1vw] mt-[1vh]">
            <GlassButton
              loading={processing}
              disabled={
                !canProcess || !hasValidPageRanges || !hasAnyPageSelected
              }
              primaryColor={config.primaryColor}
              onClick={processAllFiles}
            >
              {processing ? "Removing Pages..." : "Remove Pages from PDF"}
            </GlassButton>

            {!hasAnyPageSelected && canProcess && (
              <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center">
                  <ErrorSvg className="w-5 h-5 mr-2" />
                  Please select at least one page to remove
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Session Files */}
      <PdfSessionFilesDisplay toolType="pdf-remove-pages" config={config} />
    </div>
  );
};

export default RemovePdfPages;
