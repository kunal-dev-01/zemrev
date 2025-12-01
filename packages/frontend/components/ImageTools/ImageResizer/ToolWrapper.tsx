"use client";

import dynamic from "next/dynamic";
import Skeleton from "@/components/Layouts/Skeleton";

const Index = dynamic(
  () => import("./ImageResizer"),
  {
    ssr: false,
    loading: () => <Skeleton height="" />,
  }
);

export default function ToolWrapper() {
  return (
    <div className="w-full">
      <Index />
    </div>
  );
}
