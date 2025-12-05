import ToolsGrid, { ToolItem } from "./ToolsGrid";
import {
  FileImage,
  Minimize2,
  ResizeSvg,
  ArrowRightLeft,
  CropSvg,
  Watermark,
} from "@/components/Svg/HomeSvg";
import { PDFCompressSvg, PDFMergerSvg, PDFSplitterSvg, PDFToImageSVg } from "@/components/Svg/PdfSvg";

const imageTools: ToolItem[] = [
  {
    title: "Image Converter",
    desc: "Convert between JPG, PNG, WebP, and AVIF instantly.",
    icon: ArrowRightLeft,
    link: "/image/image-converter",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    title: "Image Compressor",
    desc: "Reduce file size up to 80% without losing visible quality.",
    icon: Minimize2,
    link: "/image/image-compressor",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  {
    title: "Image Optimizer",
    desc: "Optimize your images for maximum clarity and minimum size.",
    icon: FileImage,
    link: "/image/image-optimizer",
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-500/10",
  },
  {
    title: "Image Resizer",
    desc: "Smart image resizing that keeps every detail sharp.",
    icon: ResizeSvg,
    link: "/image/image-resizer",
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
  },
  {
    title: "Image Cropper",
    desc: "Crop and frame your images with precision in seconds.",
    icon: CropSvg,
    link: "/image/image-cropper",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
  },
  {
    title: "Watermark Tool",
    desc: "Add clean, professional watermarks to protect your images.",
    icon: Watermark,
    link: "/image/image-watermark",
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-500/10",
  },
];

/* -------------------------------------
   PDF TOOLS — SEO Optimized + Unique Colors
-------------------------------------- */

const pdfTools: ToolItem[] = [
  {
    title: "PDF Compressor",
    desc: "Compress PDFs using advanced optimization for smaller, cleaner files.",
    icon: PDFCompressSvg,
    link: "/pdf/pdf-compressor",
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-500/10",
  },
  {
    title: "PDF Merger",
    desc: "Combine multiple PDF files into one perfectly organized document.",
    icon: PDFMergerSvg,
    link: "/pdf/pdf-merge",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-500/10",
  },
  {
    title: "PDF Splitter",
    desc: "Split large PDFs into smaller, separate pages or ranges.",
    icon: PDFSplitterSvg,
    link: "/pdf/pdf-split",
    color: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-500/10",
  },
  {
    title: "PDF to Images",
    desc: "Convert PDF pages into high-quality PNG or JPG images.",
    icon: PDFToImageSVg,
    link: "/pdf/pdf-to-images",
    color: "text-teal-500",
    bg: "bg-teal-50 dark:bg-teal-500/10",
  },
  {
    title: "Images to PDF",
    desc: "Combine multiple images into a single, well-structured PDF.",
    icon: CropSvg,
    link: "/pdf/images-to-pdf",
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-500/10",
  },
  {
    title: "PDF to Word",
    desc: "Convert any PDF into a fully editable Word document.",
    icon: Watermark,
    link: "/pdf/pdf-to-word",
    color: "text-fuchsia-500",
    bg: "bg-fuchsia-50 dark:bg-fuchsia-500/10",
  },
  {
    title: "PDF to Excel",
    desc: "Extract tables and convert PDFs to Excel spreadsheets.",
    icon: FileImage,
    link: "/pdf/pdf-to-excel",
    color: "text-lime-600",
    bg: "bg-lime-50 dark:bg-lime-600/10",
  },
  {
    title: "Extract Text from PDF",
    desc: "Extract clean, selectable text from scanned or digital PDFs.",
    icon: ArrowRightLeft,
    link: "/pdf/pdf-text-extract",
    color: "text-slate-600",
    bg: "bg-slate-50 dark:bg-slate-600/10",
  },
  {
    title: "Extract Images from PDF",
    desc: "Download all embedded images from any PDF in original quality.",
    icon: FileImage,
    link: "/pdf/pdf-image-extract",
    color: "text-stone-600",
    bg: "bg-stone-50 dark:bg-stone-600/10",
  },
  {
    title: "Add Watermark to PDF",
    desc: "Apply text or image watermarks across all PDF pages.",
    icon: Watermark,
    link: "/pdf/pdf-watermark",
    color: "text-neutral-600",
    bg: "bg-neutral-50 dark:bg-neutral-600/10",
  },
  {
    title: "Rotate PDF Pages",
    desc: "Rotate any PDF page left, right, or 180 degrees instantly.",
    icon: ResizeSvg,
    link: "/pdf/pdf-rotate",
    color: "text-brown-600",
    bg: "bg-amber-50 dark:bg-brown-600/10",
  },
  {
    title: "Secure PDF",
    desc: "Add password protection and encrypt your PDF files.",
    icon: Watermark,
    link: "/pdf/pdf-secure",
    color: "text-zinc-600",
    bg: "bg-zinc-50 dark:bg-zinc-600/10",
  },
  {
    title: "Unlock PDF",
    desc: "Remove password protection from unlocked or accessible PDFs.",
    icon: ArrowRightLeft,
    link: "/pdf/pdf-unlock",
    color: "text-yellow-700",
    bg: "bg-yellow-50 dark:bg-yellow-700/10",
  },
  {
    title: "PDF Optimizer",
    desc: "Clean, optimize, and reduce PDF clutter without quality loss.",
    icon: Minimize2,
    link: "/pdf/pdf-optimize",
    color: "text-pink-600",
    bg: "bg-pink-50 dark:bg-pink-600/10",
  },
  {
    title: "PDF to HTML",
    desc: "Convert PDFs into clean, structured HTML pages.",
    icon: ArrowRightLeft,
    link: "/pdf/pdf-to-html",
    color: "text-sky-600",
    bg: "bg-sky-50 dark:bg-sky-600/10",
  },
  {
    title: "PDF to Text",
    desc: "Convert PDF documents to plain, editable text files.",
    icon: FileImage,
    link: "/pdf/pdf-to-text",
    color: "text-indigo-600",
    bg: "bg-indigo-50 dark:bg-indigo-600/10",
  },
  {
    title: "PDF to EPUB",
    desc: "Convert your PDFs into EPUB format for eBook readers.",
    icon: Watermark,
    link: "/pdf/pdf-to-epub",
    color: "text-green-700",
    bg: "bg-green-50 dark:bg-green-700/10",
  },
  {
    title: "PDF to CSV",
    desc: "Extract table data from PDFs and export as CSV files.",
    icon: FileImage,
    link: "/pdf/pdf-to-csv",
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-600/10",
  },
];

const FeaturedTools = () => {
  return (
    <section className="w-full" id="tools">
      <ToolsGrid
        title="Ultimate Image Toolkit"
        subtitle="Everything you need to manage and transform your images."
        tools={imageTools}
      />

      <ToolsGrid
        title="Powerful PDF Tools"
        subtitle="Compress, merge, split, and convert PDFs effortlessly."
        tools={pdfTools}
      />
    </section>
  );
};

export default FeaturedTools;
