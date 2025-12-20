import { MousePointerClick, UploadCloud, Zap, Download } from "@/components/Svg/HomeSvg";
import SectionHeader from "./SectionHeader";

const steps = [
  {
    num: "01",
    title: "Select Tool",
    desc: "Browse our collection and choose the perfect tool for your needs.",
    icon: MousePointerClick,
    accent: "bg-blue-500",
    shadow: "hover:shadow-blue-500/20",
  },
  {
    num: "02",
    title: "Upload File",
    desc: "Drag & drop your files securely into the encrypted upload zone.",
    icon: UploadCloud,
    accent: "bg-purple-500",
    shadow: "hover:shadow-purple-500/20",
  },
  {
    num: "03",
    title: "Processing",
    desc: "Our powerful cloud engine processes your files securely with maximum precision.",
    icon: Zap,
    accent: "bg-amber-500",
    shadow: "hover:shadow-amber-500/20",
  },
  {
    num: "04",
    title: "Download",
    desc: "Save your newly processed files immediately to your device.",
    icon: Download,
    accent: "bg-emerald-500",
    shadow: "hover:shadow-emerald-500/20",
  },
];

const HowItWorks = () => {
  return (
    <section className="w-full py-16 md:py-24">
      <div className="container mx-auto">
        <SectionHeader
          badge="Workflow"
          title="Simple 4-Step Process"
          subtitle="Our system is built for speed and security. Just follow these simple steps to get your work done in seconds."
        />

        {/* Steps Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          
          {/* Desktop Connecting Line (Dashed) */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 border-t-2 border-dashed border-zinc-200 dark:border-zinc-800 z-0" />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="group relative z-10 select-none cursor-default">
                {/* Card Container */}
                <div className={`h-full p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-sm transition-all duration-500 ease-out hover:-translate-y-3 hover:border-transparent ${step.shadow} hover:shadow-2xl`}>
                  
                  {/* Step Number Badge */}
                  <div className="flex justify-between items-center mb-6">
                    <div className={`w-12 h-12 p-2 rounded-xl ${step.accent} text-white flex items-center justify-center shadow-lg transform group-hover:rotate-10 transition-transform duration-700`}>
                      <Icon />
                    </div>
                    <span className="text-4xl font-black text-zinc-200 dark:text-zinc-800 group-hover:text-zinc-300 dark:group-hover:text-zinc-700 transition-colors">
                      {step.num}
                    </span>
                  </div>

                  {/* Text Content */}
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                    {step.desc}
                  </p>

                  {/* Bottom Decorative Bar */}
                  <div className={`absolute bottom-0 left-0 h-1 w-0 ${step.accent} transition-all duration-500 group-hover:w-full rounded-b-2xl`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;