// PDFTools/PdfOptimize/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfOptimize = dynamic(() => import("./PdfOptimize"), {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#84cc16]" />,
});

export default function Index() { return (<PdfOptimize />); }