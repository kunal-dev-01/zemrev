// ============================================================================
// FILE: src/components/shared/ConvertActions.tsx
// PURPOSE: Convert action buttons
// COMMIT: feat: add convert actions component
// ============================================================================

'use client';

import type { ImageItem } from '@/services/imageService/types';

interface ConvertActionsProps {
  images: ImageItem[];
  isProcessing: boolean;
  completedCount: number;
  failedCount: number;
  onConvertAll: () => void;
  onDownloadAll: () => void;
  onClearAll: () => void;
}

export const ConvertActions = ({
  images,
  isProcessing,
  completedCount,
  failedCount,
  onConvertAll,
  onDownloadAll,
  onClearAll,
}: ConvertActionsProps) => {
  if (images.length === 0) return null;

  const hasPending = images.some((img) => img.status === 'pending');
  const hasCompleted = completedCount > 0;

  return (
    <div className="actions-panel">
      {/* Status */}
      <div className="status-summary">
        <div className="stat">
          <span>Total:</span>
          <strong>{images.length}</strong>
        </div>
        {completedCount > 0 && (
          <div className="stat success">
            <span>✅ Done:</span>
            <strong>{completedCount}</strong>
          </div>
        )}
        {failedCount > 0 && (
          <div className="stat error">
            <span>❌ Failed:</span>
            <strong>{failedCount}</strong>
          </div>
        )}
        {isProcessing && (
          <div className="stat processing">
            <span className="spinner-sm" />
            <span>Processing...</span>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="buttons">
        <button
          className="btn-primary"
          onClick={onConvertAll}
          disabled={!hasPending || isProcessing}
        >
          {isProcessing ? '⚙️ Converting...' : '🔄 Convert All'}
        </button>

        <button
          className="btn-success"
          onClick={onDownloadAll}
          disabled={!hasCompleted || isProcessing}
        >
          ⬇️ Download All (ZIP)
        </button>

        <button
          className="btn-danger"
          onClick={onClearAll}
          disabled={isProcessing}
        >
          🗑️ Clear All
        </button>
      </div>
    </div>
  );
};