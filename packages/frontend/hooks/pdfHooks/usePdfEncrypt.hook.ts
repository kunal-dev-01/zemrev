// ============================================================================
// 4. usePdfEncrypt.hook.ts
// ============================================================================
import { useState, useCallback, useEffect } from "react";
import { useEncryptPdfMutation } from "@/services/pdfService/pdf.api";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import type {
  PdfFileSettings,
  PdfProcessedFile,
} from "@/services/pdfService/types";

export const usePdfEncrypt = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [encrypting, setEncrypting] = useState(false);
  const [encryptPdf] = useEncryptPdfMutation();

  useEffect(() => {
    const restore = async () => {
      const restored = await pdfPendingStorage.restore("pdf-encrypt");
      if (restored.length > 0) {
        setFiles(
          restored.map(({ id, file }) => ({
            id,
            originalFile: file,
            name: file.name,
            size: file.size,
            type: file.type,
            settings: { user_password: "" },
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
      const id = await pdfPendingStorage.save("pdf-encrypt", file);
      processed.push({
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: { user_password: "" },
        status: "pending",
      });
    }
    setFiles((prev) => [...prev, ...processed]);
  }, []);

  const removeFile = useCallback(async (id: string) => {
    await pdfPendingStorage.delete("pdf-encrypt", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateFileSettings = useCallback(
    (id: string, settings: PdfFileSettings) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, settings: { ...f.settings, ...settings } } : f
        )
      );
    },
    []
  );

  const encryptSingleFile = useCallback(
    async (file: PdfProcessedFile) => {
      try {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "processing" } : f
          )
        );

        const blob = await encryptPdf({
          file: file.originalFile as File,
          options: {
            user_password: file.settings.user_password,
            owner_password: file.settings.owner_password,
          },
        }).unwrap();

        await pdfSessionStorage.saveFile(
          blob,
          `encrypted_${file.name}`,
          "pdf-encrypt"
        );
        await pdfPendingStorage.delete("pdf-encrypt", file.id);
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
    [encryptPdf]
  );

  const encryptAllFiles = useCallback(async () => {
    setEncrypting(true);
    for (const file of files.filter((f) => f.status === "pending")) {
      await encryptSingleFile(file);
    }
    setEncrypting(false);
  }, [files, encryptSingleFile]);

  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("pdf-encrypt");
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
    encrypting,
    stats,
    addFiles,
    removeFile,
    updateFileSettings,
    encryptSingleFile,
    encryptAllFiles,
    clearAll,
  };
};
