import Link from "next/link";
import { memo, useCallback, FC, useEffect } from "react";
import clsx from "clsx";
import { useCommonModal } from "@/hooks/appHooks/common.hooks";
import { SidebarCloseSvg } from "@/components/Svg/NavSvg";
import {
  ResizeSvg,
  Minimize2,
  ArrowRightLeft,
  FileImage,
  CropSvg,
  Watermark,
  MetadataSvg,
  ColorPaletteSvg,
  ScissorSvg
} from "@/components/Svg/HomeSvg";
import {
  ExtractImagesFromPdfSvg,
  ExtractTextFromPdfSvg,
  ImageToPDFSvg,
  PDFCompressSvg,
  PDFMergerSvg,
  PDFOptimizerSvg,
  PDFSplitterSvg,
  PDFToImageSVg,
  FlattenPDFSvg,
  PDFWatermarkSvg,
  RotateImageSvg,
  SecurePdfSvg,
  UnlockPdfSvg,
  OCRPDFSvg,
  SignPDFSvg,
  PDFASvg,
  CropPDFSvg,
} from "@/components/Svg/PdfSvg";

/* ================= Types & Interfaces ================= */

// Tool ke liye ek proper interface define kiya hai
interface ToolItem {
  name: string;
  href: string;
  icon: FC<React.SVGProps<SVGSVGElement>>;
  color: string;
  bg: string;
}

interface ToolSectionProps {
  title: string;
  tools: ToolItem[]; 
  onClose: () => void;
}

/* ================= Categorized Tools ================= */

