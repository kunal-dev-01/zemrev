// ============================================================================
// FILE: src/hooks/useFileUtils.ts
// PURPOSE: Reusable file utility helpers (size formatting, filename handling)
// ============================================================================

export const useFileUtils = () => {
  /**
   * Convert bytes into human readable format
   * Example: 1024 -> 1.00 KB
   */
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

  /**
   * Truncate long file names while keeping extension
   * Example: very-long-name.pdf -> very-long-na...pdf
   */
  const truncateFileName = (
    name: string,
    maxLength: number = 30
  ): string => {
    if (name.length <= maxLength) return name;

    const lastDotIndex = name.lastIndexOf(".");
    if (lastDotIndex === -1) {
      return `${name.substring(0, maxLength - 3)}...`;
    }

    const ext = name.substring(lastDotIndex + 1);
    const baseName = name.substring(0, lastDotIndex);

    const allowedLength = maxLength - ext.length - 4; // ... + .
    return `${baseName.substring(0, allowedLength)}...${ext}`;
  };

  /**
   * Alias for formatBytes (semantic clarity)
   */
  const formatTotalSize = formatBytes;

  return {
    formatBytes,
    formatTotalSize,
    truncateFileName,
  };
};
