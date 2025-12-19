"use client";

import ToolLoader from "@/components/Layouts/ToolLoader";
import dynamic from "next/dynamic";

const RemovePdfPages = dynamic(() => import("./RemovePdfPages"), {
    ssr: false,
    loading: () => <ToolLoader className="w-8 h-8 text-[#475569]" />,
});

export default RemovePdfPages;