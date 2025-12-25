// PDFTools/PdfSign/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfSign = dynamic(() => import("./PdfSign"), {
    ssr: false,
    loading: () => <ToolLoader />
});

export default PdfSign