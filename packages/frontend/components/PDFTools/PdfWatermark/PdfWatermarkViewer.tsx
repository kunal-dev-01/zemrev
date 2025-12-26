import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronDownSvg } from "@/components/Svg/CommonSvg";
import type {
  PdfFileSettings,
  SignatureItem,
} from "@/services/pdfService/types";
import { DraggableWatermark } from "./DraggableWatermark";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfWatermarkViewerProps {
  file: File;
  settings: PdfFileSettings;
  onUpdateWatermark: (
    watermarkId: string,
    updates: Partial<SignatureItem>
  ) => void;
  onDeleteWatermark: (watermarkId: string) => void;
  onSelectWatermark: (watermarkId: string) => void;
  selectedWatermarkId: string | null;
  activePage: number;
  onPageChange: (page: number) => void;
  onDimensionsChange?: (width: number, height: number) => void;
}

export const PdfWatermarkViewer = ({
  file,
  settings,
  onUpdateWatermark,
  onDeleteWatermark,
  onSelectWatermark,
  selectedWatermarkId,
  activePage,
  onPageChange,
  onDimensionsChange,
}: PdfWatermarkViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(activePage);
  const [pageWidth, setPageWidth] = useState(0);
  const [renderedWidth, setRenderedWidth] = useState(0);
  const [renderedHeight, setRenderedHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Sync active page
  useEffect(() => {
    setCurrentPage(activePage);
  }, [activePage]);

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

  const scale =
    pageWidth > 0 && renderedWidth > 0 ? renderedWidth / pageWidth : 1;
  const currentPageWatermarks = (settings.signatures || []).filter(
    (wm) => wm.page === -1 || wm.page === currentPage - 1
  );
  const canNavigatePrev = currentPage > 1;
  const canNavigateNext = currentPage < (numPages || 0);
  const isMultiPage = numPages && numPages > 1;

  const handlePageChange = (direction: "prev" | "next") => {
    const newPage =
      direction === "prev"
        ? Math.max(1, currentPage - 1)
        : Math.min(numPages || currentPage, currentPage + 1);

    setCurrentPage(newPage);
    onPageChange(newPage);
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectWatermark("");
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h4 className="text-sm font-semibold uppercase text-zinc-500">
          Preview
        </h4>

        {isMultiPage && (
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
            <span className="text-xs font-mono w-10 text-center select-none">{currentPage}/{numPages}</span>
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

      {/* PDF Container */}
      <div
        ref={containerRef}
        className="relative bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex justify-center py-4 min-h-100"
        onClick={handleBackgroundClick}
      >
        <Document
          file={file}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={
            <div className="text-xs text-zinc-500 mt-10">Loading PDF...</div>
          }
        >
          <div className="shadow-lg relative inline-block">
            <Page
              pageNumber={currentPage}
              width={containerWidth > 600 ? 500 : containerWidth - 32}
              onLoadSuccess={(page) => {
                setPageWidth(page.originalWidth);
                setTimeout(() => {
                  const canvas = document.querySelector(
                    `.react-pdf__Page[data-page-number="${currentPage}"] canvas`
                  );
                  if (canvas) {
                    const rect = canvas.getBoundingClientRect();
                    setRenderedWidth(rect.width);
                    setRenderedHeight(rect.height);
                    if (onDimensionsChange) {
                      onDimensionsChange(
                        page.originalWidth,
                        page.originalHeight
                      );
                    }
                  }
                }, 100);
              }}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="bg-white"
            >
              {currentPageWatermarks.map((watermark) => (
                <DraggableWatermark
                  key={watermark.id}
                  watermark={watermark}
                  scale={scale}
                  onUpdate={(updates) =>
                    onUpdateWatermark(watermark.id, updates)
                  }
                  onDelete={() => onDeleteWatermark(watermark.id)}
                  isSelected={selectedWatermarkId === watermark.id}
                  onSelect={() => onSelectWatermark(watermark.id)}
                  containerWidth={renderedWidth}
                  containerHeight={renderedHeight}
                />
              ))}
            </Page>
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
              className="shrink-0 w-8 h-10 bg-[#C026D3] rounded-md disabled:opacity-60 cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center"
              aria-label="Previous page"
            >
              <ChevronDownSvg className="w-6 h-6 rotate-90" />
            </button>

            {/* Scrollable Page Numbers */}
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex gap-1.5">
                {Array.from({ length: numPages }, (_, i) => i + 1).map(
                  (pageNum) => {
                    const isCurrent = pageNum === currentPage;
                    const hasWatermark = (settings.signatures || []).some(
                      (wm) => wm.page === pageNum - 1 || wm.page === -1
                    );

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => {
                          setCurrentPage(pageNum);
                          onPageChange(pageNum);
                        }}
                        className={`shrink-0 w-10 h-10 rounded-lg text-xs font-semibold transition-all cursor-pointer border-2 relative ${
                          isCurrent
                            ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        }`}
                      >
                        {pageNum}
                        {hasWatermark && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full text-[8px] flex items-center justify-center text-white">
                            ✓
                          </span>
                        )}
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
              className="shrink-0 w-8 h-10 bg-[#C026D3] rounded-md disabled:opacity-60 cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center"
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
