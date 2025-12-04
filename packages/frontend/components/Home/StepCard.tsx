const StepCard = ({ step }: { step: { num: string; title: string; desc: string; icon: React.FC<React.SVGProps<SVGSVGElement>> } }) => {
  const Icon = step.icon;

  return (
    <div className="
      group relative flex flex-col h-full p-8 rounded-2xl
      border border-zinc-200 dark:border-zinc-800
      transition-all duration-300 ease-out
      hover:border-indigo-600/30 hover:shadow-xl hover:shadow-indigo-500/5
      select-none cursor-pointer
    ">
      <div className="mb-6 flex justify-between items-start">
        <div className="
          w-12 h-12 p-1 flex items-center justify-center rounded-xl
          bg-zinc-50 border border-zinc-200 text-zinc-700
          dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300
          group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-zinc-100
          transition-colors duration-300
        ">
          <Icon />
        </div>

        <span className="
          text-4xl font-black text-zinc-200 dark:text-zinc-700
          group-hover:text-indigo-200 dark:group-hover:text-indigo-300
          transition-colors
        ">
          {step.num}
        </span>
      </div>

      <h3 className="
        text-xl font-semibold mb-3 
        text-zinc-700 dark:text-zinc-300 
        group-hover:text-indigo-600 dark:group-hover:text-indigo-400
        transition-colors
      ">
        {step.title}
      </h3>

      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
        {step.desc}
      </p>

      <div className="
        absolute bottom-0 left-8 right-8 h-1 rounded-t-full
        bg-indigo-600 dark:bg-indigo-500
        scale-x-0 opacity-0 
        group-hover:scale-x-100 group-hover:opacity-100
        transition-transform duration-300 origin-left
      " />
    </div>
  );
};

export default StepCard;
