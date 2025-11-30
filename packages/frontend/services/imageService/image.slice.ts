// src/services/image-service/image.slice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { extractErrorMessage } from "@/utils/errorExtract.utils";
import { Imagetate, ImageType, ImageHistoryItem } from "./types";
import { imageApi } from "./image.api";

const initialState: ImageState = {
  currentTool: null,
  isProcessing: false,
  progress: 0,
  result: null,
  error: null,
  history: [],
};

const imageSlice = createSlice({
  name: "image",
  initialState,
  reducers: {
    setCurrentTool: (state, action: PayloadAction<ToolType | null>) => {
      state.currentTool = action.payload;
      state.error = null;
    },

    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = Math.min(100, Math.max(0, action.payload));
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isProcessing = false;
      state.progress = 0;
    },

    clearError: (state) => {
      state.error = null;
    },

    clearResult: (state) => {
      state.result = null;
      state.progress = 0;
      state.error = null;
    },

    addToHistory: (state, action: PayloadAction<ToolHistoryItem>) => {
      state.history.unshift(action.payload);
      
      // Keep only last 50 items
      if (state.history.length > 50) {
        state.history = state.history.slice(0, 50);
      }
    },

    clearHistory: (state) => {
      state.history = [];
    },

    reset: () => initialState,
  },

  extraReducers: (builder) => {
    // Helper for pending state
    const setPendingState = (state: ToolsState) => {
      state.isProcessing = true;
      state.error = null;
      state.progress = 0;
    };

    // Helper for fulfilled state
    const setFulfilledState = (state: ToolsState) => {
      state.isProcessing = false;
      state.progress = 100;
    };

    // Helper for rejected state
    const setRejectedState = (state: ToolsState, action: any, tool: ToolType) => {
      state.isProcessing = false;
      state.progress = 0;
      state.error = extractErrorMessage(action.payload) || `${tool} failed`;
    };

    // ==================== CONVERT ====================
    builder
      .addMatcher(imageApi.endpoints.convertImage.matchPending, setPendingState)
      .addMatcher(imageApi.endpoints.convertImage.matchFulfilled, setFulfilledState)
      .addMatcher(imageApi.endpoints.convertImage.matchRejected, (state, action) => {
        setRejectedState(state, action, ToolType.CONVERT);
      });

    // ==================== COMPRESS ====================
    builder
      .addMatcher(imageApi.endpoints.compressImage.matchPending, setPendingState)
      .addMatcher(imageApi.endpoints.compressImage.matchFulfilled, setFulfilledState)
      .addMatcher(imageApi.endpoints.compressImage.matchRejected, (state, action) => {
        setRejectedState(state, action, ToolType.COMPRESS);
      });

    // ==================== RESIZE ====================
    builder
      .addMatcher(imageApi.endpoints.resizeImage.matchPending, setPendingState)
      .addMatcher(imageApi.endpoints.resizeImage.matchFulfilled, setFulfilledState)
      .addMatcher(imageApi.endpoints.resizeImage.matchRejected, (state, action) => {
        setRejectedState(state, action, ToolType.RESIZE);
      });

    // ==================== OPTIMIZE ====================
    builder
      .addMatcher(imageApi.endpoints.optimizeImage.matchPending, setPendingState)
      .addMatcher(imageApi.endpoints.optimizeImage.matchFulfilled, setFulfilledState)
      .addMatcher(imageApi.endpoints.optimizeImage.matchRejected, (state, action) => {
        setRejectedState(state, action, ToolType.OPTIMIZE);
      });

    // ==================== CROP ====================
    builder
      .addMatcher(imageApi.endpoints.cropImage.matchPending, setPendingState)
      .addMatcher(imageApi.endpoints.cropImage.matchFulfilled, setFulfilledState)
      .addMatcher(imageApi.endpoints.cropImage.matchRejected, (state, action) => {
        setRejectedState(state, action, ToolType.CROP);
      });

    // ==================== WATERMARK TEXT ====================
    builder
      .addMatcher(imageApi.endpoints.addTextWatermark.matchPending, setPendingState)
      .addMatcher(imageApi.endpoints.addTextWatermark.matchFulfilled, setFulfilledState)
      .addMatcher(imageApi.endpoints.addTextWatermark.matchRejected, (state, action) => {
        setRejectedState(state, action, ToolType.WATERMARK_TEXT);
      });

    // ==================== WATERMARK IMAGE ====================
    builder
      .addMatcher(imageApi.endpoints.addImageWatermark.matchPending, setPendingState)
      .addMatcher(imageApi.endpoints.addImageWatermark.matchFulfilled, setFulfilledState)
      .addMatcher(imageApi.endpoints.addImageWatermark.matchRejected, (state, action) => {
        setRejectedState(state, action, ToolType.WATERMARK_IMAGE);
      });
  },
});

export const {
  setCurrentTool,
  setProgress,
  setError,
  clearError,
  clearResult,
  addToHistory,
  clearHistory,
  reset,
} = imageSlice.actions;

export default imageSlice.reducer;