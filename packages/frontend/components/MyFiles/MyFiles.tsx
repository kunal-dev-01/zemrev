import { useEffect, useState, useCallback } from "react";
import { MyFilesHeader } from "./MyFilesHeader";
import { MyFilesSection } from "./MyFilesSection";
import { MyFilesEmpty } from "./MyFilesEmpty";
import { MyFilesLoading } from "./MyFilesLoading";
import { sessionStorageUtils } from "@/utils/sessionStorage.utils";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { TOOL_CONFIGS } from "@/config/image.tool.config";
import { PDF_TOOL_CONFIGS } from "@/config/pdf.tool.config";
import { FileImage } from "@/components/Svg/HomeSvg";
import { PDFToImageSVg } from "@/components/Svg/PdfSvg";
import type { ToolType, StoredFile } from "@/services/imageService/types";
import type { PdfToolType, PdfStoredFile } from "@/services/pdfService/types";
import { TrashSvg } from "../Svg/CommonSvg";
import { useFormatUtils } from "@/hooks/appHooks/useFormatUtils";

export interface FilesByTool {
  toolName: string;
  toolIcon: React.ReactNode;
  files: (StoredFile | PdfStoredFile)[];
  type: "image" | "pdf";
  toolType: ToolType | PdfToolType;
  color: string;
  bgColor: string;
}

const MyFiles = () => {
  const [filesByTool, setFilesByTool] = useState<FilesByTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingTool, setDownloadingTool] = useState<string | null>(null);
  const [confirmClearTool, setConfirmClearTool] = useState<
    (ToolType | PdfToolType) | null
  >(null);

  const { formatSize, formatTimeAgo, truncateFileName } = useFormatUtils();

  const loadAllFiles = useCallback(() => {
    const allFiles: FilesByTool[] = [];

    (Object.keys(TOOL_CONFIGS) as ToolType[]).forEach((toolType) => {
      const files = sessionStorageUtils.getFiles(toolType);
      if (files.length > 0) {
        const config = TOOL_CONFIGS[toolType];
        allFiles.push({
          toolName: config.title,
          toolIcon: <FileImage />,
          files,
          type: "image",
          toolType,
          color: config.primaryColor,
          bgColor: config.dropzoneColor,
        });
      }
    });

    (Object.keys(PDF_TOOL_CONFIGS) as string[]).forEach((toolKey) => {
      const config = PDF_TOOL_CONFIGS[toolKey];
      const toolType = config.type as PdfToolType;
      const files = pdfSessionStorage.getFiles(toolType);
      if (files.length > 0) {
        allFiles.push({
          toolName: config.title,
          toolIcon: <PDFToImageSVg />,
          files,
          type: "pdf",
          toolType,
          color: config.primaryColor,
          bgColor: config.dropzoneColor,
        });
      }
    });

    setFilesByTool(allFiles);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadAllFiles();
  }, [loadAllFiles]);

  useEffect(() => {
    const handleImageUpdate = () => loadAllFiles();
    const handlePdfUpdate = () => loadAllFiles();
    window.addEventListener("sessionStorageUpdated", handleImageUpdate);
    window.addEventListener("pdfSessionStorageUpdated", handlePdfUpdate);
    return () => {
      window.removeEventListener("sessionStorageUpdated", handleImageUpdate);
      window.removeEventListener("pdfSessionStorageUpdated", handlePdfUpdate);
    };
  }, [loadAllFiles]);

  const handleDownloadFile = async (
    fileId: string,
    fileName: string,
    type: "image" | "pdf"
  ) => {
    try {
      const blob =
        type === "image"
          ? await sessionStorageUtils.getBlob(fileId)
          : await pdfSessionStorage.getBlob(fileId);
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownloadToolFiles = async (
    files: (StoredFile | PdfStoredFile)[],
    toolType: ToolType | PdfToolType,
    type: "image" | "pdf",
    toolName: string
  ) => {
    setDownloadingTool(toolType);
    try {
      const { zipDownloadUtils } = await import("@/utils/zipDownload.utils");
      const filesToZip = [];
      for (const file of files) {
        const blob =
          type === "image"
            ? await sessionStorageUtils.getBlob(file.id)
            : await pdfSessionStorage.getBlob(file.id);
        if (blob) filesToZip.push({ name: file.name, blob });
      }
      if (filesToZip.length > 0) {
        await zipDownloadUtils.downloadAsZip(
          filesToZip,
          toolName.toLowerCase().replace(/\s+/g, "-")
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDownloadingTool(null);
    }
  };

  const handleDeleteFile = async (
    fileId: string,
    toolType: ToolType | PdfToolType,
    type: "image" | "pdf"
  ) => {
    try {
      if (type === "image")
        await sessionStorageUtils.deleteFile(toolType as ToolType, fileId);
      else await pdfSessionStorage.deleteFile(toolType as PdfToolType, fileId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClearAllTool = async (
    toolType: ToolType | PdfToolType,
    type: "image" | "pdf"
  ) => {
    try {
      if (type === "image")
        await sessionStorageUtils.clearTool(toolType as ToolType);
      else await pdfSessionStorage.clearTool(toolType as PdfToolType);
      setConfirmClearTool(null);
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <MyFilesLoading />;
  if (filesByTool.length === 0) return <MyFilesEmpty />;

  return (
    <div className="w-full mx-auto md:px-4 md:py-12 py-2">
      <MyFilesHeader
        totalFiles={filesByTool.reduce((acc, t) => acc + t.files.length, 0)}
      />

      <div className="grid grid-cols-1 gap-10">
        {filesByTool.map((toolSection) => (
          <MyFilesSection
            key={toolSection.toolType}
            toolSection={toolSection}
            downloadingTool={downloadingTool}
            onDownloadFile={handleDownloadFile}
            onDownloadToolFiles={handleDownloadToolFiles}
            onDeleteFile={handleDeleteFile}
            onSetConfirmClearTool={setConfirmClearTool}
            formatSize={formatSize}
            formatTimeAgo={formatTimeAgo}
            truncateFileName={truncateFileName}
          />
        ))}
      </div>

      {/* Confirmation Popup */}
      {confirmClearTool && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-sm w-full p-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
              <TrashSvg className="w-6 h-6 text-red-600" />
            </div>

            <h2 className="text-xl font-bold text-center text-zinc-900 dark:text-white mb-2">
              Clear All Files?
            </h2>

            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">
              This action will permanently delete all files from this tool. This
              cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmClearTool(null)}
                className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  const toolSection = filesByTool.find(
                    (t) => t.toolType === confirmClearTool
                  );
                  if (toolSection) {
                    handleClearAllTool(confirmClearTool, toolSection.type);
                  }
                }}
                className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-all cursor-pointer"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFiles;
