// PDFTools/PdfWatermark/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfWatermark = dynamic(() => import("./PdfWatermark"), {
    ssr: false,
    loading: () => <ToolLoader />,
});

export default function Index() { return (<PdfWatermark />); }