// ============================================================================
// 7. useImagesToPdf.hook.ts
// ============================================================================

import { useImagesToPdfMutation } from "@/services/pdfService/pdf.api";
import { PdfProcessedFile } from "@/services/pdfService/types";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { useCallback, useEffect, useState } from "react";

// ============================================================================
export const useImagesToPdf = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [converting, setConverting] = useState(false);
  const [imagesToPdf] = useImagesToPdfMutation();

  useEffect(() => {
    const restore = async () => {
      const restored = await pdfPendingStorage.restore("images-to-pdf");
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

  const addFiles = useCallback(async (newFiles: File[]) => {
    for (const file of newFiles) {
      const id = await pdfPendingStorage.save("images-to-pdf", file);
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
    }
  }, []);

  const removeFile = useCallback(async (id: string) => {
    await pdfPendingStorage.delete("images-to-pdf", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const convertFiles = useCallback(async () => {
    if (files.length === 0) return;
    setConverting(true);
    try {
      const imageFiles = files.map((f) => f.originalFile as File);
      const blob = await imagesToPdf({ files: imageFiles }).unwrap();
      await pdfSessionStorage.saveFile(
        blob,
        `images_to_pdf_${Date.now()}.pdf`,
        "images-to-pdf"
      );
      for (const file of files)
        await pdfPendingStorage.delete("images-to-pdf", file.id);
      setFiles([]);
    } catch (error) {
      console.error("Convert failed:", extractApiErrorMessage(error));
    } finally {
      setConverting(false);
    }
  }, [files, imagesToPdf]);

  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("images-to-pdf");
    setFiles([]);
  }, []);

  return { files, converting, addFiles, removeFile, convertFiles, clearAll };
};
