// ============================================================================
// FILE: src/components/Common/UrlUploadModal.tsx
// PURPOSE: Modal for URL-based image upload
// ============================================================================

"use client";

import { useState } from "react";
import { LinkSvg } from "../Svg/ToolsSvg";
import { CancelSvg, ErrorSvg } from "../Svg/CommonSvg";
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
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate URL
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
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to load image from URL");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setUrl("");
      setError("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md border border-zinc-200 dark:border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: config.dropzoneColor }}
            >
              <div style={{ color: config.primaryColor }} className="w-5 h-5">
                <LinkSvg />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
              Upload from URL
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="w-5 h-5 text-zinc-600 dark:text-zinc-400">
              <CancelSvg />
            </div>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-offset-0 transition-all disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <span className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5">
                    <ErrorSvg />
                </span>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !url}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{ backgroundColor: config.primaryColor }}
            >
              {loading ? "Loading..." : "Upload"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium border-2 transition-all disabled:opacity-50 hover:bg-zinc-50 dark:hover:bg-zinc-800"
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