const ImageTools: ToolItem[] = [
  { name: "Image Converter", href: "/image/image-converter", icon: ArrowRightLeft, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  { name: "Image Compressor", href: "/image/image-compressor", icon: Minimize2, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
  { name: "Image Optimizer", href: "/image/image-optimizer", icon: FileImage, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10" },
  { name: "Image Resizer", href: "/image/image-resizer", icon: ResizeSvg, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
  { name: "Image Cropper", href: "/image/image-cropper", icon: CropSvg, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
  { name: "Watermark Tool", href: "/image/image-watermark", icon: Watermark, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-500/10" },
  { name: "Metadata Extractor", href: "/image/extract-meta-data", icon: MetadataSvg, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-600/10" },
  { name: "Color Palette", href: "/image/extract-color-palette", icon: ColorPaletteSvg, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10" },
];

const PDFConvert: ToolItem[] = [
  { name: "PDF to Images", href: "/pdf/pdf-to-images", icon: PDFToImageSVg, color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-600/10" },
  { name: "Images to PDF", href: "/pdf/images-to-pdf", icon: ImageToPDFSvg, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-600/10" },
  { name: "Extract Text", href: "/pdf/pdf-text-extract", icon: ExtractTextFromPdfSvg, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-600/10" },
  { name: "Extract Images", href: "/pdf/pdf-image-extract", icon: ExtractImagesFromPdfSvg, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-600/10" },
  { name: "OCR PDF", href: "/pdf/pdf-ocr", icon: OCRPDFSvg, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-600/10" },
  { name: "PDF/A Converter", href: "/pdf/pdf-a", icon: PDFASvg, color: "text-teal-700", bg: "bg-teal-50 dark:bg-teal-700/10" },
];

const PDFOrganize: ToolItem[] = [
  { name: "PDF Merger", href: "/pdf/pdf-merge", icon: PDFMergerSvg, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-600/10" },
  { name: "PDF Splitter", href: "/pdf/pdf-split", icon: PDFSplitterSvg, color: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-600/10" },
  { name: "Rotate Pages", href: "/pdf/pdf-rotate", icon: RotateImageSvg, color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-600/10" },
  { name: "Crop PDF", href: "/pdf/pdf-crop", icon: CropPDFSvg, color: "text-lime-700", bg: "bg-lime-50 dark:bg-lime-700/10" },
  { name: "Flatten PDF", href: "/pdf/pdf-flatten", icon: FlattenPDFSvg, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-600/10" },
  { name: "Remove Pages", href: "/pdf/remove-pdf-pages", icon: ScissorSvg, color: "text-slate-600", bg: "bg-slate-50 dark:bg-slate-600/10" },
];

const PDFSecurity: ToolItem[] = [
  { name: "PDF Compressor", href: "/pdf/pdf-compressor", icon: PDFCompressSvg, color: "text-red-600", bg: "bg-red-50 dark:bg-red-600/10" },
  { name: "Sign PDF", href: "/pdf/pdf-sign", icon: SignPDFSvg, color: "text-amber-700", bg: "bg-amber-50 dark:bg-amber-700/10" },
  { name: "Add Watermark", href: "/pdf/pdf-watermark", icon: PDFWatermarkSvg, color: "text-fuchsia-600", bg: "bg-fuchsia-50 dark:bg-fuchsia-600/10" },
  { name: "Secure PDF", href: "/pdf/pdf-secure", icon: SecurePdfSvg, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-600/10" },
  { name: "Unlock PDF", href: "/pdf/pdf-unlock", icon: UnlockPdfSvg, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-600/10" },
  { name: "PDF Optimizer", href: "/pdf/pdf-optimize", icon: PDFOptimizerSvg, color: "text-lime-600", bg: "bg-lime-50 dark:bg-lime-600/10" },
];

/* ================= UI Components ================= */

const Backdrop: FC<{ isOpen: boolean; onClick: () => void }> = memo(
  ({ isOpen, onClick }) => (
    <div
      onClick={onClick}
      className={clsx(
        "fixed inset-0 z-40 bg-zinc-900/20 dark:bg-black/60 backdrop-blur-[2px] transition-all duration-500",
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      )}
    />
  )
);

const ToolSection: FC<ToolSectionProps> = memo(
  ({ title, tools, onClose }) => (
    <div className="mb-8">
      <h3 className="text-[10px] uppercase tracking-[2px] font-bold text-zinc-400 dark:text-zinc-500 mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        {title}
      </h3>
      <div className="space-y-1">
        {tools.map((tool, index) => (
          <Link
            key={index}
            href={tool.href}
            onClick={onClose}
            className="group relative flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-300 ease-in-out
             hover:bg-white dark:hover:bg-zinc-800/60 
             hover:translate-x-1.5 active:translate-x-0.5"
          >
            <div className={clsx(
              "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:shadow-sm",
              tool.bg
            )}>
              <div className={clsx("w-5 h-5 transition-transform duration-500", tool.color)}>
                <tool.icon />
              </div>
            </div>

            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors duration-300">
              {tool.name}
            </span>
            
            <div className="absolute left-0 w-1 h-0 bg-blue-600 dark:bg-blue-500 rounded-r-full group-hover:h-5 transition-all duration-300 ease-out top-1/2 -translate-y-1/2" />
          </Link>
        ))}
      </div>
    </div>
  )
);

/* ================= Main SideBar ================= */

const SideBar: FC = () => {
  const { isOpenSidebar, setOpenSidebar } = useCommonModal();

  const closeSidebar = useCallback(() => {
    setOpenSidebar(false);
  }, [setOpenSidebar]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isOpenSidebar) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
    }
    return () => {
      if (typeof window !== "undefined") document.body.style.overflow = "unset";
    };
  }, [isOpenSidebar]);

  return (
    <>
      <Backdrop isOpen={isOpenSidebar} onClick={closeSidebar} />

      <aside
        className={clsx(
          "fixed top-0 right-0 z-50 h-screen w-[300px] pb-5 md:pb-0 flex flex-col bg-zinc-50/95 dark:bg-[#0b0b0b]/95 backdrop-blur-xl border-l border-zinc-200 dark:border-zinc-800 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) shadow-2xl",
          isOpenSidebar ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-900/50">
          <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            Zemrev<span className="text-blue-600">.</span>
          </h2>
          <button
            onClick={closeSidebar}
            className="p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <div className="w-5 h-5 rotate-180">
              <SidebarCloseSvg />
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          <ToolSection title="Image Tools" tools={ImageTools} onClose={closeSidebar} />
          <ToolSection title="PDF: Convert" tools={PDFConvert} onClose={closeSidebar} />
          <ToolSection title="PDF: Organize" tools={PDFOrganize} onClose={closeSidebar} />
          <ToolSection title="PDF: Security" tools={PDFSecurity} onClose={closeSidebar} />
        </div>

        <div className="p-5 border-t border-zinc-100 dark:border-zinc-900/50 bg-white/30 dark:bg-transparent">
          <p className="text-[11px] font-bold text-zinc-400 text-center uppercase tracking-widest">
            Privacy Focused • Fast
          </p>
        </div>
      </aside>
    </>
  );
};

export default memo(SideBar);