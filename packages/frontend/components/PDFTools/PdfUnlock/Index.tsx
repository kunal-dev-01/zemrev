// PDFTools/PdfUnlock/Index.tsx
"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfUnlock = dynamic(() => import("./PdfUnlock"), {
    ssr: false,
    loading: () => <ToolLoader />,
});

export default PdfUnlock