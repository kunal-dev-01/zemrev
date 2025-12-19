// ============================================================================
// FILE: src/components/PdfTools/SignPdf/PdfSignViewer.tsx (UPDATED)
// ============================================================================

import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronDownSvg } from "@/components/Svg/CommonSvg";
import type { PdfFileSettings, SignatureItem } from "@/services/pdfService/types";
import { DraggableSignature } from "./DraggableSignature";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfSignViewerProps {
  file: File;
  settings: PdfFileSettings;
  onUpdateSignature: (signatureId: string, updates: Partial<SignatureItem>) => void;
  onDeleteSignature: (signatureId: string) => void;
  onSelectSignature: (signatureId: string) => void;
  selectedSignatureId: string | null;
  // --- NEW PROPS FOR SYNC ---
  activePage: number; // 1-based page number from parent
  onPageChange: (page: number) => void; // Notify parent when page changes
}

export const PdfSignViewer = ({
  file,
  settings,
  onUpdateSignature,
  onDeleteSignature,
  onSelectSignature,
  selectedSignatureId,
  activePage,      // Receive current page
  onPageChange,    // Send update back
}: PdfSignViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  
  // Local state ko parent ke prop se sync rakho
  const [currentPage, setCurrentPage] = useState(activePage);

  // Jab Parent (Input) change ho, toh Viewer update karo
  useEffect(() => {
    setCurrentPage(activePage);
  }, [activePage]);

  const [pageWidth, setPageWidth] = useState(0);
  const [renderedWidth, setRenderedWidth] = useState(0);
  const [renderedHeight, setRenderedHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Handle Resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    window.addEventListener("resize", updateWidth);
    updateWidth();
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Calculate Scale
  const scale = pageWidth > 0 && renderedWidth > 0 ? renderedWidth / pageWidth : 1;

  // Get signatures for current page
  const currentPageSignatures = (settings.signatures || []).filter(
    (sig) => sig.page === currentPage - 1
  );

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectSignature('');
    }
  };

  // --- NEW HANDLERS FOR NAVIGATION ---
  const handlePrevPage = () => {
    const newPage = Math.max(1, currentPage - 1);
    setCurrentPage(newPage);
    onPageChange(newPage); // Parent ko batao
  };

  const handleNextPage = () => {
    if (!numPages) return;
    const newPage = Math.min(numPages, currentPage + 1);
    setCurrentPage(newPage);
    onPageChange(newPage); // Parent ko batao
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Preview (Page {currentPage}/{numPages || '?'})
        </span>
        {numPages && numPages > 1 && (
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded-md disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ChevronDownSvg className="w-4 h-4 rotate-90" />
            </button>
            <span className="text-xs font-mono w-10 text-center">
              {currentPage}/{numPages}
            </span>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage >= numPages}
              className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded-md disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ChevronDownSvg className="w-4 h-4 -rotate-90" />
            </button>
          </div>
        )}
      </div>

      {/* PDF Container */}
      <div
        ref={containerRef}
        className="relative bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex justify-center py-4 min-h-[400px]"
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
                // Force re-measure canvas for accuracy
                setTimeout(() => {
                    const canvas = document.querySelector(
                    `.react-pdf__Page[data-page-number="${currentPage}"] canvas`
                    );
                    if (canvas) {
                        const rect = canvas.getBoundingClientRect();
                        setRenderedWidth(rect.width);
                        setRenderedHeight(rect.height);
                    }
                }, 100);
              }}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="bg-white"
            >
              {currentPageSignatures.map((signature) => (
                <DraggableSignature
                  key={signature.id}
                  signature={signature}
                  scale={scale}
                  onUpdate={(updates) => onUpdateSignature(signature.id, updates)}
                  onDelete={() => onDeleteSignature(signature.id)}
                  isSelected={selectedSignatureId === signature.id}
                  onSelect={() => onSelectSignature(signature.id)}
                  containerWidth={renderedWidth}
                  containerHeight={renderedHeight}
                />
              ))}
            </Page>
          </div>
        </Document>
      </div>
    </div>
  );
};