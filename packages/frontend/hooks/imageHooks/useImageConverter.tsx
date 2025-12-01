// ============================================================================
// FILE: src/hooks/useImageConverter.ts
// PURPOSE: Main conversion logic
// ============================================================================

"use client";

import { useEffect } from "react";
import { useConverterStore } from "@/stores/imageConverter.store";
import { useConvertImageMutation } from "@/services/imageService/image.api";
import { createUploadedFile, createConvertedFile } from "@/utils/fileProcessor.utils";
import { OutputFormat } from "@/services/imageService/types";

export const useImageConverter = (targetFormat?: OutputFormat) => {
  
  const store = useConverterStore();
  const [convertImage] = useConvertImageMutation();
  
  // Load session on mount
  useEffect(() => {
    store.loadSession();
  }, []);
  
  // Handle file selection
  const handleFilesSelected = (files: File[]) => {
    const uploaded = files
      .map(f => createUploadedFile(f, "device"))
      .filter(Boolean) as any[];
    
    if (uploaded.length > 0) {
      store.addFiles(uploaded);
    }
  };
  
  // Start conversion
  const startConversion = async () => {
    const { uploadedFiles, settings } = store;
    
    if (uploadedFiles.length === 0) {
      alert("⚠️ Please upload at least one file");
      return;
    }
    
    store.setProcessing(true);
    store.clearConverted();
    
    const format = targetFormat || settings.format;
    
    // Process files sequentially
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      
      store.setIndex(i);
      store.updateStatus(file.id, "processing");
      
      try {
        // Call API
        const blob = await convertImage({
          file: file.file || undefined,
          url: file.url,
          format,
          quality: settings.quality,
        }).unwrap();
        
        // Success
        const converted = createConvertedFile(file, blob, format);
        store.addConverted(converted);
        store.updateStatus(file.id, "completed");
        
      } catch (error: any) {
        // Error
        console.error(`Conversion failed for ${file.name}:`, error);
        store.updateStatus(file.id, "error", error.message || "Conversion failed");
      }
    }
    
    store.setProcessing(false);
    store.setIndex(-1);
  };
  
  return {
    ...store,
    handleFilesSelected,
    startConversion,
  };
};