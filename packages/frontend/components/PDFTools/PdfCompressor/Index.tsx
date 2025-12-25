"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const DynamicTool = dynamic(() => import("./PdfCompressor"), {
    ssr: false,
    loading: () => <ToolLoader />,
});

export default DynamicTool;