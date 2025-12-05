// imageConverter/Dynamicconverter/Index.tsx

"use client"
import dynamic from "next/dynamic";
import ToolLoader from "@/components/Layouts/ToolLoader";

const DynamicTool = dynamic(
  () => import("./DynamicConverter"),
  {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#10b981]" />,
  }
);

interface DynamicToolWrapperProps {
  inputFormat: string;
  outputFormat: string;
}

export default function DynamicToolWrapper({
  inputFormat,
  outputFormat,
}: DynamicToolWrapperProps) {
  return (
    <div className="w-full md:mt-[1vw] mt-[1vh]">
      <DynamicTool inputFormat={inputFormat} outputFormat={outputFormat} />
    </div>
  );
}