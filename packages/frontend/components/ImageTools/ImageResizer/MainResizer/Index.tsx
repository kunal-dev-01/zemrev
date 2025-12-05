// imageResizer/MainResizer/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const Index = dynamic(
  () => import("./ImageResizer"),
  {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#6366f1]" />,
  }
);

export default function ToolWrapper() {
  return (
    <div className="w-full">
      <Index />
    </div>
  );
}
