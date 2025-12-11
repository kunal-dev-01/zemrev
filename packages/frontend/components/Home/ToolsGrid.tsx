// ToolsGrid.tsx
import Link from "next/link";
import React from "react";

export type ToolItem = {
  title: string;
  desc: string;
  link: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color: string; // text / icon colour utilities
  bg: string; // background colour utilities
};

type Props = {
  title: string;
  subtitle: string;
  tools: ToolItem[];
};

export default function ToolsGrid({ title, subtitle, tools }: Props) {
  return (
    <section className="w-full py-10 md:py-30">
      {/* Heading */}
      <header className="text-center mb-10 md:mb-20">
        <h2 className="text-2xl md:text-4xl font-extrabold text-zinc-700 dark:text-zinc-300">
          {title}
        </h2>
        <p className="mt-2 text-sm md:text-lg text-zinc-500 dark:text-zinc-400">
          {subtitle}
        </p>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((t, i) => (
          <Link
            key={i}
            href={t.link}
            // make the card focusable so “focus” works on mobile
            tabIndex={0}
            className="
              group relative isolate
              flex flex-col gap-2 md:gap-4
              p-5 rounded-xl
              border border-zinc-200 dark:border-zinc-800
              transition duration-300
              focus:outline-none
            "
          >
            {/* 1.  Background layer (hover on desktop, focus on mobile) */}
            <span
              className={`
                absolute inset-0 -z-10 rounded-xl
                opacity-0 scale-85
                transition duration-300 ease-out
                group-hover:opacity-100 group-hover:scale-100
                group-focus:opacity-100 group-focus:scale-100
                md:group-focus:opacity-0 md:group-focus:scale-90
                ${t.bg}
              `}
            />

            {/* 2.  Icon */}
            <div
              className={`
                flex items-center justify-center
                w-12 h-12 p-2.5 rounded-lg
                transition-transform duration-300
                group-hover:scale-110 group-hover:rotate-3
                ${t.bg} ${t.color}
              `}
            >
              <t.icon />
            </div>

            {/* 3.  Text */}
            <div>
              <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                {t.title}
              </h3>
              <p
                className="
                  mt-1 md:mt-1.5 text-sm text-zinc-500 dark:text-zinc-400
                  group-hover:text-zinc-600 dark:group-hover:text-zinc-300
                  transition-colors
                "
              >
                {t.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
