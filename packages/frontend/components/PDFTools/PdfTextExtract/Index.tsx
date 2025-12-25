// PDFTools/PdfTextExtract/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfTextExtract = dynamic(() => import("./PdfTextExtract"), {
    ssr: false,
    loading: () => <ToolLoader/>,
});

export default PdfTextExtract;