import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronDownSvg, TrashSvg } from "@/components/Svg/CommonSvg";
import { UndoSvg } from "@/components/Svg/ToolsSvg";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfRemoveViewerProps {
  file: File;
  pagesToRemove: number[];
  onPageRemove?: (pageNumber: number) => void;
  onPageUndo?: (pageNumber: number) => void;
}

export const PdfRemoveViewer = ({
  file,
  pagesToRemove,
  onPageRemove,
  onPageUndo,
}: PdfRemoveViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Handle container resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(containerRef.current!);

    return () => resizeObserver.disconnect();
  }, []);

  const isCurrentPageRemoved = pagesToRemove.includes(currentPage);
  const remainingPages = numPages ? numPages - pagesToRemove.length : 0;
  const pageWidth = containerWidth > 600 ? 500 : containerWidth - 32;
  const canNavigatePrev = currentPage > 1;
  const canNavigateNext = currentPage < (numPages || 0);

  const handlePageChange = (direction: "prev" | "next") => {
    setCurrentPage((prev) => {
      if (direction === "prev") return Math.max(1, prev - 1);
      return Math.min(numPages || prev, prev + 1);
    });
  };

  const handleRemovePage = () => onPageRemove?.(currentPage);
  const handleUndoRemove = () => {
    if (isCurrentPageRemoved) onPageUndo?.(currentPage);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header Section */}
      <div className="flex flex-col gap-2 px-1">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold uppercase text-zinc-500">
            Preview
          </h4>

          {/* Navigation Controls */}
          {numPages && numPages > 1 && (
            <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1">
              <button
                type="button"
                onClick={() => handlePageChange("prev")}
                disabled={!canNavigatePrev}
                className="p-1 rounded-md transition-colors hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronDownSvg className="w-4 h-4 rotate-90" />
              </button>
              <span className="text-xs font-mono w-10 text-center">
                {currentPage}/{numPages}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange("next")}
                disabled={!canNavigateNext}
                className="p-1 rounded-md transition-colors hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 cursor-pointer"
                aria-label="Next page"
              >
                <ChevronDownSvg className="w-4 h-4 -rotate-90" />
              </button>
            </div>
          )}
        </div>

        {/* Status Bar */}
        {numPages && (
          <div className="flex flex-col md:flex-row gap-2 text-xs">
            {[
              {
                label: "Total:",
                value: `${numPages} pages`,
                bgClass: "bg-zinc-100 dark:bg-zinc-800",
                textClass: "text-zinc-600 dark:text-zinc-400",
                valueClass: "text-zinc-800 dark:text-zinc-200",
              },
              {
                label: "Removing:",
                value: `${pagesToRemove.length} pages`,
                bgClass: "bg-red-100 dark:bg-red-900/30",
                textClass: "text-red-500 dark:text-red-400",
                valueClass: "text-red-500 dark:text-red-400",
              },
              {
                label: "Remaining:",
                value: `${remainingPages} pages`,
                bgClass: "bg-green-100 dark:bg-green-900/40",
                textClass: "text-green-600 dark:text-green-400",
                valueClass: "text-green-700 dark:text-green-300",
              },
            ].map(({ label, value, bgClass, textClass, valueClass }) => (
              <div
                key={label}
                className={`flex items-center gap-1.5 px-2 py-1 ${bgClass} rounded-md`}
              >
                <span className={`${textClass}`}>{label}</span>
                <span className={`font-semibold ${valueClass}`}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF Viewer Container */}
      <div
        ref={containerRef}
        className="relative bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex justify-center py-4 min-h-[400px]"
      >
        <Document
          file={file}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={
            <div className="text-xs text-zinc-500 mt-10">Loading PDF...</div>
          }
        >
          <div className="relative inline-block">
            {/* Removed Page Overlay */}
            {isCurrentPageRemoved && (
              <div className="absolute inset-0 z-20 bg-red-500/20 backdrop-blur-sm flex items-center justify-center rounded-lg">
                <div className="bg-red-600 text-white px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2">
                  <TrashSvg className="w-6 h-6" />
                  This page will be removed
                </div>
              </div>
            )}

            <Page
              pageNumber={currentPage}
              width={pageWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className={`bg-white transition-opacity ${
                isCurrentPageRemoved ? "opacity-50" : ""
              }`}
            />

            {/* Action Button */}
            {!isCurrentPageRemoved ? (
              <button
                onClick={handleRemovePage}
                className="absolute top-2 right-2 z-30 bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded-xl transition-all duration-200 cursor-pointer"
                title="Remove this page"
                aria-label="Remove current page"
              >
                <TrashSvg className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleUndoRemove}
                className="absolute top-2 right-2 z-30 bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded-xl transition-all duration-200 cursor-pointer"
                title="Undo remove this page"
                aria-label="Undo remove current page"
              >
                <UndoSvg />
              </button>
            )}
          </div>
        </Document>
      </div>

      {/* Page Navigation Strip */}
      {numPages && numPages > 1 && (
        <div className="px-1 shrink-0 my-2">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
            All Pages ({numPages})
          </label>
          <div className="flex items-center gap-2">
            {/* Previous Arrow */}
            <button
              type="button"
              onClick={() => handlePageChange("prev")}
              disabled={!canNavigatePrev}
              className="shrink-0 w-8 h-10 bg-[#475569] rounded-md disabled:opacity-60 cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center"
              aria-label="Previous page"
            >
              <ChevronDownSvg className="w-6 h-6 rotate-90" />
            </button>

            {/* Scrollable Page Numbers */}
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex gap-1.5">
                {Array.from({ length: numPages }, (_, i) => i + 1).map(
                  (pageNum) => {
                    const isRemoved = pagesToRemove.includes(pageNum);
                    const isCurrent = pageNum === currentPage;

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`shrink-0 w-10 h-10 rounded-lg text-xs font-semibold transition-all cursor-pointer border-2 ${
                          isRemoved
                            ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 line-through border-transparent"
                            : isCurrent
                            ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Next Arrow */}
            <button
              type="button"
              onClick={() => handlePageChange("next")}
              disabled={!canNavigateNext}
              className="shrink-0 w-8 h-10 bg-[#475569] rounded-md disabled:opacity-60 cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center"
              aria-label="Next page"
            >
              <ChevronDownSvg className="w-6 h-6 -rotate-90" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
