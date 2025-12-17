// ============================================================================
// FILE: src/app/tools/pdf-sign/page.tsx (UPDATED)
// ============================================================================

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
    updateFileSettings,
    addSignature,
    updateSignature,
    deleteSignature,
    signAllFiles,
  } = useSignPdf();

  // Derived state
  const pendingFiles = files.filter((f) => f.status === "pending");
  const totalSignatures = files.reduce(
    (acc, f) => acc + (f.settings.signatures?.length || 0),
    0
  );
  const canSign = pendingFiles.length > 0 && totalSignatures > 0 && !signing;

  return (
    <div className="w-full md:mt-[1vw] mt-[1vh]">
      {files.length === 0 && (
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
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 dark:bg-zinc-900 bg-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 md:text-sm text-xs text-zinc-600 dark:text-zinc-400">
                {files.length} File{files.length !== 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-2 dark:bg-blue-900/20 bg-blue-50 border border-blue-200 dark:border-blue-800 rounded-xl px-3 py-1.5 md:text-sm text-xs text-blue-600 dark:text-blue-400 font-medium">
                {totalSignatures} Signature{totalSignatures !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {files.map((file) => (
              <PdfSignFileItem
                key={file.id}
                file={file}
                config={config}
                updateSettings={updateFileSettings}
                addSignature={addSignature}
                updateSignature={updateSignature}
                deleteSignature={deleteSignature}
                removeFile={removeFile}
                isDark={isDark}
              />
            ))}
          </div>

          {canSign && (
              <GlassButton
                loading={signing}
                primaryColor={config.primaryColor}
                onClick={signAllFiles}
              >
                {signing
                  ? "Adding Signatures..."
                  : `Add ${totalSignatures} Signature${totalSignatures !== 1 ? "s" : ""} to PDF`}
              </GlassButton>
          )}

          {!canSign && totalSignatures === 0 && (
            <div className="mt-6 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <ErrorSvg className="w-5 h-5 inline-block mr-1" /> Please add at least one signature before processing
              </p>
            </div>
          )}
        </div>
      )}

      <PdfSessionFilesDisplay toolType="sign-pdf" config={config} />
    </div>
  );
};

export default PdfSign;