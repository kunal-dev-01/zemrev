import { memo, useCallback, FC } from "react";
import Link from "next/link";
import { SidebarOpenSvg } from "@/components/Svg/NavSvg";
import { useCommonModal } from "@/hooks/appHooks/common.hooks";

const Logo: FC = memo(() => (
  <Link href="/" className="group">
    <h1 className="text-zinc-800 dark:text-zinc-200 md:text-2xl text-xl font-bold tracking-tight text-end group-hover:text-black dark:group-hover:text-white transition-colors duration-300">
      Zemrev.
    </h1>
  </Link>
));
Logo.displayName = "Logo";

const Navbar: FC = memo(() => {
  const { setOpenSidebar } = useCommonModal();

  const openSidebar = useCallback(() => setOpenSidebar(true), [setOpenSidebar]);

  return (
    <nav className="w-full md:h-12 h-10 rounded-xl bg-zinc-100/40 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between  pl-3 pr-1 md:pr-2 transition-all duration-300">
      <Logo />

      <div className="flex items-center gap-6">
        <button
          aria-label="Nav Sidebar"
          onClick={openSidebar}
          className="text-zinc-700 dark:text-zinc-300 w-8 h-8 flex items-center justify-center cursor-pointer"
        >
          <SidebarOpenSvg />
        </button>
      </div>
    </nav>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;
