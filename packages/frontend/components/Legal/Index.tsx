import { useSearchParams } from "next/navigation";
import AboutUs from "./About";
import Contact from "./Contact";
import Terms from "./Terms";
import PrivacyPolicy from "./Privacy";
import Disclaimer from "./Disclaimer";
import { JSX } from "react";

const Index = () => {
  const searchParams = useSearchParams();
  const slugParam = searchParams.get("page") ?? "";
  const pages: Record<string, JSX.Element> = {
    about: <AboutUs />,
    contact: <Contact />,
    terms: <Terms />,
    privacy: <PrivacyPolicy />,
    disclaimer: <Disclaimer />,
  };

  const CurrentPage = pages[slugParam] || <AboutUs />;

  return <div className="w-full">{CurrentPage}</div>;
};

export default Index;
