"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const Index = dynamic(
  () => import("./ImageCompressor"),
  {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#10b981]" />,
  }
);

export default function ToolWrapper() {
  return (
    <div className="w-full">
      <Index />
    </div>
  );
}
