interface MyFilesHeaderProps {
  totalFiles: number;
}

export const MyFilesHeader = ({ totalFiles }: MyFilesHeaderProps) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
    <div>
      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full uppercase tracking-wider">
        History
      </span>
      <h1 className="md:text-4xl text-2xl font-extrabold text-zinc-900 dark:text-white mt-3 tracking-tight">
        My Files
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 flex items-center gap-2 ">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        {totalFiles} processed files ready for download
      </p>
    </div>
    
    <div className="md:text-right">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">Session Security</p>
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 px-4 py-2 rounded-lg inline-block">
        <p className="text-sm text-amber-700 dark:text-amber-400 font-medium italic">
          Files auto-delete in 2 hours
        </p>
      </div>
    </div>
  </div>
);