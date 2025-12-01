// ============================================================================
// FILE: src/components/shared/ImageUploader.tsx
// PURPOSE: Reusable drag & drop uploader
// COMMIT: feat: add reusable image uploader component
// ============================================================================

'use client';

import { useCallback, useRef, useState } from 'react';

interface ImageUploaderProps {
  maxFiles: number;
  currentCount: number;
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
}

export const ImageUploader = ({
  maxFiles,
  currentCount,
  onFilesAdded,
  disabled = false,
}: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAddMore = currentCount < maxFiles;
  const isDisabled = disabled || !canAddMore;

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || isDisabled) return;
      onFilesAdded(Array.from(files));
    },
    [isDisabled, onFilesAdded]
  );

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDisabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isDisabled) handleFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    if (!isDisabled) fileInputRef.current?.click();
  };

  return (
    <div
      className={`uploader ${isDragging ? 'dragging' : ''} ${isDisabled ? 'disabled' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />

      <div className="uploader-content">
        <span className="icon">📤</span>
        <p className="text">
          {isDisabled
            ? `Maximum ${maxFiles} images`
            : 'Drag & drop or click to select'}
        </p>
        {canAddMore && (
          <button type="button" className="btn-select" onClick={(e) => e.stopPropagation()}>
            Select Images
          </button>
        )}
        <p className="count">{currentCount} / {maxFiles}</p>
      </div>
    </div>
  );
};