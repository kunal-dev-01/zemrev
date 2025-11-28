import { BoltSvg, InfinitySvg, ShieldSvg } from "@/components/Svg/HomeSvg";

const features = [
  {
    title: "Privacy First",
    desc: "Processing happens entirely in your browser. Your files never leave your device.",
    icon: <ShieldSvg />,
  },
  {
    title: "Unlimited Usage",
    desc: "No file size limits, no daily quotas. Process as many images as you need.",
    icon: <InfinitySvg />,
  },
  {
    title: "Lightning Fast",
    desc: "Optimized WebAssembly technology ensures instant results without upload wait times.",
    icon: <BoltSvg />,
  },
];

const WhyZemrev = () => {
  return (
    <section className="w-full py-32 border-y border-zinc-100 dark:border-zinc-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-start">
          
          {/* Header */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Why Zemrev?
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 font-light leading-relaxed mb-8">
              We built Zemrev to remove the friction from image editing. No accounts, no clouds, just tools that work.
            </p>
          </div>

          {/* Features Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="flex flex-col items-start animate-slide-up" 
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className="w-12 h-12 mb-6 text-primary flex items-center justify-center">
                  <div className="w-8 h-8 stroke-[1.5px]">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-zinc-900 dark:text-zinc-50">
                  {feature.title}
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default WhyZemrev;