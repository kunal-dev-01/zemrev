import { MousePointerClick, UploadCloud, Zap, Download } from "@/components/Svg/HomeSvg";
import SectionHeader from "./SectionHeader";
import StepCard from "./StepCard";

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

const HowItWorks = () => {
  return (
    <section className="w-full py-10 md:py-30">
      <SectionHeader
        badge="Workflow"
        title="How it works"
        subtitle="We've simplified the process into four easy steps. No complex setup, no hidden fees, just results."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step) => (
          <StepCard key={step.num} step={step} />
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
