"use client"
import dynamic from "next/dynamic"
import Skeleton from "@/components/Layouts/Skeleton"
const Index = dynamic(() => import("@/components/ImageTools/ImageOptamizer"), {
  ssr: false,
  loading: () => <Skeleton />,
})

const ImageOptamizer = () => {
  return (
    <div className="w-full">
        <Index />
    </div>
  )
}

export default ImageOptamizer