import { memo, useCallback, FC } from "react";
import Link  from "next/link";
import { SidebarOpenSvg } from "@/components/Svg/NavSvg";
import { useCommonModal } from "@/hooks/common.hooks";

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
    <nav className="w-full md:h-14 h-10 rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between md:px-6 px-3 transition-all duration-300">
      <Logo />

      <div className="flex items-center gap-6">
        <div className="hidden md:flex gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link href="/image-converter" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Converter</Link>
            <Link href="/image-compressor" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Compressor</Link>
            <Link href="/image-resizer" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Resizer</Link>
        </div>
        <button
          aria-label="Nav Sidebar"
          onClick={openSidebar}
          className="text-zinc-700 dark:text-zinc-300 w-8 h-8 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors p-1"
        >
          <SidebarOpenSvg />
        </button>
      </div>
    </nav>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;