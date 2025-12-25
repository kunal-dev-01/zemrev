// ImageOptimizer/MainOptimizer/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";


const Index = dynamic(
  () => import("./ImageOptimizer"),
  {
    ssr: false,
    loading: () => <ToolLoader />,
  }
);

export default function ToolWrapper() {
  return (
    <div className="w-full">
      <Index />
    </div>
  );
}
