import { Spinner } from "../Layouts/Spinner";

export const MyFilesLoading = () => (
  <div className="w-full h-96 flex flex-col items-center justify-center gap-4">
    <Spinner className="w-12 h-12 text-blue-500" />
    <p className="text-zinc-500 animate-pulse font-medium">Scanning your files...</p>
  </div>
);