import {ToolIconBadgeProps} from "@/components/Shared/FileUI";
import { FileImage } from "../Svg/HomeSvg";
import { RotateSvg } from "../Svg/ToolsSvg";

export const ImageToolIconBadge = ({
  primaryColor,
  bgColor,
  bgColorDark,
  isDark,
  className = "",
}: ToolIconBadgeProps) => {
  return (
    <div
      className={`p-2.5 sm:p-3 rounded-lg shrink-0 ${className}`}
      style={{
        backgroundColor: isDark ? bgColorDark : bgColor,
      }}
    >
      <div
        className="w-5 h-5 sm:w-6 sm:h-6"
        style={{ color: primaryColor }}
      >
        <FileImage />
      </div>
    </div>
  );
};


// ======================================================
// Icon Action Button
// ======================================================

interface IconActionButtonProps {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const IconActionButton = ({
  label,
  onClick,
  disabled = false,
}: IconActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="
        ml-3 px-3 py-1.5 rounded-xl
        border border-zinc-200 dark:border-zinc-700
        bg-zinc-50 dark:bg-zinc-800/50
        text-zinc-700 dark:text-zinc-300
        hover:bg-zinc-100 dark:hover:bg-zinc-700
        transition-all duration-200
        flex items-center gap-2
        cursor-pointer disabled:opacity-50
      "
    >
      <div className="w-5 h-5"><RotateSvg /></div>

      {label && (
        <span
          className={`md:block hidden text-sm`}
        >
          {label}
        </span>
      )}
    </button>
  );
};