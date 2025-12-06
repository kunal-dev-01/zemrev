// ImageResizer/DynamicResizer/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const DynamicTool = dynamic(
  () => import("./DynamicResizer"),
  {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#6366f1]" />,
  }
);

interface DynamicResizerWrapperProps {
  slug: string;
}

export default function DynamicResizerWrapper({ slug }: DynamicResizerWrapperProps) {
  return <DynamicTool slug={slug} />;
}