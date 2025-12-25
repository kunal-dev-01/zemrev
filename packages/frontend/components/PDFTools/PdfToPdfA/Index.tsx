// PDFTools/PdfToPdfA/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfToPdfA = dynamic(() => import("./PdfToPdfA"), {
    ssr: false,
    loading: () => <ToolLoader />,
});

export default PdfToPdfA