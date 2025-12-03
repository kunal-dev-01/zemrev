// ============================================================================
// FILE: src/lib/redux/store.ts
// PURPOSE: Redux store configuration
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
        // ❗ Ignore RTK Query internal mutation actions
        ignoredActions: [
          "api/executeMutation/pending",
          "api/executeMutation/fulfilled",
          "api/executeMutation/rejected",
        ],

        // ❗ Ignore the path where the File object exists
        ignoredActionPaths: ["meta.arg.originalArgs.file"],

        // ❗ (Optional) to ignore other non-serializable RTKQ metadata
        ignoredPaths: [
          "api.queries",
          "api.mutations",
        ],
      },
    }).concat(baseApi.middleware),

  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
