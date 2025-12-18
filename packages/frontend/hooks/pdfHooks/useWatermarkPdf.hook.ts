// ============================================================================
// FILE: src/hooks/pdfHooks/useWatermarkPdf.hook.ts
// PURPOSE: Handle PDF watermarking using the powerful signing backend logic
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import { useSignPdfMutation } from "@/services/pdfService/pdf.api"; // Reusing sign backend
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import type {
  PdfProcessedFile,
  SignatureItem, // We treat watermarks as signature items for the backend
} from "@/services/pdfService/types";
import { useCloudPicker } from "../appHooks/usePdfCloudPicker.hook";

export const useWatermarkPdf = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [processing, setProcessing] = useState(false);

  // We use signPdf mutation because it supports multiple layers/rotation
  const [applyWatermark] = useSignPdfMutation(); 
  const { pickFromGoogleDrive, pickFromDropbox } = useCloudPicker();

  const TOOL_TYPE = "add-watermark";

  // ============================================================================
  // RESTORE PENDING FILES ON MOUNT (add-watermark category)
  // ============================================================================
  useEffect(() => {
    const restore = async () => {
      const restored = await pdfPendingStorage.restore(TOOL_TYPE);
      if (restored.length > 0) {
        setFiles(
          restored.map(({ id, file }) => ({
            id,
            originalFile: file,
            name: file.name,
            size: file.size,
            type: file.type,
            settings: { signatures: [] }, // Backend expects 'signatures' field
            status: "pending" as const,
          }))
        );
      }
    };
    restore();
  }, []);

  // ============================================================================
  // ADD FILES
  // ============================================================================
  const addFiles = useCallback(async (newFiles: File[]) => {
    const processed: PdfProcessedFile[] = [];

    for (const file of newFiles) {
      const id = await pdfPendingStorage.save(TOOL_TYPE, file);
      processed.push({
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: { signatures: [] },
        status: "pending",
      });
    }

    setFiles((prev) => [...prev, ...processed]);
  }, []);

  const addFromGoogleDrive = useCallback(async () => {
    const file = await pickFromGoogleDrive();
    const id = await pdfPendingStorage.save(TOOL_TYPE, file);
    setFiles((prev) => [
      ...prev,
      {
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: { signatures: [] },
        status: "pending",
      },
    ]);
  }, [pickFromGoogleDrive]);

  const addFromDropbox = useCallback(async () => {
    const file = await pickFromDropbox();
    const id = await pdfPendingStorage.save(TOOL_TYPE, file);
    setFiles((prev) => [
      ...prev,
      {
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: { signatures: [] },
        status: "pending",
      },
    ]);
  }, [pickFromDropbox]);

  // ============================================================================
  // SETTINGS & WATERMARK (LAYER) MANAGEMENT
  // ============================================================================
  const updateFileSettings = useCallback(
    (id: string, settings: Partial<PdfProcessedFile["settings"]>) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, settings: { ...f.settings, ...settings } } : f
        )
      );
    },
    []
  );

  const addWatermarkLayer = useCallback(
    (fileId: string, watermark: SignatureItem) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                settings: {
                  ...f.settings,
                  signatures: [...(f.settings.signatures || []), watermark],
                },
              }
            : f
        )
      );
    },
    []
  );

  const updateWatermarkLayer = useCallback(
    (fileId: string, watermarkId: string, updates: Partial<SignatureItem>) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                settings: {
                  ...f.settings,
                  signatures: (f.settings.signatures || []).map((sig) =>
                    sig.id === watermarkId ? { ...sig, ...updates } : sig
                  ),
                },
              }
            : f
        )
      );
    },
    []
  );

  const deleteWatermarkLayer = useCallback((fileId: string, watermarkId: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              settings: {
                ...f.settings,
                signatures: (f.settings.signatures || []).filter(
                  (sig) => sig.id !== watermarkId
                ),
              },
            }
          : f
      )
    );
  }, []);

  const removeFile = useCallback(async (id: string) => {
    await pdfPendingStorage.delete(TOOL_TYPE, id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // ============================================================================
  // PROCESS WATERMARK
  // ============================================================================
  const processSingleFile = useCallback(
    async (file: PdfProcessedFile) => {
      try {
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "processing" } : f))
        );

        const layers = file.settings.signatures || [];
        if (layers.length === 0) throw new Error("Please add at least one watermark.");

        const formData = new FormData();
        formData.append("file", file.originalFile as File);

        const dataForBackend = layers.map((sig) => ({
          id: sig.id,
          type: sig.type,
          text: sig.text,
          font: sig.font,
          x: Math.round(sig.x),
          y: Math.round(sig.y),
          width: Math.round(sig.width),
          height: Math.round(sig.height),
          page: sig.page,
          color: sig.color || "#000000",
          opacity: sig.opacity ?? 0.3,
          rotation: sig.rotation || 0,
        }));

        formData.append("signatures_json", JSON.stringify(dataForBackend));

        layers.forEach((sig) => {
          if (sig.type === "image" && sig.imageFile) {
            formData.append("signature_image_files", sig.imageFile);
          }
        });

        const blob = await applyWatermark(formData).unwrap();
        const outputName = `watermarked_${file.name}`;
        
        // Saving to add-watermark session storage
        await pdfSessionStorage.saveFile(blob, outputName, TOOL_TYPE);

        await pdfPendingStorage.delete(TOOL_TYPE, file.id);
        setFiles((prev) => prev.filter((f) => f.id !== file.id));

        return { success: true };
      } catch (error) {
        const errorMsg = extractApiErrorMessage(error);
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "error", error: errorMsg } : f))
        );
        return { success: false, error: errorMsg };
      }
    },
    [applyWatermark]
  );

  const processAllFiles = useCallback(async () => {
    setProcessing(true);
    for (const file of files.filter((f) => f.status === "pending")) {
      await processSingleFile(file);
    }
    setProcessing(false);
  }, [files, processSingleFile]);

  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool(TOOL_TYPE);
    setFiles([]);
  }, []);

  return {
    files,
    processing,
    addFiles,
    addFromGoogleDrive,
    addFromDropbox,
    updateFileSettings,
    addWatermarkLayer,
    updateWatermarkLayer,
    deleteWatermarkLayer,
    removeFile,
    processAllFiles,
    clearAll,
  };
};