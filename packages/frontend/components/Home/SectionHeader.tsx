const SectionHeader = ({
  badge,
  title,
  subtitle,
}: {
  badge?: string;
  title: string;
  subtitle: string;
}) => {
  return (
    <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
      {badge && (
        <div className="
          inline-flex items-center justify-center px-4 py-1.5 mb-4 text-xs font-semibold uppercase tracking-wide
          bg-indigo-50 border border-indigo-100 text-indigo-600
          dark:bg-indigo-900/40 dark:border-indigo-700 dark:text-indigo-400
          rounded-full
        ">
          {badge}
        </div>
      )}

      <h2 className="text-2xl md:text-4xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">
        {title}
      </h2>

      <p className="text-zinc-500 dark:text-zinc-400 mt-2 md:text-lg">
        {subtitle}
      </p>
    </div>
  );
};

export default SectionHeader;
