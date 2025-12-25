"use client";

import dynamic from "next/dynamic";

const FeaturedTools = dynamic(() => import("./FeaturedTools"), { ssr: false });
const WhyZemrev = dynamic(() => import("./WhyZemrev"), { ssr: false });
const HowItWorks = dynamic(() => import("./HowItWorks"), { ssr: false });

export default function HomeLazySections() {
  return (
    <>
      <FeaturedTools />
      <WhyZemrev />
      <HowItWorks />
    </>
  );
}
