// ============================================================================
// FILE: src/lib/redux/store.ts
// PURPOSE: Redux store configuration
// COMMIT: feat: add Redux store for image service
// ============================================================================

import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/lib/baseApi/base.api";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ["payload"],
        ignoredPaths: ["api.mutations"],
      },
    }).concat(baseApi.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;