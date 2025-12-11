import { Spinner } from "./Spinner";

const ToolLoader = ({className}: {className: string}) => {
  return (
    <div
      className="w-full md:h-[15vw] h-[30vh] rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center"
    >
      <Spinner className={className} />
    </div>
  );
};

export default ToolLoader;
