import { PdfDragDropZone } from "@/components/Shared/PdfDragDropZone";
import { PdfSessionFilesDisplay } from "@/components/Shared/PdfSessionFilesDisplay";
import { PDF_TOOL_CONFIGS } from "@/config/pdfToolConfigs";
import { TrashSvg, CancelSvg, ErrorSvg } from "@/components/Svg/CommonSvg";
import GlassButton from "@/components/Layouts/GlassButton";
import { usePdfMerge } from "@/hooks/pdfHooks/usePdfMerge.hook";
import { PDFToImageSVg } from "@/components/Svg/PdfSvg";

const PdfMerge = () => {
  const config = PDF_TOOL_CONFIGS["pdf-merge"];

  const { files, merging, stats, addFiles, removeFile, mergeFiles, clearAll } =
    usePdfMerge();

  const canMerge = files.length >= 2 && !merging;
  const canAddMore = files.length < config.maxFiles;

  // ============================================================================
  // FORMAT BYTES
  // ============================================================================
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  // ============================================================================
  // TRUNCATE FILE NAME
  // ============================================================================
  const truncateFileName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    const ext = name.split(".").pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
    const truncated = nameWithoutExt.substring(
      0,
      maxLength - (ext?.length || 0) - 4
    );
    return `${truncated}...${ext}`;
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="w-full md:mt-[1vw] mt-[1vh]">
      {/* Drag & Drop Zone */}
      <PdfDragDropZone
        config={config}
        onFilesSelected={addFiles}
        currentFileCount={files.length}
        disabled={!canAddMore}
      />

      {/* Pending Files Panel */}
      {files.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/40 md:p-6 p-3 md:mt-[1vw] mt-[1vh]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 dark:bg-zinc-900 bg-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-1.5">
              <p className="md:text-sm text-xs text-zinc-600 dark:text-zinc-400">
                {stats.pending} PDF{stats.pending !== 1 ? "s" : ""} ready to
                merge
              </p>
            </div>

            <button
              onClick={clearAll}
              className="px-4 py-1.5 rounded-xl font-medium text-red-600 bg-red-50 dark:bg-red-900/20 flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 cursor-pointer"
            >
              <span className="w-5 h-5">
                <TrashSvg />
              </span>
              <span className="md:block hidden">Clear All</span>
            </button>
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
                  <div style={{color:config.primaryColor}} className="w-17 h-17 md:w-30 md:h-30">
                    <PDFToImageSVg />
                  </div>
                </div>

                {/* File Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/30 dark:from-black/60 to-transparent p-3">
                  <p
                    className="text-xs font-medium dark:text-zinc-200 text-zinc-700 truncate"
                    title={file.name}
                  >
                    {truncateFileName(file.name)}
                  </p>
                  <p className="text-[10px] text-zinc-600 dark:text-zinc-300">
                    {formatBytes(file.size)}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFile(file.id)}
                  className="absolute top-2 right-2 px-3 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer"
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

      {/* Completed Session Files */}
      <div className="md:mt-[1vw] mt-[1vh]">
        <PdfSessionFilesDisplay toolType="pdf-merge" config={config} />
      </div>
    </div>
  );
};

export default PdfMerge;
