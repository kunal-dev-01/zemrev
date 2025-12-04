import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative w-full min-h-[70vh] flex flex-col items-center justify-center text-center py-20">

      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
        <div className="
          w-[250px] h-[200px] md:w-[580px] md:h-[300px]
          rounded-full blur-[80px]
          bg-cyan-200/30 dark:bg-cyan-900/20
        " />
      </div>

      {/* Version Badge */}
      <div className="
        inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full
        bg-zinc-100 dark:bg-zinc-900
        border border-zinc-200 dark:border-zinc-800
      ">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
          v1.0 Now Live
        </span>
      </div>

      {/* Heading */}
      <h1 className="
        max-w-4xl mb-6 
        text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]
        text-zinc-700 dark:text-zinc-300
      ">
        Master your tasks <br className="hidden md:block" />
        <span className="text-zinc-400 dark:text-zinc-600">
          without limits.
        </span>
      </h1>

      {/* Description */}
      <p className="
        max-w-xl mb-10 
        text-lg leading-relaxed 
        text-zinc-600 dark:text-zinc-400
      ">
        Professional-grade tools for seamless content processing. Free forever,
        no login required—privacy-first processing.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Link
          href="/image/image-converter"
          className="
            group flex items-center justify-center gap-2
            px-8 py-2 rounded-xl font-medium
            bg-zinc-700 text-white
            dark:bg-zinc-300 dark:text-black
            transition-colors
          "
        >
          Start Now
        </Link>

        <Link
          href="#tools"
          className="
            flex items-center justify-center gap-2
            px-8 py-2 rounded-xl font-medium
            border border-zinc-200 dark:border-zinc-800
            bg-white dark:bg-zinc-900 
            text-zinc-900 dark:text-zinc-100
            hover:bg-zinc-100 dark:hover:bg-zinc-800
            transition-colors duration-300
          "
        >
          Explore Tools
        </Link>
      </div>
    </section>
  );
};

export default Hero;
