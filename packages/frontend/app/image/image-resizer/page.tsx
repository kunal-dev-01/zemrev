"use client"
import dynamic from "next/dynamic"
import Skeleton from "@/components/Layouts/Skeleton"
const Index = dynamic(() => import("@/components/ImageTools/ImageResizer/ImageResizer"), {
    ssr: false,
    loading: () => <Skeleton />,
})

const Resizer = () => {
  return (
    <div className="w-full">
        <Index />
    </div>
  )
}

export default Resizer