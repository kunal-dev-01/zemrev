"use client"
import dynamic from "next/dynamic"
import Skeleton from "@/components/Layouts/Skeleton"
const Index = dynamic(() => import("@/components/ImageTools/ImageCropper/ImageCropper"), {
  ssr: false,
  loading: () => <Skeleton />,
})

const ImageCropper = () => {
  return (
    <div className="w-full">
        <Index />
    </div>
  )
}

export default ImageCropper