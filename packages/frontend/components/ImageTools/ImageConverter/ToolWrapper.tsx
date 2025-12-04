"use client";

import dynamic from "next/dynamic";
import Skeleton from "@/components/Layouts/Skeleton";

const Index = dynamic(
  () => import("./ImageConverter"),
  {
    ssr: false,
    loading: () => <Skeleton />,
  }
);

export default function ToolWrapper() {
  return (
    <div className="w-full md:mt-[1vw] mt-[1vh]">
      <Index />
    </div>
  );
}
