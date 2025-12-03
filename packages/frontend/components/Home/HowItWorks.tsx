import React from "react";
import {
  MousePointerClick,
  UploadCloud,
  Zap,
  Download,
} from "@/components/Svg/HomeSvg";

const steps = [
  {
    num: "01",
    title: "Select Tool",
    desc: "Browse our collection and choose the perfect tool for your needs.",
    icon: MousePointerClick,
  },
  {
    num: "02",
    title: "Upload File",
    desc: "Drag & drop your files securely into the encrypted upload zone.",
    icon: UploadCloud,
  },
  {
    num: "03",
    title: "Processing",
    desc: "Our engine optimizes your data instantly on the client-side.",
    icon: Zap,
  },
  {
    num: "04",
    title: "Download",
    desc: "Save your newly processed files immediately to your device.",
    icon: Download,
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="w-full py-24 mt-[5vw]">
      <div className="w-full mx-auto">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-4 text-xs font-semibold tracking-wide uppercase 
            bg-indigo-50 border border-indigo-100 text-indigo-600 
            dark:bg-indigo-900/40 dark:border-indigo-700 dark:text-indigo-400 
            rounded-full"
          >
            Workflow
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">
            How it works
          </h2>

          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            We've simplified the process into four easy steps. No complex setup,
            no hidden fees, just results.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {steps.map((step, idx) => {
            const Icon = step.icon;

            return (
              <div
                key={idx}
                className="
                  select-none cursor-pointer
                  group relative flex flex-col h-full p-8 rounded-2xl
                  border border-zinc-200 dark:border-zinc-800
                  transition-all duration-300 ease-out
                  hover:border-indigo-600/30 hover:shadow-xl hover:shadow-indigo-500/5
                "
              >
                {/* Step Number & Icon */}
                <div className="mb-6 flex justify-between items-start">
                  <div
                    className="
                      w-12 h-12 p-1 dark:text-zinc-300 text-zinc-700 group-hover:text-zinc-300 rounded-xl flex items-center justify-center 
                      bg-zinc-50 border border-zinc-100
                      dark:bg-zinc-800 dark:border-zinc-700 
                      transition-colors duration-300
                      group-hover:bg-indigo-600 group-hover:border-indigo-600
                    "
                  >
                    <Icon className="w-full h-full" />
                  </div>

                  <span
                    className="
                      text-4xl font-black select-none
                      text-zinc-200 dark:text-zinc-700
                      group-hover:text-indigo-200 dark:group-hover:text-indigo-300
                      transition-colors duration-300
                    "
                  >
                    {step.num}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3
                    className="
                      text-xl font-semibold mb-3 
                      text-zinc-700 dark:text-zinc-300 
                      group-hover:text-indigo-600 dark:group-hover:text-indigo-400
                      transition-colors duration-300
                    "
                  >
                    {step.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {step.desc}
                  </p>
                </div>

                {/* Bottom Decorative Line */}
                <div
                  className="
                    absolute bottom-0 left-8 right-8 h-1 rounded-t-full
                    bg-indigo-600 dark:bg-indigo-500
                    scale-x-0 opacity-0 
                    group-hover:scale-x-100 group-hover:opacity-100 
                    transition-transform duration-300 origin-left
                  "
                />
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
