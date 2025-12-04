import Link from "next/link";
import React from "react";

export type ToolItem = {
  title: string;
  desc: string;
  link: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color: string;
  bg: string;
};

const ToolsGrid = ({
  title,
  subtitle,
  tools,
}: {
  title: string;
  subtitle: string;
  tools: ToolItem[];
}) => {
  return (
    <div className="w-full py-10 space-y-10 md:py-30 md:space-y-30">

      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-4xl font-extrabold text-zinc-700 dark:text-zinc-300">
          {title}
        </h2>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400 md:text-lg">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map(({ title, desc, icon: Icon, link, bg, color }, i) => (
          <Link
            key={i}
            href={link}
            className="
              group relative p-5 flex flex-col gap-4 rounded-xl
              border border-zinc-100 dark:border-zinc-800
              transition-all duration-300
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
              <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                {title}
              </h3>
              <p className="
                mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400
                group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors
              ">
                {desc}
              </p>
            </div>

            <div
              className={`absolute inset-0 rounded-xl opacity-0 scale-80 -z-1 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 ${bg}`}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ToolsGrid;
