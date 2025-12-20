import { FolderOpenSvg } from "@/components/Svg/CommonSvg";

export const MyFilesEmpty = () => (
  <div className="w-full h-[80vh] flex items-center justify-center">
    <div className="text-center bg-white dark:bg-zinc-900/50 p-10 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800">
      <div className="mb-6 inline-flex p-5 bg-zinc-100 dark:bg-zinc-800 rounded-full">
        <FolderOpenSvg className="w-12 h-12 text-zinc-400" />
      </div>
      <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">Workspace is Empty</h2>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
        Process some images or PDFs to see them organized here for download.
      </p>
    </div>
  </div>
);