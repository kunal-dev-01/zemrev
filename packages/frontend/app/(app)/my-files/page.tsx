import Index from "@/components/MyFiles/Index"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'My Files',
  description: 'Access and manage your files',
}

const MyFiles = () => {
  return (
    <div className='w-full '>
      <Index />
    </div>
  )
}

export default MyFiles