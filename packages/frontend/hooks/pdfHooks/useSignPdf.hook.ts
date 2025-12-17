// ============================================================================
// FILE: src/hooks/pdfHooks/useSignPdf.hook.ts (UPDATED)
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import { useSignPdfMutation } from "@/services/pdfService/pdf.api";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import type {
  PdfProcessedFile,
  SignatureItem,
} from "@/services/pdfService/types";
import { useCloudPicker } from "../appHooks/usePdfCloudPicker.hook";

export const useSignPdf = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [signing, setSigning] = useState(false);

  const [signPdf] = useSignPdfMutation();
  const { pickFromGoogleDrive, pickFromDropbox } = useCloudPicker();

  // ============================================================================
  // RESTORE
  // ============================================================================
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
              signatures: [], // Empty array initially
            },
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
      const id = await pdfPendingStorage.save("sign-pdf", file);
      processed.push({
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: {
          signatures: [],
        },
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
    const id = await pdfPendingStorage.save("sign-pdf", file);

    setFiles((prev) => [
      ...prev,
      {
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: {
          signatures: [],
        },
        status: "pending",
      },
    ]);
  }, [pickFromGoogleDrive]);

  // ============================================================================
  // ADD FROM DROPBOX
  // ============================================================================
  const addFromDropbox = useCallback(async () => {
    const file = await pickFromDropbox();
    const id = await pdfPendingStorage.save("sign-pdf", file);

    setFiles((prev) => [
      ...prev,
      {
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: {
          signatures: [],
        },
        status: "pending",
      },
    ]);
  }, [pickFromDropbox]);

  // ============================================================================
  // UPDATE SETTINGS (Signatures Array)
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

  // ============================================================================
  // ADD SIGNATURE
  // ============================================================================
  const addSignature = useCallback(
    (fileId: string, signature: SignatureItem) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                settings: {
                  ...f.settings,
                  signatures: [...(f.settings.signatures || []), signature],
                },
              }
            : f
        )
      );
    },
    []
  );

  // ============================================================================
  // UPDATE SIGNATURE
  // ============================================================================
  const updateSignature = useCallback(
    (fileId: string, signatureId: string, updates: Partial<SignatureItem>) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                settings: {
                  ...f.settings,
                  signatures: (f.settings.signatures || []).map((sig) =>
                    sig.id === signatureId ? { ...sig, ...updates } : sig
                  ),
                },
              }
            : f
        )
      );
    },
    []
  );

  // ============================================================================
  // DELETE SIGNATURE
  // ============================================================================
  const deleteSignature = useCallback((fileId: string, signatureId: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              settings: {
                ...f.settings,
                signatures: (f.settings.signatures || []).filter(
                  (sig) => sig.id !== signatureId
                ),
              },
            }
          : f
      )
    );
  }, []);

  // ============================================================================
  // REMOVE FILE
  // ============================================================================
  const removeFile = useCallback(async (id: string) => {
    await pdfPendingStorage.delete("sign-pdf", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // ============================================================================
  // SIGN SINGLE
  // ============================================================================
  const signSingleFile = useCallback(
    async (file: PdfProcessedFile) => {
      try {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "processing" } : f
          )
        );

        const signatures = file.settings.signatures || [];

        if (signatures.length === 0) {
          throw new Error(
            "No signatures added. Please add at least one signature."
          );
        }

        // Prepare FormData
        const formData = new FormData();
        formData.append("file", file.originalFile as File);

        // Prepare signatures for backend (without File objects)
        const signaturesForBackend = signatures.map((sig) => ({
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
          opacity: sig.opacity ?? 1.0,
        }));

        formData.append(
          "signatures_json",
          JSON.stringify(signaturesForBackend)
        );

        // Append image files separately
        signatures.forEach((sig) => {
          if (sig.type === "image" && sig.imageFile) {
            formData.append(`signature_image_${sig.id}`, sig.imageFile);
          }
        });

        const blob = await signPdf(formData).unwrap();

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
    [signPdf]
  );

  // ============================================================================
  // SIGN ALL
  // ============================================================================
  const signAllFiles = useCallback(async () => {
    setSigning(true);
    for (const file of files.filter((f) => f.status === "pending")) {
      await signSingleFile(file);
    }
    setSigning(false);
  }, [files, signSingleFile]);

  // ============================================================================
  // CLEAR ALL
  // ============================================================================
  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("sign-pdf");
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
    signing,
    stats,
    addFiles,
    addFromGoogleDrive,
    addFromDropbox,
    updateFileSettings,
    addSignature,
    updateSignature,
    deleteSignature,
    removeFile,
    signSingleFile,
    signAllFiles,
    clearAll,
  };
};
