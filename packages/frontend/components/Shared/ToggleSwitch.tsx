// ============================================================================
// FILE: ToggleSwitch.tsx
// PURPOSE: Reusable toggle switch component
// ============================================================================

import clsx from "clsx";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  description?: string;
  color?: string; // hex / rgb / hsl
}

export const ToggleSwitch = ({
  checked,
  onChange,
  label,
  description,
  color = "#6366F1", // indigo-500 default
}: ToggleSwitchProps) => {
  const handleToggle = () => onChange(!checked);

  return (
    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all">
      {/* Toggle */}
      <div
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle();
          }
        }}
        className={clsx(
          "relative w-11 h-6 flex items-center rounded-full transition-all duration-300 focus:outline-none",
          checked ? "bg-opacity-90" : "bg-zinc-300 dark:bg-zinc-700"
        )}
        style={checked ? { backgroundColor: color } : undefined}
      >
        <span
          className={clsx(
            "absolute left-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300",
            checked && "translate-x-5"
          )}
        />
      </div>

      {/* Label & Description */}
      <div className="flex-1 leading-tight">
        {label && (
          <span className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
