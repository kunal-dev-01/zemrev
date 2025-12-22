import { FolderOpenSvg } from "@/components/Svg/CommonSvg";

export const MyFilesEmpty = () => (
  <div className="w-full h-[80vh] flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-900">
    <div className="text-center">
      <div className="mb-6 inline-flex">
        <FolderOpenSvg className="w-20 h-20 text-zinc-500" />
      </div>
      <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">Workspace is Empty</h2>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto text-sm">
        Process some images or PDFs to see them organized here for download.
      </p>
    </div>
  </div>
);