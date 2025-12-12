// ImageOptimizer/MainOptimizer/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";


const Index = dynamic(
  () => import("./ImageOptimizer"),
  {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#f43f5e]" />,
  }
);

export default function ToolWrapper() {
  return (
    <div className="w-full">
      <Index />
    </div>
  );
}
