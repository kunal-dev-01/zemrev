// imageWatermark/MainWatermark/Index.tsx

"use client";

import dynamic from "next/dynamic";
import ToolLoader from "@/components/Layouts/ToolLoader";

const Index = dynamic(
  () => import("./ImageWatermark"),
  {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#8b5cf6]" />,
  }
);

export default function ToolWrapper() {
  return (
    <div className="w-full">
      <Index />
    </div>
  );
}
