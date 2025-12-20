import { Spinner } from "../Layouts/Spinner";

export const MyFilesLoading = () => (
  <div className="w-full h-[80vh] flex flex-col items-center justify-center gap-4">
    <Spinner />
    <p className="text-zinc-500 animate-pulse font-medium">Scanning your files...</p>
  </div>
);