// src/services/toolsService/tools.slice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { extractErrorMessage } from "@/utils/errorExtract.utils";
import { ToolsState, ToolType, ToolHistoryItem } from "./types";
import { imageApi } from "./image.api";

const initialState: ToolsState = {
  currentTool: null,
  isProcessing: false,
  progress: 0,
  result: null,
  error: null,
  history: [],
};

const toolsSlice = createSlice({
  name: "tools",
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
      .addMatcher(toolsApi.endpoints.convertImage.matchPending, setPendingState)
      .addMatcher(toolsApi.endpoints.convertImage.matchFulfilled, setFulfilledState)
      .addMatcher(toolsApi.endpoints.convertImage.matchRejected, (state, action) => {
        setRejectedState(state, action, ToolType.CONVERT);
      });

    // ==================== COMPRESS ====================
    builder
      .addMatcher(toolsApi.endpoints.compressImage.matchPending, setPendingState)
      .addMatcher(toolsApi.endpoints.compressImage.matchFulfilled, setFulfilledState)
      .addMatcher(toolsApi.endpoints.compressImage.matchRejected, (state, action) => {
        setRejectedState(state, action, ToolType.COMPRESS);
      });

    // ==================== RESIZE ====================
    builder
      .addMatcher(toolsApi.endpoints.resizeImage.matchPending, setPendingState)
      .addMatcher(toolsApi.endpoints.resizeImage.matchFulfilled, setFulfilledState)
      .addMatcher(toolsApi.endpoints.resizeImage.matchRejected, (state, action) => {
        setRejectedState(state, action, ToolType.RESIZE);
      });

    // ==================== OPTIMIZE ====================
    builder
      .addMatcher(toolsApi.endpoints.optimizeImage.matchPending, setPendingState)
      .addMatcher(toolsApi.endpoints.optimizeImage.matchFulfilled, setFulfilledState)
      .addMatcher(toolsApi.endpoints.optimizeImage.matchRejected, (state, action) => {
        setRejectedState(state, action, ToolType.OPTIMIZE);
      });

    // ==================== CROP ====================
    builder
      .addMatcher(toolsApi.endpoints.cropImage.matchPending, setPendingState)
      .addMatcher(toolsApi.endpoints.cropImage.matchFulfilled, setFulfilledState)
      .addMatcher(toolsApi.endpoints.cropImage.matchRejected, (state, action) => {
        setRejectedState(state, action, ToolType.CROP);
      });

    // ==================== WATERMARK TEXT ====================
    builder
      .addMatcher(toolsApi.endpoints.addTextWatermark.matchPending, setPendingState)
      .addMatcher(toolsApi.endpoints.addTextWatermark.matchFulfilled, setFulfilledState)
      .addMatcher(toolsApi.endpoints.addTextWatermark.matchRejected, (state, action) => {
        setRejectedState(state, action, ToolType.WATERMARK_TEXT);
      });

    // ==================== WATERMARK IMAGE ====================
    builder
      .addMatcher(toolsApi.endpoints.addImageWatermark.matchPending, setPendingState)
      .addMatcher(toolsApi.endpoints.addImageWatermark.matchFulfilled, setFulfilledState)
      .addMatcher(toolsApi.endpoints.addImageWatermark.matchRejected, (state, action) => {
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
} = toolsSlice.actions;

export default toolsSlice.reducer;