import { ReactNode } from "react";
import type { ToolIconBadgeProps } from "@/components/Shared/FileUI";

import { FileImage } from "../Svg/HomeSvg";
import { RotateSvg } from "../Svg/ToolsSvg";
import { DownloadSvg, ErrorSvg } from "@/components/Svg/CommonSvg";

// ======================================================
// Image Tool Icon Badge
// ======================================================

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
// Icon Action Button (Rotate / Change)
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
      <div className="w-5 h-5">
        <RotateSvg />
      </div>

      {label && (
        <span className="md:block hidden text-sm">
          {label}
        </span>
      )}
    </button>
  );
};

// ======================================================
// Confirm Modal
// ======================================================

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-300"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              isDangerous
                ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-500"
                : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-500"
            }`}
          >
            {isDangerous && <ErrorSvg className="w-10 h-10" />}
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {title}
            </h3>

            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold
              text-zinc-700 dark:text-zinc-300
              hover:bg-zinc-100 dark:hover:bg-zinc-800
              transition-all active:scale-95
              border border-zinc-200 dark:border-zinc-800"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`rounded-xl px-5 py-2 text-sm font-semibold text-white
              transition-all active:scale-95 ${
                isDangerous
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ======================================================
// File Action Button (Download / Delete)
// ======================================================

interface FileActionButtonProps {
  icon: ReactNode;
  onClick: () => void;
  title: string;
  variant?: "default" | "danger";
  disabled?: boolean;
  className?: string;
}

export const FileActionButton = ({
  icon,
  onClick,
  title,
  variant = "default",
  disabled = false,
  className = "",
}: FileActionButtonProps) => {
  const baseClass =
    "py-1.5 px-3 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClass =
    variant === "danger"
      ? "hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-600"
      : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseClass} ${variantClass} ${className}`}
    >
      <div className="w-5 h-5">{icon}</div>
    </button>
  );
};

// ======================================================
// Action Button (Download All)
// ======================================================

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  text: string;
  loadingText?: string;
  bgColor: string;
}

const ActionButton = ({
  onClick,
  disabled = false,
  loading = false,
  text,
  loadingText = "Loading...",
  bgColor,
}: ActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="px-3 py-1.5 rounded-xl font-medium text-white flex items-center gap-2
        transition-all duration-200 hover:opacity-90
        disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      style={{ backgroundColor: bgColor }}
    >
      <DownloadSvg className="w-5 h-5" />
      <span className="md:block hidden">
        {loading ? loadingText : text}
      </span>
    </button>
  );
};

export default ActionButton;
