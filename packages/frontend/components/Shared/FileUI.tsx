// ============================================================================
// FILE: src/components/Shared/FileUI.tsx
// PURPOSE: Reusable UI parts for file-based tools
// ============================================================================

import { CancelSvg, TrashSvg } from "@/components/Svg/CommonSvg";

// -----------------------------------------------------------------------------
// Convert bytes into human readable format
// Example: 1024 -> 1.00 KB
// -------------------------------------------------------------------------
const formatBytes = (bytes: number): string => {
  if (!bytes || bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    sizes.length - 1
  );

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

// -----------------------------------------------------------------------------
// Remove Button
// -----------------------------------------------------------------------------
interface RemoveButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
}

export const RemoveButton = ({
  onClick,
  ariaLabel = "Remove file",
  className = "",
}: RemoveButtonProps) => {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`
        px-3 py-1.5 rounded-xl border
        border-zinc-200 dark:border-zinc-700
        bg-zinc-50 dark:bg-zinc-800/50
        text-zinc-700 dark:text-zinc-300
        hover:bg-zinc-100 dark:hover:bg-zinc-700
        transition-all duration-200 cursor-pointer
        ${className}
      `}
    >
      <CancelSvg className="w-5 h-5" />
    </button>
  );
};

// -----------------------------------------------------------------------------
// Clear All Button
// -----------------------------------------------------------------------------
interface ClearAllButtonProps {
  onClick: () => void;
  className?: string;
}

export const ClearAllButton = ({
  onClick,
  className = "",
}: ClearAllButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-xl font-medium
        text-red-600 bg-red-50 dark:bg-red-900/20
        flex items-center gap-2
        hover:bg-red-100 dark:hover:bg-red-900/30
        transition-all duration-200 cursor-pointer
        ${className}
      `}
    >
      <span className="w-5 h-5">
        <TrashSvg />
      </span>
      <span className="md:block hidden">Clear All</span>
    </button>
  );
};

// -----------------------------------------------------------------------------
// File Error Message
// -----------------------------------------------------------------------------
interface FileErrorProps {
  error?: string;
  className?: string;
}

export const FileError = ({ error, className = "" }: FileErrorProps) => {
  if (!error) return null;

  return (
    <div
      className={`
        mt-2 px-3 py-2 rounded-lg
        bg-red-50 dark:bg-red-900/20
        border border-red-200 dark:border-red-800
        ${className}
      `}
    >
      <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
    </div>
  );
};

// -----------------------------------------------------------------------------
// File Info (Name + Auto-formatted Size)
// -----------------------------------------------------------------------------
interface FileInfoProps {
  name: string;
  size: number;
  className?: string;
}

export const FileInfo = ({ name, size, className = "" }: FileInfoProps) => {
  return (
    <div className={className}>
      <h3
        className="text-sm leading-none font-medium text-zinc-800 dark:text-zinc-200 truncate"
        title={name}
      >
        {name}
      </h3>

      <p className="text-xs px-1 rounded-md bg-zinc-200 dark:bg-zinc-800 inline-block text-zinc-500 dark:text-zinc-400 mt-1">
        {formatBytes(size)}
      </p>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Files Summary Badge
// -----------------------------------------------------------------------------
interface FilesSummaryProps {
  count: number;
  className?: string;
}

export const FilesSummary = ({ count, className = "" }: FilesSummaryProps) => {
  return (
    <div
      className={`
        flex items-center gap-2
        dark:bg-zinc-900 bg-zinc-50
        border border-zinc-200 dark:border-zinc-800
        rounded-xl px-3 py-1.5
        ${className}
      `}
    >
      <p className="md:text-sm text-xs text-zinc-600 dark:text-zinc-400">
        {count} file{count !== 1 ? "s" : ""} ready • ZIP output
      </p>
    </div>
  );
};


// -----------------------------------------------------------------------------
// Files Status Summary (Pending / Processing / Failed)
// -----------------------------------------------------------------------------
interface FilesStatusSummaryProps {
  pending?: number;
  processing?: number;
  failed?: number;
  className?: string;
}

export const FilesStatusSummary = ({
  pending = 0,
  processing = 0,
  failed = 0,
  className = "",
}: FilesStatusSummaryProps) => {
  if (pending === 0 && processing === 0 && failed === 0) return null;

  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div className="flex items-center gap-2 dark:bg-zinc-900 bg-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5">
        <p className="md:text-sm text-xs text-zinc-600 dark:text-zinc-400">
          {pending > 0 && `${pending} pending`}
          {processing > 0 && ` • ${processing} processing`}
          {failed > 0 && ` • ${failed} failed`}
        </p>
      </div>
    </div>
  );
};


// -----------------------------------------------------------------------------
// Settings Toggle Button (Format / Options dropdown trigger)
// -----------------------------------------------------------------------------
import { SettingsSvg, ChevronDownSvg } from "@/components/Svg/CommonSvg";
import { ReactNode } from "react";

interface SettingsToggleButtonProps {
  isOpen: boolean;
  label: string;
  onClick: () => void;
  className?: string;
}

export const SettingsToggleButton = ({
  isOpen,
  label,
  onClick,
  className = "",
}: SettingsToggleButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-xl
        border border-zinc-200 dark:border-zinc-700
        bg-zinc-50 dark:bg-zinc-800/50
        text-zinc-800 dark:text-zinc-200
        flex items-center gap-1 justify-between
        transition-all cursor-pointer
        hover:bg-zinc-100 dark:hover:bg-zinc-700
        ${className}
      `}
    >
      <div className="flex items-center gap-1">
        <SettingsSvg />
        <div className="flex flex-col items-start">
          <p className="font-medium text-sm">{label}</p>
        </div>
      </div>

      <div
        className={`transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
      >
        <ChevronDownSvg />
      </div>
    </button>
  );
};


// -----------------------------------------------------------------------------
// Tool Icon Badge
// -----------------------------------------------------------------------------
interface ToolIconBadgeProps {
  icon: ReactNode;
  primaryColor: string;
  bgColor: string;
  bgColorDark: string;
  isDark: boolean;
  className?: string;
}

export const ToolIconBadge = ({
  icon,
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
        {icon}
      </div>
    </div>
  );
};


