// imageCropper/MainCropper/Index.tsx

"use client";

import dynamic from "next/dynamic";
import ToolLoader from "@/components/Layouts/ToolLoader";

const Index = dynamic(
  () => import("./ImageCropper"),
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
