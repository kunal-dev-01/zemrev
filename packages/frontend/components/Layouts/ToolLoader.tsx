import { Spinner } from "./Spinner";

const ToolLoader = ({className}: {className: string}) => {
  return (
    <div
      className="w-full md:h-[15vw] h-[30vh] rounded-xl bg-white/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center"
    >
      <Spinner className={className} />
    </div>
  );
};

export default ToolLoader;
