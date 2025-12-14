"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const DynamicTool = dynamic(() => import("./PdfCompressor"), {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#DC2626]" />,
});

export default DynamicTool;