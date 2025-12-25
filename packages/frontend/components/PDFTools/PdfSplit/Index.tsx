// PDFTools/PdfSplit/Index.tsx
"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfSplit = dynamic(() => import("./PdfSplit"), {
    ssr: false,
    loading: () => <ToolLoader />,
});

export default PdfSplit