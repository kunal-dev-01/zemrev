import { PdfSignFileItem } from "./PdfSignFileItem";
import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdf.tool.config";
import { ErrorSvg } from "@/components/Svg/CommonSvg";
import { useSignPdf } from "@/hooks/pdfHooks/useSignPdf.hook";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import GlassButton from "@/components/Layouts/GlassButton";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const PdfSign = () => {
  const config = PDF_TOOL_CONFIGS["pdf-sign"];
  const isDark = useDarkMode();

  const {
    files,
    signing,
    addFiles,
    addFromGoogleDrive,
    addFromDropbox,
    removeFile,
    addSignature,
    updateSignature,
    deleteSignature,
    signAllFiles,
  } = useSignPdf();

  const totalSignatures = files.reduce(
    (acc, f) => acc + (f.settings.signatures?.length || 0),
    0
  );

  const canSign = totalSignatures > 0;
  const isMaxFilesReached = files.length >= config.maxFiles;
  const signatureText = `${totalSignatures} Signature${totalSignatures !== 1 ? "s" : ""}`;

  return (
    <div className="w-full md:mt-[1vw] mt-[1vh]">
      {/* Upload Zone */}
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

      {/* Files & Processing */}
      {files.length > 0 && (
        <div className="md:mt-[1vw] mt-[1vh] fade-in">
          {/* File Items */}
          <div className="space-y-4">
            {files.map((file) => (
              <PdfSignFileItem
                key={file.id}
                file={file}
                config={config}
                addSignature={addSignature}
                updateSignature={updateSignature}
                deleteSignature={deleteSignature}
                removeFile={removeFile}
                isDark={isDark}
              />
            ))}
          </div>

          {/* Sign Button or Validation */}
          <div className="md:mt-[1vw] mt-[1vh]">
            {canSign ? (
              <GlassButton
                loading={signing}
                primaryColor={config.primaryColor}
                onClick={signAllFiles}
              >
                {signing ? "Adding Signatures..." : `Add ${signatureText} to PDF`}
              </GlassButton>
            ) : (
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <ErrorSvg className="w-5 h-5 inline-block mr-1" />
                  Please add at least one signature before processing
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Session Files */}
      <PdfSessionFilesDisplay toolType="sign-pdf" config={config} />
    </div>
  );
};

export default PdfSign;