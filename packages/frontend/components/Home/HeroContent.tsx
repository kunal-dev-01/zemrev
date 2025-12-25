export default function HeroContent() {
  return (
    <div className="relative z-10 flex flex-col items-center text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <span className="w-2 h-2 rounded-full bg-green-500 motion-safe:animate-ping" />
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
          v1.0 Now Live
        </span>
      </div>

      <h1 className="max-w-4xl mb-6 text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
        Master your tasks <br />
        <span className="text-zinc-400 dark:text-zinc-600">
          without limits.
        </span>
      </h1>

      <p className="max-w-xl mb-10 text-zinc-600 dark:text-zinc-400 md:text-lg">
        Professional-grade tools. Free forever.
      </p>
    </div>
  );
}
