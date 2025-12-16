import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdfToolConfigs";
import { CancelSvg, ErrorSvg } from "@/components/Svg/CommonSvg";
import GlassButton from "@/components/Layouts/GlassButton";
import { usePdfMerge } from "@/hooks/pdfHooks/usePdfMerge.hook";
import { PDFToImageSVg } from "@/components/Svg/PdfSvg";
import { ClearAllButton, FileInfo } from "@/components/Shared/FileUI";

const PdfMerge = () => {
  const config = PDF_TOOL_CONFIGS["pdf-merge"];

  const {
    files,
    merging,
    stats,
    addFiles,
    removeFile,
    mergeFiles,
    addFromGoogleDrive,
    addFromDropbox,
    clearAll,
  } = usePdfMerge();

  const canMerge = files.length >= 2 && !merging;
  const canAddMore = files.length < config.maxFiles;

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="w-full md:mt-[1vw] mt-[1vh]">
      {/* Drag & Drop Zone */}
      <PdfDragDropZone
        config={config}
        onFilesSelected={addFiles}
        onGooglePick={addFromGoogleDrive}
        onDropboxPick={addFromDropbox}
        currentFileCount={files.length}
        disabled={!canAddMore}
      />

      {/* Pending Files Panel */}
      {files.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3 md:mt-[1vw] mt-[1vh]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 dark:bg-zinc-900 bg-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 md:text-sm text-xs text-zinc-600 dark:text-zinc-400">
              {files.length} PDF{files.length !== 1 ? "s" : ""} Loaded
            </div>

            <ClearAllButton onClick={clearAll} />
          </div>

          {/* PDF Preview Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {files.map((file, index) => (
              <div
                key={file.id}
                className="relative group bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-600 transition-all"
              >
                {/* PDF Icon Preview */}
                <div className="aspect-3/4 flex items-center justify-center p-4">
                  <div
                    style={{ color: config.primaryColor }}
                    className="w-17 h-17 md:w-30 md:h-30"
                  >
                    <PDFToImageSVg />
                  </div>
                </div>

                {/* File Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/30 dark:from-black/60 to-transparent p-3">
                  <FileInfo name={file.name} size={file.size} />
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFile(file.id)}
                  className="absolute top-2 right-2 px-3 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer"
                  aria-label="Remove file"
                >
                  <CancelSvg className="w-5 h-5" />
                </button>

                {/* Order Badge */}
                <div
                  className="absolute top-2 left-2 w-9 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold bg-zinc-100/20 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-700"
                  style={{ color: config.primaryColor }}
                >
                  {index + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Merge Button */}
          {canMerge && (
            <GlassButton
              loading={merging}
              primaryColor={config.primaryColor}
              onClick={mergeFiles}
            >
              {merging
                ? "Merging PDFs..."
                : `Merge ${stats.pending} PDF${stats.pending !== 1 ? "s" : ""}`}
            </GlassButton>
          )}

          {/* Minimum Files Warning */}
          {files.length === 1 && (
            <div className="mt-4 p-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                <ErrorSvg className="w-5 h-5 inline-block mr-2" /> Add at least
                2 PDFs to merge
              </p>
            </div>
          )}
        </div>
      )}

      <PdfSessionFilesDisplay toolType="pdf-merge" config={config} />
    </div>
  );
};

export default PdfMerge;
