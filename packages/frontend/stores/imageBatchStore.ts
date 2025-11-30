// ============================================================================
// FILE: src/stores/imageBatchStore.ts
// PURPOSE: Zustand store for batch image operations
// COMMIT: feat: add Zustand store for batch image management
// ============================================================================

import { create } from "zustand";
import type { BatchState, ImageItem, ImageStatus, ToolName } from "@/services/imageService/types";
import { IMAGE_CONSTANTS } from "@/services/imageService/constants";

interface ImageBatchStore {
  convert: BatchState;
  compress: BatchState;
  resize: BatchState;
  optimize: BatchState;
  
  // Actions
  addImages: (tool: ToolName, files: File[]) => void;
  removeImage: (tool: ToolName, id: string) => void;
  updateImageStatus: (tool: ToolName, id: string, status: ImageStatus, progress?: number) => void;
  setImageResult: (tool: ToolName, id: string, result: Blob, resultUrl: string) => void;
  setImageError: (tool: ToolName, id: string, error: string) => void;
  setProcessing: (tool: ToolName, isProcessing: boolean) => void;
  clearTool: (tool: ToolName) => void;
  clearAll: () => void;
}

const initialBatchState: BatchState = {
  images: [],
  isProcessing: false,
  completedCount: 0,
  failedCount: 0,
};

export const useImageBatchStore = create<ImageBatchStore>((set, get) => ({
  convert: { ...initialBatchState },
  compress: { ...initialBatchState },
  resize: { ...initialBatchState },
  optimize: { ...initialBatchState },

  // ==================== ADD IMAGES ====================
  addImages: (tool, files) => {
    const currentImages = get()[tool].images;
    const remainingSlots = IMAGE_CONSTANTS.MAX_BATCH_SIZE - currentImages.length;
    
    if (remainingSlots <= 0) return;

    const filesToAdd = files.slice(0, remainingSlots);
    
    const newImages: ImageItem[] = filesToAdd.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      preview: URL.createObjectURL(file),
      status: "pending" as ImageStatus,
      progress: 0,
    }));

    set((state) => ({
      [tool]: {
        ...state[tool],
        images: [...state[tool].images, ...newImages],
      },
    }));
  },

  // ==================== REMOVE IMAGE ====================
  removeImage: (tool, id) => {
    const state = get()[tool];
    const image = state.images.find((img) => img.id === id);
    
    if (image) {
      URL.revokeObjectURL(image.preview);
      if (image.resultUrl) {
        URL.revokeObjectURL(image.resultUrl);
      }
    }

    set((state) => ({
      [tool]: {
        ...state[tool],
        images: state[tool].images.filter((img) => img.id !== id),
      },
    }));
  },

  // ==================== UPDATE STATUS ====================
  updateImageStatus: (tool, id, status, progress = 0) => {
    set((state) => ({
      [tool]: {
        ...state[tool],
        images: state[tool].images.map((img) =>
          img.id === id ? { ...img, status, progress } : img
        ),
      },
    }));
  },

  // ==================== SET RESULT ====================
  setImageResult: (tool, id, result, resultUrl) => {
    set((state) => ({
      [tool]: {
        ...state[tool],
        images: state[tool].images.map((img) =>
          img.id === id
            ? { ...img, result, resultUrl, status: "completed" as ImageStatus, progress: 100 }
            : img
        ),
        completedCount: state[tool].completedCount + 1,
      },
    }));
  },

  // ==================== SET ERROR ====================
  setImageError: (tool, id, error) => {
    set((state) => ({
      [tool]: {
        ...state[tool],
        images: state[tool].images.map((img) =>
          img.id === id
            ? { ...img, error, status: "failed" as ImageStatus, progress: 0 }
            : img
        ),
        failedCount: state[tool].failedCount + 1,
      },
    }));
  },

  // ==================== SET PROCESSING ====================
  setProcessing: (tool, isProcessing) => {
    set((state) => ({
      [tool]: {
        ...state[tool],
        isProcessing,
        completedCount: isProcessing ? 0 : state[tool].completedCount,
        failedCount: isProcessing ? 0 : state[tool].failedCount,
      },
    }));
  },

  // ==================== CLEAR TOOL ====================
  clearTool: (tool) => {
    const state = get()[tool];
    
    state.images.forEach((img) => {
      URL.revokeObjectURL(img.preview);
      if (img.resultUrl) {
        URL.revokeObjectURL(img.resultUrl);
      }
    });

    set({ [tool]: { ...initialBatchState } });
  },

  // ==================== CLEAR ALL ====================
  clearAll: () => {
    const tools: ToolName[] = ["convert", "compress", "resize", "optimize"];
    
    tools.forEach((tool) => {
      const state = get()[tool];
      state.images.forEach((img) => {
        URL.revokeObjectURL(img.preview);
        if (img.resultUrl) {
          URL.revokeObjectURL(img.resultUrl);
        }
      });
    });

    set({
      convert: { ...initialBatchState },
      compress: { ...initialBatchState },
      resize: { ...initialBatchState },
      optimize: { ...initialBatchState },
    });
  },
}));