import { useCallback, FC } from "react";
import Link from "next/link";
import clsx from "clsx";
import { useCommonModal } from "@/hooks/appHooks/common.hooks";
import { SidebarCloseSvg } from "@/components/Svg/NavSvg";
import {
  ResizeSvg,
  Minimize2,
  ArrowRightLeft,
  FileImage,
  CropSvg,
  Watermark,
} from "@/components/Svg/HomeSvg";

const Tools = [
  {
    name: "Image Converter",
    href: "/image/image-converter",
    icon: ArrowRightLeft,
  },
  {
    name: "Image Compressor",
    href: "/image/image-compressor",
    icon: Minimize2,
  },
  { name: "Image Optimizer", href: "/image/image-optimizer", icon: FileImage },
  { name: "Image Resizer", href: "/image/image-resizer", icon: ResizeSvg },
  { name: "Image Cropper", href: "/image/image-cropper", icon: CropSvg },
  { name: "Watermark Tool", href: "/image/image-watermark", icon: Watermark },
];

/* ---------- Backdrop ---------- */
const Backdrop: FC<{ isOpen: boolean; onClick: () => void }> = ({
  isOpen,
  onClick,
}) => (
  <div
    onClick={onClick}
    className={clsx(
      "fixed inset-0 z-40 bg-white/50 dark:bg-black/50 backdrop-blur-sm transition-opacity duration-300",
      isOpen ? "opacity-100 visible" : "opacity-0 invisible"
    )}
  />
);

/* ---------- Header ---------- */
const Header: FC<{ onToggle: () => void }> = ({ onToggle }) => (
  <div className="flex items-center p-1 rounded-xl border-2 border-zinc-100/80 dark:border-zinc-900/50 bg-zinc-100/10 dark:bg-zinc-900/10">
    <button
      aria-label="Toggle sidebar"
      onClick={onToggle}
      className="rounded-lg text-zinc-700 dark:text-zinc-300 w-8 md:w-9"
    >
      <SidebarCloseSvg />
    </button>

    <h2 className="mx-auto text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
      Explore Tools
    </h2>
  </div>
);

/* ---------- Sidebar ---------- */
const SideBar: FC = () => {
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
          "fixed top-0 right-0 z-50 h-screen w-full md:w-[17vw] p-3 flex flex-col rounded-none md:rounded-l-xl bg-zinc-50 dark:bg-[#0a0a0a] transition-transform duration-300 ease-in-out",
          isOpenSidebar ? "translate-x-0" : "translate-x-full"
        )}
      >
        <Header onToggle={toggleSidebar} />

        {/* TOOL LIST */}
        <div className="flex-1 overflow-y-auto my-4 p-3 space-y-2 rounded-xl border-2 border-zinc-100/80 dark:border-zinc-900/50 bg-zinc-100/10 dark:bg-zinc-900/10 custom-scrollbar scrollbar-hide">
          {Tools.map((tool, i) => (
            <Link
              key={i}
              href={tool.href}
              onClick={closeSidebar}
              className="relative flex items-center gap-3 px-3 py-1 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/30 group"
            >
              <tool.icon className="w-7 h-7 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />

              <span className="text-md font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                {tool.name}
              </span>

              <div className="absolute inset-0 rounded-lg -z-2 bg-zinc-200 dark:bg-zinc-900 opacity-0 group-hover:opacity-100 scale-80 group-hover:scale-100 transition-all duration-300" />
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
};

export default SideBar;
