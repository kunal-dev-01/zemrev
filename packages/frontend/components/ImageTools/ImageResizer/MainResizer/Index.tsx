// imageResizer/MainResizer/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const Index = dynamic(
  () => import("./ImageResizer"),
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
