// ImageCompressor/DynamicCompressor/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const DynamicTool = dynamic(
  () => import("./DynamicCompressor"),
  {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#3b82f6]" />,
  }
);

interface DynamicCompressorWrapperProps {
  format: string;
}

export default function DynamicCompressorWrapper({ format }: DynamicCompressorWrapperProps) {
  return <DynamicTool format={format} />;
}