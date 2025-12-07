// ============================================================================
// FILE: ImageMetadata/MainMetadata/Index.tsx
// ============================================================================

"use client";

import dynamic from "next/dynamic";
import ToolLoader from "@/components/Layouts/ToolLoader";

const Index = dynamic(() => import("./ImageMetadata"), {
  ssr: false,
  loading: () => <ToolLoader className="w-8 h-8 text-[#a855f7]" />,
});

export default function ToolWrapper() {
  return (
    <div className="w-full">
      <Index />
    </div>
  );
}