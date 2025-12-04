import ToolsGrid, { ToolItem } from "./ToolsGrid";
import {
  FileImage,
  Minimize2,
  ResizeSvg,
  ArrowRightLeft,
  CropSvg,
  Watermark,
} from "@/components/Svg/HomeSvg";

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

const pdfTools: ToolItem[] = [
  {
    title: "PDF Compressor",
    desc: "Reduce PDF size while keeping high readability.",
    icon: Minimize2,
    link: "/pdf/pdf-compressor",
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-500/10",
  },
  {
    title: "PDF Merger",
    desc: "Combine multiple PDF files into one clean document.",
    icon: FileImage,
    link: "/pdf/pdf-merge",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-500/10",
  },
  {
    title: "PDF Splitter",
    desc: "Split large PDFs into smaller, more manageable files.",
    icon: ResizeSvg,
    link: "/pdf/pdf-split",
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-500/10",
  },
  {
    title: "PDF to Images",
    desc: "Convert PDF pages into PNG/JPG images instantly.",
    icon: ArrowRightLeft,
    link: "/pdf/pdf-to-images",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
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
