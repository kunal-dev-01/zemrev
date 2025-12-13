// ===========================================================================
// FILE: src/components/Shared/UrlUploadModal.tsx
// PURPOSE: Modal for uploading images via URL
// ===========================================================================

"use client";

import { useState } from "react";

import { LinkSvg } from "../Svg/ToolsSvg";
import { ErrorSvg } from "../Svg/CommonSvg";

import { useDarkMode } from "@/hooks/appHooks/useDarkMode";

import type { ToolConfig } from "@/services/imageService/types";

interface UrlUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => Promise<void>;
  config: ToolConfig;
}

export const UrlUploadModal = ({
  isOpen,
  onClose,
  onSubmit,
  config,
}: UrlUploadModalProps) => {
  // ============================================================================
  // STATE
  // ============================================================================
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);

  const isDark = useDarkMode();

  // ============================================================================
  // EARLY RETURN
  // ============================================================================
  if (!isOpen) return null;

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const handleClose = () => {
    if (loading) return;

    setClosing(true);

    setTimeout(() => {
      setUrl("");
      setError("");
      setClosing(false);
      onClose();
    }, 280); // keep fade-out timing exactly same
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // URL validation
    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setLoading(true);

    try {
      await onSubmit(url);
      setUrl("");
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black/50 backdrop-blur-sm
        ${closing ? "fade-out" : "fade-in"}
      `}
    >
      <div
        className="
          w-full max-w-md rounded-xl shadow-2xl
          bg-white dark:bg-zinc-900
          border border-zinc-200 dark:border-zinc-800
        "
      >
        {/* ================= Header ================= */}
        <div className="flex flex-col items-center pt-4 pb-2 gap-2">
          <div
            className="w-12 h-12 flex items-center justify-center rounded-xl shadow-sm"
            style={{
              backgroundColor: isDark
                ? config.dropzoneColorDark
                : config.dropzoneColor,
              color: config.primaryColor,
            }}
          >
            <LinkSvg />
          </div>

          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
            Upload Image using URL
          </h2>

          <div className="w-[80%] h-0.5 md:h-1 rounded-full bg-zinc-200 dark:bg-zinc-700 mt-1" />
        </div>

        {/* ================= Body ================= */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* URL Input */}
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            disabled={loading}
            className="
              w-full px-4 py-2 rounded-lg border
              border-zinc-300 dark:border-zinc-700
              bg-white dark:bg-zinc-800
              text-zinc-800 dark:text-zinc-200
              outline-none disabled:opacity-50
            "
          />

          {/* Error Message */}
          {error && (
            <div
              className="
                flex items-start gap-2 p-3 rounded-lg
                bg-red-50 dark:bg-red-900/20
                border border-red-200 dark:border-red-800
              "
            >
              <ErrorSvg className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !url}
              className="
                flex-1 px-4 py-2 rounded-lg font-medium text-white
                transition-all hover:opacity-90
                disabled:opacity-80 disabled:cursor-not-allowed
              "
              style={{ backgroundColor: config.primaryColor }}
            >
              {loading ? "Loading..." : "Upload"}
            </button>

            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="
                flex-1 px-4 py-1.5 rounded-lg font-medium border-2
                transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              style={{
                borderColor: config.primaryColor,
                color: config.primaryColor,
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
