"use client"
import dynamic from "next/dynamic";
import Skeleton from "@/components/Layouts/Skeleton";

const DynamicTool = dynamic(
  () => import("./ConverterDynamicTool"),
  {
    ssr: false,
    loading: () => <Skeleton height="md:h-[15vw] h-[40vh]" />,
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