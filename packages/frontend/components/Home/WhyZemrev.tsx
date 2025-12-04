import { Zap, Shield, HardDrive } from "@/components/Svg/HomeSvg";
import { CheckSvg } from "@/components/Svg/CommonSvg";
import FeatureCard from "./FeatureCard";

const features = [
  {
    icon: Shield,
    title: "Secure Processing",
    desc: "Files are handled on isolated temporary servers and wiped after every task — privacy by design.",
    color: "text-green-400",
  },
  {
    icon: Zap,
    title: "Insanely Fast",
    desc: "A custom processing engine, worker queues, and low-level optimizations ensure blazing-fast performance.",
    color: "text-yellow-400",
    extra: "sm:translate-y-6",
  },
  {
    icon: HardDrive,
    title: "Zero File Storage",
    desc: "We never store, inspect, or retain your uploads. Everything is processed in real-time and then destroyed.",
    color: "text-blue-400",
  },
];

const WhyZemrev = () => {
  return (
    <section className="relative w-full py-10 md:py-30">

      {/* Background */}
      <div className="absolute inset-0 -z-10 blur-[120px] opacity-70 pointer-events-none">
        <div className="absolute top-1/2 left-[20%] w-[280px] h-[280px] bg-indigo-400/20 rounded-full" />
        <div className="absolute bottom-[15%] right-[10%] w-[300px] h-[300px] bg-purple-400/20 rounded-full" />
      </div>

      <div className="relative z-10 w-full mx-auto">

        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">

          <div className="
            inline-flex items-center gap-2 px-4 py-1.5 rounded-full
            bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800
          ">
            <span className="relative flex h-2 w-2">
              <span className="absolute h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
            </span>

            <span className="text-xs font-semibold tracking-wide uppercase text-zinc-700 dark:text-zinc-400">
              Live Processing Engine
            </span>
          </div>

          <h2 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-200">
            Speed Meets Privacy
          </h2>

          <p className="mt-2 md:text-lg text-zinc-500 dark:text-zinc-400">
            Fast, secure, real-time file processing with zero data retention.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Left */}
          <div className="space-y-6 flex flex-col justify-center">
            <ul className="space-y-4">
              {[
                "Temporary isolated file execution",
                "End-to-end encrypted transfers",
                "10k+ files processed every single day",
                "Backend optimized for image, media & PDF tasks",
                "Processing happens in real-time, no queue delays",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckSvg />
                  <span className="text-lg text-zinc-700 dark:text-zinc-300">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <div className="
              rounded-xl p-6 backdrop-blur-sm shadow-md
              border border-indigo-300/40 dark:border-indigo-700/40
              bg-indigo-50/40 dark:bg-indigo-900/20
            ">
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Designed with enterprise-grade privacy and lightning-fast compute, Zemrev 
                processes your files instantly and destroys them immediately after use. 
                No user accounts, no databases, no retention — a system built entirely 
                around speed, safety, and trust.
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}

            <div className="
              relative border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl backdrop-blur-sm 
              bg-white/40 dark:bg-zinc-900/30 shadow-sm hover:shadow-md transition-all duration-300
              sm:translate-y-6 flex flex-col items-center text-center justify-center
            ">
              <div className="text-5xl font-bold text-indigo-500 mb-1">10k+</div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Files processed daily
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyZemrev;
