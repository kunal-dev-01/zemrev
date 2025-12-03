// ============================================================================
// FILE: src/lib/baseApi/base.api.ts
// PURPOSE: RTK Query base API configuration
// COMMIT: feat: add RTK Query base API for image operations
// ============================================================================

import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_TOOLS_API_URL || "http://localhost:8000/api/v1";

const baseQueryWithSettings = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "omit",
  prepareHeaders: (headers) => {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return headers;
  },
});

const baseQueryWithErrorHandling: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQueryWithSettings(args, api, extraOptions);

  if (result.error && process.env.NODE_ENV === "development") {
    console.log("🔴 API Error:", result.error);
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ["Image"],
  endpoints: () => ({}),
});