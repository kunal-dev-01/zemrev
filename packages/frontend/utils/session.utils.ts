// ============================================================================
// FILE: src/utils/session.utils.ts
// PURPOSE: SessionStorage helper utilities
// COMMIT: feat: add session storage utilities for image batch
// ============================================================================

import type { ToolName } from "@/services/imageService/types";

interface SessionData {
  imageIds: string[];
  imageNames: string[];
  timestamp: number;
}

const getSessionKey = (tool: ToolName): string => `batch-${tool}`;

export const saveToSession = (tool: ToolName, data: SessionData): void => {
  try {
    sessionStorage.setItem(getSessionKey(tool), JSON.stringify(data));
  } catch (error) {
    console.log("Failed to save to sessionStorage:", error);
  }
};

export const loadFromSession = (tool: ToolName): SessionData | null => {
  try {
    const data = sessionStorage.getItem(getSessionKey(tool));
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.log("Failed to load from sessionStorage:", error);
    return null;
  }
};

export const clearSession = (tool: ToolName): void => {
  try {
    sessionStorage.removeItem(getSessionKey(tool));
  } catch (error) {
    console.log("Failed to clear sessionStorage:", error);
  }
};

export const clearAllSessions = (): void => {
  const tools: ToolName[] = ["convert", "compress", "resize", "optimize"];
  tools.forEach((tool) => clearSession(tool));
};