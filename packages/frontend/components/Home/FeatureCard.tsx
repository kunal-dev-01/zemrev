import React from "react";

const FeatureCard = ({
  icon: Icon,
  title,
  desc,
  color,
  extra,
}: {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  desc: string;
  color: string;
  extra?: string;
}) => {
  return (
    <div className={`relative border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl backdrop-blur-sm bg-white/40 dark:bg-zinc-900/30 shadow-sm hover:shadow-md transition-all duration-300 ${extra || ""}`}>

      <div className={`mb-4 w-12 h-12 ${color}`}>
        <Icon />
      </div>

      <h3 className="text-xl font-semibold mb-2 text-zinc-800 dark:text-zinc-200">
        {title}
      </h3>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {desc}
      </p>
    </div>
  );
};

export default FeatureCard;
