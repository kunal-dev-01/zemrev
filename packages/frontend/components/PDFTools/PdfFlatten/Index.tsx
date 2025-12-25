// PDFTools/PdfFlatten/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfFlatten = dynamic(() => import("./PdfFlatten"), {
    ssr: false,
    loading: () => <ToolLoader />,
});

export default PdfFlatten