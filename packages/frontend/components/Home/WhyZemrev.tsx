import React from "react";
import { Zap, Shield, HardDrive } from "@/components/Svg/HomeSvg";
import { CheckSvg } from "@/components/Svg/CommonSvg";

const cardBase =
  "border dark:border-zinc-700/50 border-zinc-200/50 p-6 rounded-xl backdrop-blur-sm";

const features = [
  {
    icon: Shield,
    title: "100% Private",
    desc: "Files never leave your device. Processing happens locally for maximum security.",
    color: "text-green-400",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "Zero upload time. Instant conversion and compression powered by your hardware.",
    color: "text-yellow-400",
    extra: "sm:translate-y-8",
  },
  {
    icon: HardDrive,
    title: "Local Storage",
    desc: "Output files are saved directly to your chosen folder. No download links to expire.",
    color: "text-blue-400",
  },
];

const WhyZemrev: React.FC = () => {
  return (
    <section className="w-full md:mt-[10vw] mt-[10vh]">
      <div className="w-full relative">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
          
          {/* Left Text Content */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-200/50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Live Processing Engine
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-700 dark:text-zinc-300">
              Built for speed, designed for privacy.
            </h2>

            <p className="text-lg leading-relaxed text-zinc-500">
              We never store your files. Each task is processed on fast, temporary servers using our optimized backend and queue system. Your files are handled only long enough to generate the result, then immediately deleted—delivered straight to your browser.
            </p>

            <ul className="space-y-3 mt-4">
              {["No server uploads", "Military-grade encryption", "Fast processing"].map(
                (item, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300"
                  >
                    <span className="w-5 h-5 text-emerald-400">
                      <CheckSvg />
                    </span>
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Right Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {features.map(({ icon: Icon, title, desc, color, extra }, i) => (
              <div
                key={i}
                className={`${cardBase} ${extra || ""}`}
              >
                <div className={`mb-4 w-10 h-10 ${color}`}>
                  <Icon />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-zinc-700 dark:text-zinc-300">
                  {title}
                </h3>
                <p className="text-sm text-zinc-500">{desc}</p>
              </div>
            ))}

            {/* Statistic Card */}
            <div
              className={`${cardBase} sm:translate-y-8 flex flex-col justify-center items-center text-center`}
            >
              <div className="text-4xl font-bold text-indigo-400 mb-1">
                10k+
              </div>
              <p className="text-sm text-zinc-500">Files Processed Daily</p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default WhyZemrev;
