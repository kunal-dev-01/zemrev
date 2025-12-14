// PDFTools/PdfToImages/Index.tsx

"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const PdfToImages = dynamic(() => import("./PdfToImages"), {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#0D9488]" />,
});

export default PdfToImages