import React from "react";
import Link from "next/link";
import {
  FileImage,
  Minimize2,
  ResizeSvg,
  ArrowRightLeft,
} from "@/components/Svg/HomeSvg";

const tools = [
  {
    title: "Image Compressor",
    desc: "Reduce file size up to 80% without losing visible quality.",
    icon: Minimize2,
    link: "/image/image-compressor",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  {
    title: "Image Converter",
    desc: "Convert between JPG, PNG, WebP, and AVIF instantly.",
    icon: ArrowRightLeft,
    link: "/image/image-converter",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    title: "Image to PDF",
    desc: "Turn your scanned images or photos into professional PDFs.",
    icon: FileImage,
    link: "/image/image-to-pdf",
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-500/10",
  },
  {
    title: "Image Resizer",
    desc: "Resize your images without losing quality.",
    icon: ResizeSvg,
    link: "/image/image-resizer",
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
  },
];

const ToolsGridSection: React.FC = () => {
  return (
    <section className="w-full">
      <div id="tools" className="w-full md:p-12">

        {/* Section Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
          <div className="mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-700 dark:text-zinc-300">
              Powerful Utilities
            </h2>
            <p className="text-zinc-500 mt-2">
              Everything you need to manage your files efficiently.
            </p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {tools.map(({ title, desc, icon: Icon, link, bg, color }, index) => (
            <Link
              href={link}
              key={index}
              className="
                group relative p-5 flex flex-col gap-4 rounded-xl cursor-pointer
                border border-zinc-100 dark:border-zinc-800
                transition-all duration-300 ease-out
              "
            >
              <div
                className={`
                  w-12 h-12 p-2.5 rounded-lg flex items-center justify-center
                  transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
                  ${bg} ${color}
                `}
              >
                <Icon />
              </div>

              <div>
                <h3 className="font-semibold text-lg text-zinc-700 dark:text-zinc-300 transition-colors">
                  {title}
                </h3>
                <p className="text-sm mt-1.5 leading-relaxed text-zinc-500 dark:text-zinc-400 transition-colors group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                  {desc}
                </p>
              </div>

              {/* Hover BG Animation */}
              <div
                className={`
                  absolute inset-0 rounded-xl opacity-0 scale-80 -z-1
                  transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:scale-100
                  ${bg}
                `}
              />
            </Link>
          ))}

        </div>
      </div>
    </section>
  );
};

export default ToolsGridSection;
