const UpcomingTools = () => {
  const upcoming = [
    "PDF Merger",
    "PDF to JPG",
    "PDF to PNG",
    "SVG Optimizer"
  ];

  return (
    <section className="w-full py-10 mt-[5vw]">
      <div className="mb-8 mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">Coming Soon</h2>
        <p className="text-zinc-500 mt-2">We are expanding our toolkit.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {upcoming.map((tool, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-transparent flex flex-col justify-center items-center text-center opacity-70 hover:opacity-100 transition-opacity cursor-default"
          >
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{tool}</span>
            <span className="mt-2 text-[10px] uppercase tracking-wider text-zinc-400 font-medium bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">In Development</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UpcomingTools;