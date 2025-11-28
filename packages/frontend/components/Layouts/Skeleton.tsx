const Skeleton = ({
  width = "w-full",
  height = "md:h-[45vw] h-[80vh]",
  rounded = "rounded-xl",
}) => {
  const defaultColor = "bg-zinc-100 dark:bg-zinc-900/50";

  return (
    <div
      className={` animate-pulse
      ${width} ${height} ${rounded} ${defaultColor}`}
    />
  );
};

export default Skeleton;