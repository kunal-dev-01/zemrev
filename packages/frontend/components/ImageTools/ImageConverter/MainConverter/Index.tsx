// imageConverter/MainConverter/Index.tsx

"use client";

import dynamic from "next/dynamic";
import ToolLoader from "@/components/Layouts/ToolLoader";

const Index = dynamic(
  () => import("./ImageConverter"),
  {
    ssr: false,
    loading: () => <ToolLoader />,
  }
);

export default function ToolWrapper() {
  return (
    <div className="w-full md:mt-[1vw] mt-[1vh]">
      <Index />
    </div>
  );
}
