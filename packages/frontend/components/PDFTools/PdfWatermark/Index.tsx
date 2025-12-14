// PDFTools/PdfWatermark/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfWatermark = dynamic(() => import("./PdfWatermark"), {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#C026D3]" />,
});

export default function Index() { return (<PdfWatermark />); }