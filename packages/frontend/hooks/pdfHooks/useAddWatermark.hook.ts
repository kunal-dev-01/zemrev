// ============================================================================
// UPDATE: useAddWatermark hook with coordinate-based positioning
// ============================================================================

import {
  useAddTextWatermarkPdfMutation,
  useAddImageWatermarkPdfMutation,
} from "@/services/pdfService/pdf.api";
import { PdfFileSettings, PdfProcessedFile } from "@/services/pdfService/types";
import { extractApiErrorMessage } from "@/utils/errorExtract.utils";
import { pdfPendingStorage } from "@/utils/pdfPendingStorage.utils";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { useCallback, useEffect, useState } from "react";
import { useCloudPicker } from "../appHooks/usePdfCloudPicker.hook";

export const useAddWatermark = () => {
  const [files, setFiles] = useState<PdfProcessedFile[]>([]);
  const [processing, setProcessing] = useState(false);

  const [addTextWatermark] = useAddTextWatermarkPdfMutation();
  const [addImageWatermark] = useAddImageWatermarkPdfMutation();

  const { pickFromGoogleDrive, pickFromDropbox } = useCloudPicker();

  // ============================================================================
  // RESTORE
  // ============================================================================
  useEffect(() => {
    const restore = async () => {
      const restored = await pdfPendingStorage.restore("add-watermark");
      if (restored.length > 0)
        setFiles(
          restored.map(({ id, file }) => ({
            id,
            originalFile: file,
            name: file.name,
            size: file.size,
            type: file.type,
            settings: {
              text: "CONFIDENTIAL",
              font: "Arial", 
              opacity: 0.3,
              font_size: 50,
              rotation: 45,
              color: "gray",
              x: 150,      // NEW
              y: 350,      // NEW
              width: 300,  // NEW
              height: 150, // NEW
            },
            status: "pending" as const,
          }))
        );
    };
    restore();
  }, []);

  // ============================================================================
  // ADD FILES (LOCAL)
  // ============================================================================
  const addFiles = useCallback(async (newFiles: File[]) => {
    for (const file of newFiles) {
      const id = await pdfPendingStorage.save("add-watermark", file);
      setFiles((prev) => [
        ...prev,
        {
          id,
          originalFile: file,
          name: file.name,
          size: file.size,
          type: file.type,
          settings: {
            text: "CONFIDENTIAL",
            font: "Arial",
            opacity: 0.3,
            font_size: 50,
            rotation: 45,
            color: "gray",
            x: 150,
            y: 350,
            width: 300,
            height: 150,
          },
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
    const id = await pdfPendingStorage.save("add-watermark", file);

    setFiles((prev) => [
      ...prev,
      {
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: {
          text: "CONFIDENTIAL",
          font: "Arial",
          opacity: 0.3,
          font_size: 50,
          rotation: 45,
          color: "gray",
          x: 150,
          y: 350,
          width: 300,
          height: 150,
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
    const id = await pdfPendingStorage.save("add-watermark", file);

    setFiles((prev) => [
      ...prev,
      {
        id,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        settings: {
          text: "CONFIDENTIAL",
          font: "Arial",
          opacity: 0.3,
          font_size: 50,
          rotation: 45,
          color: "gray",
          x: 150,
          y: 350,
          width: 300,
          height: 150,
        },
        status: "pending",
      },
    ]);
  }, [pickFromDropbox]);

  // ============================================================================
  // REMOVE FILE
  // ============================================================================
  const removeFile = useCallback(async (id: string) => {
    await pdfPendingStorage.delete("add-watermark", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // ============================================================================
  // UPDATE SETTINGS
  // ============================================================================
  const updateSettings = useCallback(
    (id: string, settings: PdfFileSettings) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, settings: { ...f.settings, ...settings } } : f
        )
      );
    },
    []
  );

  // ============================================================================
  // PROCESS SINGLE - UPDATED WITH COORDINATES
  // ============================================================================
  const processSingle = useCallback(
    async (file: PdfProcessedFile) => {
      try {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "processing" } : f
          )
        );

        let blob: Blob;
        if (file.settings.watermarkFile) {
          blob = await addImageWatermark({
            file: file.originalFile as File,
            watermark: file.settings.watermarkFile as File,
            options: {
              opacity: file.settings.opacity as number,
              x: file.settings.x as number,
              y: file.settings.y as number,
              width: file.settings.width as number,
              height: file.settings.height as number,
              rotation: file.settings.rotation || 0,
            },
          }).unwrap();
        } else {
          blob = await addTextWatermark({
            file: file.originalFile as File,
            options: {
              text: file.settings.text as string,
              font: file.settings.font as string,
              opacity: file.settings.opacity as number,
              font_size: file.settings.font_size as number,
              rotation: file.settings.rotation as number,
              color: file.settings.color as string,
              x: file.settings.x as number,
              y: file.settings.y as number,
              width: file.settings.width as number,
              height: file.settings.height as number,
            },
          }).unwrap();
        }

        await pdfSessionStorage.saveFile(
          blob,
          `watermarked_${file.name}`,
          "add-watermark"
        );

        await pdfPendingStorage.delete("add-watermark", file.id);
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
    [addTextWatermark, addImageWatermark]
  );

  // ============================================================================
  // PROCESS ALL
  // ============================================================================
  const processAll = useCallback(async () => {
    setProcessing(true);
    for (const file of files.filter((f) => f.status === "pending")) {
      await processSingle(file);
    }
    setProcessing(false);
  }, [files, processSingle]);

  // ============================================================================
  // CLEAR ALL
  // ============================================================================
  const clearAll = useCallback(async () => {
    await pdfPendingStorage.clearTool("add-watermark");
    setFiles([]);
  }, []);

  return {
    files,
    processing,
    addFiles,
    addFromGoogleDrive,
    addFromDropbox,
    removeFile,
    updateSettings,
    processSingle,
    processAll,
    clearAll,
  };
};