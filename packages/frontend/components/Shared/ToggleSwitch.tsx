"use client";

import React from "react";
import clsx from "clsx";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string; // optional label
  description?: string; // optional description
  color?: string; // primary color (#hex or rgb)
}

export const ToggleSwitch = ({
  checked,
  onChange,
  label,
  description,
  color = "#6366F1", // default indigo-500
}: ToggleSwitchProps) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all">
      {/* Toggle */}
      <div
        onClick={() => onChange(!checked)}
        className={clsx(
          "relative w-11 h-6 flex items-center rounded-full transition-all duration-300",
          checked ? "bg-opacity-90" : "bg-zinc-300 dark:bg-zinc-700"
        )}
        style={checked ? { backgroundColor: color } : {}}
      >
        <span
          className={clsx(
            "absolute left-1 w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300",
            checked && "translate-x-5"
          )}
        />
      </div>

      {/* Text */}
      <div className="flex-1 leading-none">
        {label && (
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block">
            {label}
          </span>
        )}
        {description && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {description}
          </span>
        )}
      </div>
    </label>
  );
};
