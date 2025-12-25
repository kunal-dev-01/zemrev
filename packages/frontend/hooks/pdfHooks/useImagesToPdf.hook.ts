// ============================================================================
// 7. useImagesToPdf.hook.ts
// ============================================================================
import { useImagesToPdfMutation } from "@/services/pdfService/pdf.api";
import { PdfProcessedFile } from "@/services/pdfService/types";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { useCallback, useEffect, useState } from "react";
import { useCloudPicker } from "../appHooks/usePdfCloudPicker.hook";

// ============================================================================
export const useImagesToPdf = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [converting, setConverting] = useState(false);

  const [imagesToPdf] = useImagesToPdfMutation();
  const { pickFromGoogleDrive, pickFromDropbox } = useCloudPicker();

  // ============================================================================
  // RESTORE
  // ============================================================================
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

  // ============================================================================
  // ADD FILES (LOCAL)
  // ============================================================================
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

  // ============================================================================
  // ADD FROM GOOGLE DRIVE
  // ============================================================================
  const addFromGoogleDrive = useCallback(async () => {
    const file = await pickFromGoogleDrive();
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
  }, [pickFromGoogleDrive]);

  // ============================================================================
  // ADD FROM DROPBOX
  // ============================================================================
  const addFromDropbox = useCallback(async () => {
    const file = await pickFromDropbox();
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
  }, [pickFromDropbox]);

  // ============================================================================
  // REMOVE FILE
  // ============================================================================
  const removeFile = useCallback(async (id: string) => {
    await pdfPendingStorage.delete("images-to-pdf", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // ============================================================================
  // CONVERT
  // ============================================================================
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

      for (const file of files) {
        await pdfPendingStorage.delete("images-to-pdf", file.id);
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
      setConverting(false);
    }
  }, [files, imagesToPdf]);

  // ============================================================================
  // CLEAR ALL
  // ============================================================================
  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("images-to-pdf");
    setFiles([]);
  }, []);

  return {
    files,
    converting,
    addFiles,
    addFromGoogleDrive,
    addFromDropbox,
    removeFile,
    convertFiles,
    clearAll,
  };
};
