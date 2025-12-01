// ============================================================================
// FILE: src/stores/imageStore.ts
// PURPOSE: Zustand store for image convert
// COMMIT: feat: add Zustand store for convert state management
// ============================================================================

import { create } from "zustand";
import { ImageItem, ImageStatus, ConvertState } from "@/services/imageService/types";
import { MAX_IMAGES } from "@/services/imageService/types";

interface ImageStore extends ConvertState {
  // Actions
  addImages: (files: File[]) => void;
  removeImage: (id: string) => void;
  updateStatus: (id: string, status: ImageStatus, progress?: number) => void;
  setResult: (id: string, result: Blob, resultUrl: string) => void;
  setError: (id: string, error: string) => void;
  setProcessing: (isProcessing: boolean) => void;
  clearAll: () => void;
}

const initialState: ConvertState = {
  images: [],
  isProcessing: false,
  completedCount: 0,
  failedCount: 0,
};

export const useImageStore = create<ImageStore>((set, get) => ({
  ...initialState,

  // ==================== ADD IMAGES ====================
  addImages: (files) => {
    const currentImages = get().images;
    const remaining = MAX_IMAGES - currentImages.length;
    
    if (remaining <= 0) return;

    const filesToAdd = files.slice(0, remaining);
    
    const newImages: ImageItem[] = filesToAdd.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      preview: URL.createObjectURL(file),
      status: ImageStatus.PENDING,
      progress: 0,
    }));

    set((state) => ({
      images: [...state.images, ...newImages],
    }));
  },

  // ==================== REMOVE IMAGE ====================
  removeImage: (id) => {
    const image = get().images.find((img) => img.id === id);
    
    if (image) {
      URL.revokeObjectURL(image.preview);
      if (image.resultUrl) {
        URL.revokeObjectURL(image.resultUrl);
      }
    }

    set((state) => ({
      images: state.images.filter((img) => img.id !== id),
    }));
  },

  // ==================== UPDATE STATUS ====================
  updateStatus: (id, status, progress = 0) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, status, progress } : img
      ),
    }));
  },

  // ==================== SET RESULT ====================
  setResult: (id, result, resultUrl) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id
          ? { ...img, result, resultUrl, status: ImageStatus.COMPLETED, progress: 100 }
          : img
      ),
      completedCount: state.completedCount + 1,
    }));
  },

  // ==================== SET ERROR ====================
  setError: (id, error) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id
          ? { ...img, error, status: ImageStatus.FAILED, progress: 0 }
          : img
      ),
      failedCount: state.failedCount + 1,
    }));
  },

  // ==================== SET PROCESSING ====================
  setProcessing: (isProcessing) => {
    set({
      isProcessing,
      completedCount: isProcessing ? 0 : get().completedCount,
      failedCount: isProcessing ? 0 : get().failedCount,
    });
  },

  // ==================== CLEAR ALL ====================
  clearAll: () => {
    const images = get().images;
    
    images.forEach((img) => {
      URL.revokeObjectURL(img.preview);
      if (img.resultUrl) {
        URL.revokeObjectURL(img.resultUrl);
      }
    });

    set(initialState);
  },
}));