// ImageOptimizer/DynamicOptimizer/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const DynamicTool = dynamic(
  () => import("./DynamicOptimizer"),
  {
    ssr: false,
    loading: () => <ToolLoader />,
  }
);

interface DynamicOptimizerWrapperProps {
  slug: string;
}

export default function DynamicOptimizerWrapper({ slug }: DynamicOptimizerWrapperProps) {
  return <DynamicTool slug={slug} />;
}