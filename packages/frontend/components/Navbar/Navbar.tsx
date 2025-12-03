// Navbar/Navbar.tsx
import Link from "next/link";
import { memo, useCallback, FC } from "react";
import { SidebarOpenSvg } from "@/components/Svg/NavSvg";
import { useCommonModal } from "@/hooks/appHooks/common.hooks";

/* ================= Logo ================= */
const Logo: FC = () => (
  <Link href="/" className="group">
    <h1 className="text-zinc-800 dark:text-zinc-200 md:text-2xl text-xl font-bold tracking-tight group-hover:text-black dark:group-hover:text-white transition-colors duration-300">
      Zemrev.
    </h1>
  </Link>
);

/* ================= Navbar ================= */
const Navbar: FC = memo(() => {
  const { setOpenSidebar } = useCommonModal();

  const openSidebar = useCallback(() => {
    setOpenSidebar(true);
  }, [setOpenSidebar]);

  return (
    <nav className="w-full md:h-12 h-10 rounded-xl bg-zinc-100/40 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between pl-3 pr-1 md:pr-2 transition-all duration-300">

      <Logo />

      <div className="flex items-center gap-3">
        {/* My Files Button With Slide Hover */}
        <Link
          href="/my-files"
          className="relative group overflow-hidden h-full px-3 py-px flex items-center justify-center rounded-lg font-medium text-white border border-indigo-400 dark:border-indigo-600 bg-indigo-500 dark:bg-indigo-700 transition-all duration-300"
        >
          <span className="relative z-10">My Files</span>

          {/* Slide Hover Layer */}
          <div className="absolute inset-0 bg-indigo-600 dark:bg-indigo-800 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </Link>

        {/* Sidebar Button */}
        <button
          aria-label="Nav Sidebar"
          onClick={openSidebar}
          className="text-zinc-700 dark:text-zinc-300 w-8 h-8 flex items-center justify-center"
        >
          <SidebarOpenSvg />
        </button>
      </div>

    </nav>
  );
});

Navbar.displayName = "Navbar";
export default Navbar;
