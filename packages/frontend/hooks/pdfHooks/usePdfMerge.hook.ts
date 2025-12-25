// ============================================================================
// FILE: src/hooks/pdfHooks/usePdfMerge.hook.ts
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import { useMergePdfMutation } from "@/services/pdfService/pdf.api";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import type { PdfProcessedFile } from "@/services/pdfService/types";
import { useCloudPicker } from "../appHooks/usePdfCloudPicker.hook";

export const usePdfMerge = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [merging, setMerging] = useState(false);

  const [mergePdf] = useMergePdfMutation();
  const { pickFromGoogleDrive, pickFromDropbox } = useCloudPicker();

  // ============================================================================
  // RESTORE
  // ============================================================================
  useEffect(() => {
    const restore = async () => {
      const restored = await pdfPendingStorage.restore("pdf-merge");
      if (restored.length > 0) {
        setFiles(
          restored.map(({ id, file }) => ({
            id,
            originalFile: file,
            name: file.name,
            size: file.size,
            type: file.type,
            settings: {},
            status: "pending" as const,
          }))
        );
      }
    };
    restore();
  }, []);

  // ============================================================================
  // ADD FILES (LOCAL)
  // ============================================================================
  const addFiles = useCallback(async (newFiles: File[]) => {
    const processed: PdfProcessedFile[] = [];

    for (const file of newFiles) {
      const id = await pdfPendingStorage.save("pdf-merge", file);
      processed.push({
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: {},
        status: "pending",
      });
    }

    setFiles((prev) => [...prev, ...processed]);
  }, []);

  // ============================================================================
  // ADD FROM GOOGLE DRIVE
  // ============================================================================
  const addFromGoogleDrive = useCallback(async () => {
    const file = await pickFromGoogleDrive();
    const id = await pdfPendingStorage.save("pdf-merge", file);

    setFiles((prev) => [
      ...prev,
      {
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: {},
        status: "pending",
      },
    ]);
  }, [pickFromGoogleDrive]);

  // ============================================================================
  // ADD FROM DROPBOX
  // ============================================================================
  const addFromDropbox = useCallback(async () => {
    const file = await pickFromDropbox();
    const id = await pdfPendingStorage.save("pdf-merge", file);

    setFiles((prev) => [
      ...prev,
      {
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: {},
        status: "pending",
      },
    ]);
  }, [pickFromDropbox]);

  // ============================================================================
  // REMOVE FILE
  // ============================================================================
  const removeFile = useCallback(async (id: string) => {
    await pdfPendingStorage.delete("pdf-merge", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // ============================================================================
  // MERGE FILES
  // ============================================================================
  const mergeFiles = useCallback(async () => {
    if (files.length < 2) return;

    setMerging(true);

    try {
      const pdfFiles = files
        .filter((f) => f.originalFile)
        .map((f) => f.originalFile as File);

      const blob = await mergePdf({ files: pdfFiles }).unwrap();

      const outputName = `merged_${Date.now()}.pdf`;
      await pdfSessionStorage.saveFile(blob, outputName, "pdf-merge");

      for (const file of files) {
        await pdfPendingStorage.delete("pdf-merge", file.id);
      }

      setFiles([]);
    } catch (error) {
      const msg = extractApiErrorMessage(error);

      const finalMsg = msg.includes("allows")
        ? msg
        : "Too many requests. Please try again in a few minutes";

      console.log("Convert failed:", finalMsg);

      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: "error",
          error: finalMsg,
        }))
      );
    } finally {
      setMerging(false);
    }
  }, [files, mergePdf]);

  // ============================================================================
  // CLEAR ALL
  // ============================================================================
  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("pdf-merge");
    setFiles([]);
  }, []);

  // ============================================================================
  // STATS
  // ============================================================================
  const stats = {
    total: files.length,
    pending: files.filter((f) => f.status === "pending").length,
  };

  return {
    files,
    merging,
    stats,
    addFiles,
    addFromGoogleDrive,
    addFromDropbox,
    removeFile,
    mergeFiles,
    clearAll,
  };
};
