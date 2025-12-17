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
  primaryColor: string;
  onUpdateSignature: (signatureId: string, updates: Partial<SignatureItem>) => void;
  onDeleteSignature: (signatureId: string) => void;
  onSelectSignature: (signatureId: string) => void;
  selectedSignatureId: string | null;
}

export const PdfSignViewer = ({
  file,
  settings,
  primaryColor,
  onUpdateSignature,
  onDeleteSignature,
  onSelectSignature,
  selectedSignatureId,
}: PdfSignViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
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

  // Calculate Scale (Pixels per Point)
  const scale = pageWidth > 0 && renderedWidth > 0 ? renderedWidth / pageWidth : 1;

  // Get signatures for current page
  const currentPageSignatures = (settings.signatures || []).filter(
    (sig) => sig.page === currentPage - 1
  );

  // Deselect when clicking on PDF background
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectSignature('');
    }
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
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded-md disabled:opacity-30 transition-colors"
            >
              <ChevronDownSvg className="w-4 h-4 rotate-90" />
            </button>
            <span className="text-xs font-mono w-10 text-center">
              {currentPage}/{numPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
              disabled={currentPage >= numPages}
              className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded-md disabled:opacity-30 transition-colors"
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
                const canvas = document.querySelector(
                  `.react-pdf__Page[data-page-number="${currentPage}"] canvas`
                );
                if (canvas) {
                  const rect = canvas.getBoundingClientRect();
                  setRenderedWidth(rect.width);
                  setRenderedHeight(rect.height);
                }
              }}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="bg-white"
            >
              {/* DRAGGABLE SIGNATURES */}
              {currentPageSignatures.map((signature) => (
                <DraggableSignature
                  key={signature.id}
                  signature={signature}
                  scale={scale}
                  primaryColor={primaryColor}
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

      {/* Helper Text */}
      <div className="text-xs text-zinc-400 text-center">
        {currentPageSignatures.length > 0 ? (
          <span>
            {currentPageSignatures.length} signature{currentPageSignatures.length !== 1 ? 's' : ''} on this page
          </span>
        ) : (
          <span>No signatures on this page - Add one using controls</span>
        )}
      </div>
    </div>
  );
};