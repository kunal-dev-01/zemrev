import Link from "next/link";
import { ConvertSvg, CompressSvg, ResizeSvg, ArrowRightSvg } from "@/components/Svg/HomeSvg";

const tools = [
  {
    id: "converter",
    name: "Image Converter",
    desc: "Transform images between popular formats instantly.",
    icon: <ConvertSvg />,
    href: "/image-converter",
    delay: "0ms",
  },
  {
    id: "compressor",
    name: "Image Compressor",
    desc: "Reduce file size without losing quality.",
    icon: <CompressSvg />,
    href: "/image-compressor",
    delay: "100ms",
  },
  {
    id: "resizer",
    name: "Image Resizer",
    desc: "Resize dimensions with pixel-perfect accuracy.",
    icon: <ResizeSvg />,
    href: "/image-resizer",
    delay: "200ms",
  },
];

const FeaturedTools = () => {
  return (
    <section className="w-full py-24 px-4 bg-linear-to-b from-transparent to-zinc-50/50 dark:to-zinc-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Power Tools
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto text-lg font-light">
            Everything you need to process images perfectly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group relative bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-black/50 transition-all duration-500 ease-out hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: tool.delay }}
            >
              <div className="flex flex-col h-full">
                <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-primary transition-all duration-300">
                  <div className="w-6 h-6">{tool.icon}</div>
                </div>

                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {tool.name}
                </h3>
                
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-light mb-8 grow">
                  {tool.desc}
                </p>

                <div className="flex items-center text-sm font-medium text-primary opacity-80 group-hover:opacity-100 transition-opacity">
                  Try now
                  <span className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300">
                    <ArrowRightSvg />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedTools;