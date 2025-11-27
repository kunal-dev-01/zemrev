const Skeleton = ({
  width = "w-full",
  height = "",
  rounded = "rounded-2xl",
}) => {
  const defaultColor = "bg-zinc-100 dark:bg-zinc-900/30";

  return (
    <div
      className={` animate-pulse
      ${width} ${height} ${rounded} ${defaultColor}`}
    />
  );
};

export default Skeleton;