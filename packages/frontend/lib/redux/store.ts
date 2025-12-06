// ============================================================================
// FILE: src/lib/redux/store.ts
// PURPOSE: Clean & optimized Redux store with RTK Query + File Upload support
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
        /* 
         |-----------------------------------------------------------|
         |  RTK Query internal promises, metadata, abort signals     |
         |  non-serializable hote hain → warnings avoid karte hain   |
         |-----------------------------------------------------------|
        */
        ignoredActions: [
          "api/executeMutation/pending",
          "api/executeMutation/fulfilled",
          "api/executeMutation/rejected",
        ],

        /*
         |-----------------------------------------------------------|
         |  File Upload: File object non-serializable → ignore path  |
         |-----------------------------------------------------------|
        */
        ignoredActionPaths: ["meta.arg.originalArgs.file"],

        /*
         |-----------------------------------------------------------|
         |  RTK Query cache ke andar timestamps/functions hote hain  |
         |  jisse unnecessary warnings aate → ignore them            |
         |-----------------------------------------------------------|
        */
        ignoredPaths: ["api.queries", "api.mutations"],
      },
    }).concat(baseApi.middleware),

  devTools: process.env.NODE_ENV !== "production",
});

// ---------------------------------------------
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
