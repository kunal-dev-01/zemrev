import React from "react";
import Footer from "@/components/Footer/Footer";
import Navbar from "@/components/Navbar/Navbar";
import SideBar from "@/components/Navbar/Sidebar";

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full md:px-[10vw] px-[1.5vh] relative">
      <div className="w-full md:h-[4vw] h-[7vh] flex items-center justify-center sticky top-0 z-35">
        <Navbar />
      </div>

      {<SideBar />}

      <div className="w-full">{children}</div>

      <div className="w-full md:py-[1vw] py-[1vh]">
        <Footer />
      </div>
    </div>
  );
};

export default PageLayout;
