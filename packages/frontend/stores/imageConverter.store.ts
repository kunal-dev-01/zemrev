// ============================================================================
// FILE: src/stores/imageConverter.store.ts
// PURPOSE: State management
// ============================================================================

import { create } from "zustand";
import { UploadedFile, ConvertedFile, ConversionSettings } from "@/services/imageService/types";
import { saveSession, loadSession, clearSession } from "@/utils/sessionStorage.utils";

interface Store {
  uploadedFiles: UploadedFile[];
  convertedFiles: ConvertedFile[];
  settings: ConversionSettings;
  isProcessing: boolean;
  currentIndex: number;
  
  addFiles: (files: UploadedFile[]) => void;
  removeFile: (id: string) => void;
  updateStatus: (id: string, status: UploadedFile["status"], error?: string) => void;
  clearUploaded: () => void;
  
  addConverted: (file: ConvertedFile) => void;
  clearConverted: () => void;
  
  updateSettings: (s: Partial<ConversionSettings>) => void;
  setProcessing: (val: boolean) => void;
  setIndex: (val: number) => void;
  
  loadSession: () => void;
  clearAll: () => void;
}

export const useConverterStore = create<Store>((set, get) => ({
  uploadedFiles: [],
  convertedFiles: [],
  settings: { format: "webp", quality: 75 },
  isProcessing: false,
  currentIndex: -1,
  
  addFiles: (files) => {
    const current = get().uploadedFiles;
    if (current.length + files.length > 5) {
      alert("⚠️ Max 5 files allowed");
      return;
    }
    set({ uploadedFiles: [...current, ...files] });
  },
  
  removeFile: (id) => {
    const file = get().uploadedFiles.find(f => f.id === id);
    if (file?.preview) URL.revokeObjectURL(file.preview);
    set({ uploadedFiles: get().uploadedFiles.filter(f => f.id !== id) });
  },
  
  updateStatus: (id, status, error) => {
    set({
      uploadedFiles: get().uploadedFiles.map(f =>
        f.id === id ? { ...f, status, error } : f
      ),
    });
  },
  
  clearUploaded: () => {
    get().uploadedFiles.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    set({ uploadedFiles: [] });
  },
  
  addConverted: (file) => {
    const files = [...get().convertedFiles, file];
    set({ convertedFiles: files });
    saveSession(files, get().settings);
  },
  
  clearConverted: () => {
    get().convertedFiles.forEach(f => URL.revokeObjectURL(f.downloadUrl));
    set({ convertedFiles: [] });
    clearSession();
  },
  
  updateSettings: (s) => set({ settings: { ...get().settings, ...s } }),
  setProcessing: (val) => set({ isProcessing: val }),
  setIndex: (val) => set({ currentIndex: val }),
  
  loadSession: () => {
    const session = loadSession();
    if (session) {
      set({ convertedFiles: session.convertedFiles, settings: session.settings });
    }
  },
  
  clearAll: () => {
    get().clearUploaded();
    get().clearConverted();
    set({ isProcessing: false, currentIndex: -1 });
  },
}));