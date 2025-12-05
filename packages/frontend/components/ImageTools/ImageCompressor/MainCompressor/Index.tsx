// imageCompressor/MainCompressor/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const Index = dynamic(
  () => import("./ImageCompressor"),
  {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#3b82f6]" />,
  }
);

export default function ToolWrapper() {
  return (
    <div className="w-full">
      <Index />
    </div>
  );
}
