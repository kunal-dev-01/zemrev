// ============================================================================
// FILE: src/utils/errorExtract.utils.ts
// PURPOSE: Extract error messages from API responses
// COMMIT: feat: add error extractor for FastAPI backend
// ============================================================================

import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

// ============================================================================
// BACKEND ERROR TYPES
// ============================================================================

interface FastAPIValidationError {
  msg: string;
  type: string;
}

interface FastAPIErrorResponse {
  detail?: string | FastAPIValidationError[];
  error?: string;
  message?: string;
}

// ============================================================================
// EXTRACT API ERROR MESSAGE
// ============================================================================

export const extractApiErrorMessage = (
  error: FetchBaseQueryError | SerializedError | unknown
): string => {
  if (!error) return "Something went wrong";

  // RTK Query FetchBaseQueryError
  if ("status" in (error as FetchBaseQueryError)) {
    const fetchError = error as FetchBaseQueryError;

    // Network errors
    if (fetchError.status === "FETCH_ERROR") {
      return "Network error. Check your connection.";
    }

    if (fetchError.status === "PARSING_ERROR") {
      return "Failed to parse response.";
    }

    if (fetchError.status === "TIMEOUT_ERROR") {
      return "Request timeout.";
    }

    // HTTP errors with data
    if (fetchError.data) {
      const errorData = fetchError.data as FastAPIErrorResponse;

      // FastAPI detail (string)
      if (typeof errorData.detail === "string") {
        return errorData.detail;
      }

      // FastAPI detail (validation array)
      if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
        return errorData.detail.map((err) => err.msg).join(", ");
      }

      // Generic error/message fields
      if (errorData.error) return errorData.error;
      if (errorData.message) return errorData.message;
    }

    // HTTP status codes
    if (typeof fetchError.status === "number") {
      const statusMessages: Record<number, string> = {
        400: "Bad request",
        401: "Unauthorized",
        403: "Access denied",
        404: "Not found",
        413: "File too large",
        415: "Unsupported file type",
        422: "Validation error",
        429: "Too many requests",
        500: "Server error",
        502: "Bad gateway",
        503: "Service unavailable",
        504: "Gateway timeout",
      };

      return statusMessages[fetchError.status] || `Error ${fetchError.status}`;
    }

    return "Request failed";
  }

  // SerializedError
  if ("message" in (error as SerializedError)) {
    return (error as SerializedError).message || "Something went wrong";
  }

  // String error
  if (typeof error === "string") {
    return error;
  }

  return "Unexpected error";
};

// ============================================================================
// EXTRACT GENERAL ERROR MESSAGE
// ============================================================================

export const extractErrorMessage = (error: unknown): string => {
  if (!error) return "An error occurred";

  if (typeof error === "string") return error;

  if (error instanceof Error) return error.message;

  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;

    // Check nested data
    if (err.data && typeof err.data === "object") {
      const data = err.data as Record<string, unknown>;
      if (typeof data.message === "string") return data.message;
      if (typeof data.error === "string") return data.error;
    }

    // Check direct properties
    if (typeof err.message === "string") return err.message;
    if (typeof err.error === "string") return err.error;
  }

  return "An error occurred";
};