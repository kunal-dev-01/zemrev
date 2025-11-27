import { memo, useCallback, FC } from "react";
import Link from "next/link";
import { SidebarOpenSvg } from "../Svg/NavSvg";
import { useCommonModal } from "@/hooks/common.hooks";

/* ---------- Logo ---------- */
const Logo: FC = memo(() => (
  <Link href="/">
    <h1 className="text-zinc-700 dark:text-zinc-300 md:text-[1.3vw] text-[2.5vh] font-bold tracking-tight text-end">Zemrev.</h1>
  </Link>
));
Logo.displayName = "Logo";

/* ---------- Navbar ---------- */
const Navbar: FC = memo(() => {
  const { setOpenSidebar } = useCommonModal();

  const openSidebar = useCallback(() => setOpenSidebar(true), [setOpenSidebar]);

  return (
    <nav className="w-full md:h-[2.5vw] h-[5vh] rounded-xl bg-zinc-100/10 dark:bg-zinc-900/10 backdrop-blur-lg border-2 border-zinc-100/80 dark:border-zinc-900/50 flex items-center justify-between py-1 px-2">
      <Logo />

      <button
        aria-label="Nav Sidebar"
        onClick={openSidebar}
        className="text-zinc-700 dark:text-zinc-300 md:w-9 w-8 flex items-center justify-center"
      >
        <SidebarOpenSvg />
      </button>
    </nav>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;
