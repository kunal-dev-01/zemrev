// ============================================================================
// 5. usePdfDecrypt.hook.ts
// ============================================================================
import { useDecryptPdfMutation } from "@/services/pdfService/pdf.api";
import { PdfFileSettings, PdfProcessedFile } from "@/services/pdfService/types";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { useCallback, useEffect, useState } from "react";
import { useCloudPicker } from "../appHooks/usePdfCloudPicker.hook";

export const usePdfDecrypt = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [decrypting, setDecrypting] = useState(false);

  const [decryptPdf] = useDecryptPdfMutation();
  const { pickFromGoogleDrive, pickFromDropbox } = useCloudPicker();

  // ============================================================================
  // RESTORE
  // ============================================================================
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

  // ============================================================================
  // ADD FILES (LOCAL)
  // ============================================================================
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

  // ============================================================================
  // ADD FROM GOOGLE DRIVE
  // ============================================================================
  const addFromGoogleDrive = useCallback(async () => {
    const file = await pickFromGoogleDrive();
    const id = await pdfPendingStorage.save("pdf-decrypt", file);

    setFiles((prev) => [
      ...prev,
      {
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: { password: "" },
        status: "pending",
      },
    ]);
  }, [pickFromGoogleDrive]);

  // ============================================================================
  // ADD FROM DROPBOX
  // ============================================================================
  const addFromDropbox = useCallback(async () => {
    const file = await pickFromDropbox();
    const id = await pdfPendingStorage.save("pdf-decrypt", file);

    setFiles((prev) => [
      ...prev,
      {
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: { password: "" },
        status: "pending",
      },
    ]);
  }, [pickFromDropbox]);

  // ============================================================================
  // REMOVE FILE
  // ============================================================================
  const removeFile = useCallback(async (id: string) => {
    await pdfPendingStorage.delete("pdf-decrypt", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // ============================================================================
  // UPDATE SETTINGS
  // ============================================================================
  const updateFileSettings = useCallback(
    (id: string, settings: PdfFileSettings) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, settings: { ...f.settings, ...settings } }
            : f
        )
      );
    },
    []
  );

  // ============================================================================
  // DECRYPT SINGLE
  // ============================================================================
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

  // ============================================================================
  // DECRYPT ALL
  // ============================================================================
  const decryptAllFiles = useCallback(async () => {
    setDecrypting(true);
    for (const file of files.filter((f) => f.status === "pending")) {
      await decryptSingleFile(file);
    }
    setDecrypting(false);
  }, [files, decryptSingleFile]);

  // ============================================================================
  // CLEAR ALL
  // ============================================================================
  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("pdf-decrypt");
    setFiles([]);
  }, []);

  // ============================================================================
  // STATS
  // ============================================================================
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
    addFromGoogleDrive,
    addFromDropbox,
    removeFile,
    updateFileSettings,
    decryptSingleFile,
    decryptAllFiles,
    clearAll,
  };
};
