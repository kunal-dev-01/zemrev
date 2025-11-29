"use client"
import Skeleton from "@/components/Layouts/Skeleton"
import dynamic from "next/dynamic"

const Index = dynamic(() => import("@/components/Home/Index"), {
  ssr: false,
  loading: () => (
    <Skeleton/>
  )
})

const page = () => {
  return (
    <div className='w-full sidebar-hide'>
        <Index />
    </div>
  )
}

export default page