import Link from "next/link";
import { ArrowRightSvg } from "@/components/Svg/HomeSvg";

const Hero = () => {
  return (
    <section className="relative w-full min-h-[70vh] flex flex-col items-center justify-center text-center py-20 animate-fade-in-up">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-200/50 dark:bg-zinc-800/20 blur-[120px] rounded-full -z-10 pointer-events-none" />
      
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-8">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">v1.0 Now Live</span>
      </div>

      <h1 className="max-w-4xl text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6 leading-[1.1]">
        Master your images <br className="hidden md:block" />
        <span className="text-zinc-400 dark:text-zinc-600">without limits.</span>
      </h1>

      <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400 mb-10 leading-relaxed">
        Professional-grade image converter, compressor, and resizer. 
        Free forever, no login required, privacy-first processing.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Link 
            href="/image-converter"
            className="group flex items-center justify-center gap-2 px-8 py-3.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
            Start Converting
            <div className="w-4 h-4 transition-transform group-hover:translate-x-1">
                <ArrowRightSvg />
            </div>
        </Link>
        <Link 
            href="/image-compressor"
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xl font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
            Explore Tools
        </Link>
      </div>
    </section>
  );
};

export default Hero;