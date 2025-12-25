// ImageResizer/DynamicResizer/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const DynamicTool = dynamic(
  () => import("./DynamicResizer"),
  {
    ssr: false,
    loading: () => <ToolLoader />,
  }
);

interface DynamicResizerWrapperProps {
  slug: string;
}

export default function DynamicResizerWrapper({ slug }: DynamicResizerWrapperProps) {
  return <DynamicTool slug={slug} />;
}