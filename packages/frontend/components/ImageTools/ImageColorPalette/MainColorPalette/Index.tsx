// ============================================================================
// FILE: ImageColorPalette/MainColorPalette/Index.tsx
// ============================================================================

"use client";

import dynamic from "next/dynamic";
import ToolLoader from "@/components/Layouts/ToolLoader";

const Index = dynamic(() => import("./ImageColorPalette"), {
  ssr: false,
  loading: () => <ToolLoader className="w-8 h-8 text-[#f97316]" />,
});

export default function ToolWrapper() {
  return (
    <div className="w-full">
      <Index />
    </div>
  );
}