import clsx from "clsx";

const steps = [
    {
        num: "01",
        title: "Select",
        desc: "Choose the tool you need from our collection."
    },
    {
        num: "02",
        title: "Upload",
        desc: "Drag & drop your files securely."
    },
    {
        num: "03",
        title: "Process",
        desc: "Instant client-side optimization."
    },
    {
        num: "04",
        title: "Download",
        desc: "Save your new files immediately."
    }
];

const HowItWorks = () => {
  return (
    <section className="w-full py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="text-center mb-24 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            How it works
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-light">
            Simple, secure, and streamlined workflow.
          </p>
        </div>

        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-zinc-100 dark:bg-zinc-800 -z-10" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
            {steps.map((step, idx) => (
              <div 
                key={idx} 
                className="flex flex-col items-center text-center group animate-slide-up"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className="w-16 h-16 rounded-full bg-white dark:bg-zinc-950 border-4 border-zinc-50 dark:border-zinc-900 shadow-sm flex items-center justify-center text-lg font-bold text-zinc-400 group-hover:text-primary group-hover:border-primary/10 transition-all duration-300 mb-6 z-10">
                  {step.num}
                </div>

                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[200px]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;