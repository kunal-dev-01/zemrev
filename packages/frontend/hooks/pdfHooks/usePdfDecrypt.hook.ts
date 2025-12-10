// ============================================================================
// 5. usePdfDecrypt.hook.ts

import { useDecryptPdfMutation } from "@/services/pdfService/pdf.api";
import { PdfFileSettings, PdfProcessedFile } from "@/services/pdfService/types";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { useCallback, useEffect, useState } from "react";

// ============================================================================
export const usePdfDecrypt = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [decrypting, setDecrypting] = useState(false);
  const [decryptPdf] = useDecryptPdfMutation();

  useEffect(() => {
    const restore = async () => {
      const restored = await pdfPendingStorage.restore("pdf-decrypt");
      if (restored.length > 0) {
        setFiles(
          restored.map(({ id, file }) => ({
            id,
            originalFile: file,
            name: file.name,
            size: file.size,
            type: file.type,
            settings: { password: "" },
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
      const id = await pdfPendingStorage.save("pdf-decrypt", file);
      processed.push({
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: { password: "" },
        status: "pending",
      });
    }
    setFiles((prev) => [...prev, ...processed]);
  }, []);

  const removeFile = useCallback(async (id: string) => {
    await pdfPendingStorage.delete("pdf-decrypt", id);
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

  const decryptSingleFile = useCallback(
    async (file: PdfProcessedFile) => {
      try {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "processing" } : f
          )
        );

        const blob = await decryptPdf({
          file: file.originalFile as File,
          options: { password: file.settings.password as string },
        }).unwrap();

        await pdfSessionStorage.saveFile(
          blob,
          `decrypted_${file.name}`,
          "pdf-decrypt"
        );
        await pdfPendingStorage.delete("pdf-decrypt", file.id);
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
    [decryptPdf]
  );

  const decryptAllFiles = useCallback(async () => {
    setDecrypting(true);
    for (const file of files.filter((f) => f.status === "pending")) {
      await decryptSingleFile(file);
    }
    setDecrypting(false);
  }, [files, decryptSingleFile]);

  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("pdf-decrypt");
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
    decrypting,
    stats,
    addFiles,
    removeFile,
    updateFileSettings,
    decryptSingleFile,
    decryptAllFiles,
    clearAll,
  };
};
