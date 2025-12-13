// ============================================================================
// FILE: src/hooks/pdfHooks/useSignPdf.hook.ts
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import { useSignPdfTextMutation, useSignPdfImageMutation } from "@/services/pdfService/pdf.api";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import type { PdfProcessedFile } from "@/services/pdfService/types";

export const useSignPdf = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [signing, setSigning] = useState(false);
  const [signPdfText] = useSignPdfTextMutation();
  const [signPdfImage] = useSignPdfImageMutation();

  useEffect(() => {
    const restore = async () => {
      const restored = await pdfPendingStorage.restore("sign-pdf");
      if (restored.length > 0) {
        setFiles(
          restored.map(({ id, file }) => ({
            id,
            originalFile: file,
            name: file.name,
            size: file.size,
            type: file.type,
            settings: {
              signature_text: "John Doe",
              x: 50,
              y: 700,
              width: 200,
              height: 80,
              page: 0,
            },
            status: "pending" as const,
          }))
        );
      }
    };
    restore();
  }, []);

  const addFiles = useCallback(async (newFiles: File[]) => {
    const processed: PdfProcessedFile[] = [];
    for (const file of newFiles) {
      const id = await pdfPendingStorage.save("sign-pdf", file);
      processed.push({
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: {
          signature_text: "John Doe",
          x: 50,
          y: 700,
          width: 200,
          height: 80,
          page: 0,
        },
        status: "pending",
      });
    }
    setFiles((prev) => [...prev, ...processed]);
  }, []);

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

  const removeFile = useCallback(async (id: string) => {
    await pdfPendingStorage.delete("sign-pdf", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const signSingleFile = useCallback(
    async (file: PdfProcessedFile) => {
      try {
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "processing" } : f))
        );

        const { signature_text, signatureFile, x, y, width, height, page } = file.settings;

        let blob: Blob;

        if (signatureFile) {
          // Image signature
          blob = await signPdfImage({
            file: file.originalFile as File,
            signature: signatureFile,
            options: {
              x: x || 50,
              y: y || 700,
              width: width || 200,
              height: height || 80,
              page: page || 0,
            },
          }).unwrap();
        } else {
          // Text signature
          blob = await signPdfText({
            file: file.originalFile as File,
            options: {
              signature_text: signature_text || "Signature",
              x: x || 50,
              y: y || 700,
              width: width || 200,
              height: height || 80,
              page: page || 0,
            },
          }).unwrap();
        }

        const outputName = `signed_${file.name}`;
        await pdfSessionStorage.saveFile(blob, outputName, "sign-pdf");

        await pdfPendingStorage.delete("sign-pdf", file.id);
        setFiles((prev) => prev.filter((f) => f.id !== file.id));

        return { success: true };
      } catch (error) {
        const errorMsg = extractApiErrorMessage(error);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "error", error: errorMsg } : f
          )
        );
        return { success: false, error: errorMsg };
      }
    },
    [signPdfText, signPdfImage]
  );

  const signAllFiles = useCallback(async () => {
    setSigning(true);
    for (const file of files.filter((f) => f.status === "pending")) {
      await signSingleFile(file);
    }
    setSigning(false);
  }, [files, signSingleFile]);

  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("sign-pdf");
    setFiles([]);
  }, []);

  const stats = {
    total: files.length,
    pending: files.filter((f) => f.status === "pending").length,
    processing: files.filter((f) => f.status === "processing").length,
    error: files.filter((f) => f.status === "error").length,
  };

  return {
    files,
    signing,
    stats,
    addFiles,
    updateFileSettings,
    removeFile,
    signSingleFile,
    signAllFiles,
    clearAll,
  };
};