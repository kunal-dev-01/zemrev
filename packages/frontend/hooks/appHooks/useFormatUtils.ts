import { useCallback } from "react";

export const useFormatUtils = () => {
  // =========================
  // FILE SIZE FORMATTER
  // =========================
  const formatSize = useCallback((bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024)
      return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  // =========================
  // TIME AGO FORMATTER
  // =========================
  const formatTimeAgo = useCallback((timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

    return `${Math.floor(seconds / 86400)}d ago`;
  }, []);

  // =========================
  // FILE NAME TRUNCATOR
  // =========================
  const truncateFileName = useCallback(
    (name: string, maxLength = 30): string => {
      if (name.length <= maxLength) return name;

      const lastDotIndex = name.lastIndexOf(".");
      if (lastDotIndex === -1)
        return `${name.substring(0, maxLength - 3)}...`;

      const ext = name.substring(lastDotIndex);
      const baseName = name.substring(0, lastDotIndex);

      return `${baseName.substring(
        0,
        maxLength - ext.length - 3
      )}...${ext}`;
    },
    []
  );

  return {
    formatSize,
    formatTimeAgo,
    truncateFileName,
  };
};
