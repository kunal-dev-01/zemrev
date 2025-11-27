"use client";

import { memo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import type { FC } from "react";

import {
  SidebarOpenSvg,
  SidebarCloseSvg,
  ImageSvg,
} from "@/components/Svg/NavSvg";

import { useCommonModal } from "@/hooks/common.hooks";

/* ========================= CONSTANTS ========================= */
const Tools = [
  { name: "Image ToolKit", href: "/image-tools", icon: <ImageSvg /> },
];

/* ========================= BACKDROP ========================= */
const Backdrop: FC<{ isOpen: boolean; onClick: () => void }> = ({
  isOpen,
  onClick,
}) => (
  <div
    onClick={onClick}
    className={clsx(
      "fixed inset-0 bg-white/50 dark:bg-black/50 z-40 transition-opacity duration-300 backdrop-blur-sm",
      isOpen ? "opacity-100 visible" : "opacity-0 invisible"
    )}
  />
);

/* ========================= SIDEBAR HEADER ========================= */
const SidebarHeader: FC<{ onToggle: () => void }> = ({ onToggle }) => (
  <div className="flex items-center p-1 rounded-xl border-2 border-zinc-100/80 dark:border-zinc-900/50 bg-zinc-100/10 dark:bg-zinc-900/10">
    <button
      onClick={onToggle}
      className="rounded-lg cursor-pointer text-zinc-700 dark:text-zinc-300"
      aria-label="Toggle sidebar"
    >
      <SidebarCloseSvg />
    </button>

    <h2 className="mx-auto text-zinc-700 dark:text-zinc-300 text-2xl font-semibold">
      Explore Tools
    </h2>
  </div>
);

/* ========================= SIDEBAR ========================= */
export const Sidebar: FC = memo(() => {
  const { isOpenSidebar, setOpenSidebar } = useCommonModal();

  const toggleSidebar = useCallback(
    () => setOpenSidebar(!isOpenSidebar),
    [isOpenSidebar, setOpenSidebar]
  );

  const closeSidebar = useCallback(
    () => setOpenSidebar(false),
    [setOpenSidebar]
  );

  return (
    <>
      <Backdrop isOpen={isOpenSidebar} onClick={closeSidebar} />

      <aside
        className={clsx(
          "fixed top-0 right-0 z-50 h-screen w-full md:w-[17vw] p-3 bg-zinc-50 dark:bg-[#0a0a0a] transition-transform duration-300 ease-in-out md:rounded-l-xl flex flex-col",
          isOpenSidebar ? "translate-x-0" : "translate-x-full"
        )}
      >
        <SidebarHeader onToggle={toggleSidebar} />

        <div className="flex-1 overflow-y-auto scrollbar-hide my-4 p-3 space-y-2 custom-scrollbar w-full border-2 border-zinc-100/80 dark:border-zinc-900/50 rounded-xl bg-zinc-100/10 dark:bg-zinc-900/10">
          {Tools.map((tool, i) => (
            <Link
              href={tool.href}
              key={i}
              onClick={closeSidebar}
              className="flex items-center gap-3 px-3 py-1 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/30 group relative"
            >
              <div className="text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors w-7 h-7">
                {tool.icon}
              </div>

              <span className="md:text-md text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                {tool.name}
              </span>

              <div className="opacity-0 group-hover:opacity-100 scale-80 group-hover:scale-100 transition-all duration-300 ease-in-out absolute top-0 left-0 w-full h-full -z-2 dark:bg-zinc-900 bg-zinc-200 rounded-lg" />
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
});

Sidebar.displayName = "Sidebar";

/* ========================= LOGO ========================= */
const Logo: FC = memo(() => (
  <Link href="/">
    <Image
      src="/favicon.svg"
      alt="nav-logo"
      width={50}
      height={50}
      className="w-full h-full object-contain"
    />
  </Link>
));

Logo.displayName = "Logo";

/* ========================= NAVBAR ========================= */
const Navbar: FC = () => {
  const { setOpenSidebar } = useCommonModal();

  const openSidebar = useCallback(
    () => setOpenSidebar(true),
    [setOpenSidebar]
  );

  return (
    <>
      <nav className="w-full md:h-[2.5vw] h-[5.5vh] rounded-2xl bg-zinc-100/10 dark:bg-zinc-900/10 backdrop-blur-lg border-2 border-zinc-100/80 dark:border-zinc-900/50 flex items-center justify-between relative">
        <Logo />

        <div className="p-1 h-full relative">
          <button
            aria-label="Nav Sidebar"
            onClick={openSidebar}
            className="transition-transform duration-300 ease-in-out cursor-pointer text-zinc-700 dark:text-zinc-300 w-7 h-7"
          >
            <SidebarOpenSvg />
          </button>
        </div>
      </nav>
    </>
  );
};

export default memo(Navbar);
