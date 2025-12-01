// ============================================================================
// FILE: src/components/shared/ImageList.tsx
// PURPOSE: Display list of images with status
// COMMIT: feat: add image list component
// ============================================================================

'use client';

import type { ImageItem, ImageStatus } from '@/services/imageService/types';

interface ImageListProps {
  images: ImageItem[];
  onRemove: (id: string) => void;
  onDownload: (id: string) => void;
}

const getStatusIcon = (status: ImageStatus): string | undefined => {
  switch (status) {
    case 'pending': return '⏳';
    case 'processing': return '⚙️';
    case 'completed': return '✅';
    case 'failed': return '❌';
  }
};

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

export const ImageList = ({ images, onRemove, onDownload }: ImageListProps) => {
  if (images.length === 0) {
    return <div className="empty">No images added</div>;
  }

  return (
    <div className="image-grid">
      {images.map((img) => (
        <div key={img.id} className="image-card">
          {/* Preview */}
          <div className="preview">
            <img src={img.preview} alt={img.name} />
            {img.status === 'processing' && (
              <div className="overlay">
                <div className="spinner" />
                <span>{img.progress}%</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="info">
            <p className="name" title={img.name}>{img.name}</p>
            <p className="size">{formatSize(img.size)}</p>
          </div>

          {/* Status */}
          <div className={`status status-${img.status}`}>
            <span>{getStatusIcon(img.status)}</span>
            <span>{img.status}</span>
          </div>

          {/* Error */}
          {img.error && (
            <div className="error">⚠️ {img.error}</div>
          )}

          {/* Progress Bar */}
          {img.status === 'processing' && (
            <div className="progress">
              <div className="bar" style={{ width: `${img.progress}%` }} />
            </div>
          )}

          {/* Actions */}
          <div className="actions">
            {img.status === 'completed' && (
              <button onClick={() => onDownload(img.id)}>⬇️ Download</button>
            )}
            {img.status !== 'processing' && (
              <button onClick={() => onRemove(img.id)}>🗑️ Remove</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};