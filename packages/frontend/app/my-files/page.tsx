"use client";

import { useEffect, useState, useCallback } from "react";
import { sessionStorageUtils } from "@/utils/sessionStorage.utils";
import { pdfSessionStorage } from "@/utils/pdfSessionStorage.utils";
import { zipDownloadUtils } from "@/utils/zipDownload.utils";
import { TOOL_CONFIGS } from "@/config/image.tool.config";
import { PDF_TOOL_CONFIGS } from "@/config/pdf.tool.config";
import {
  DownloadSvg,
  FolderOpenSvg,
  TrashSvg,
} from "@/components/Svg/CommonSvg";
import { FileImage } from "@/components/Svg/HomeSvg";
import { PDFToImageSVg } from "@/components/Svg/PdfSvg";
import { useDarkMode } from "@/hooks/appHooks/useDarkMode";
import type { ToolType, StoredFile } from "@/services/imageService/types";
import type { PdfToolType, PdfStoredFile } from "@/services/pdfService/types";

interface FilesByTool {
  toolName: string;
  toolIcon: React.ReactNode;
  files: (StoredFile | PdfStoredFile)[];
  type: "image" | "pdf";
  toolType: ToolType | PdfToolType;
  color: string;
  bgColor: string;
}

const MyFiles = () => {
  const isDark = useDarkMode();
  const [filesByTool, setFilesByTool] = useState<FilesByTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingTool, setDownloadingTool] = useState<string | null>(null);
  const [confirmClearTool, setConfirmClearTool] = useState<(ToolType | PdfToolType) | null>(null);

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

  const handleDownloadFile = async (fileId: string, fileName: string, type: "image" | "pdf") => {
    try {
      const blob = type === "image" ? await sessionStorageUtils.getBlob(fileId) : await pdfSessionStorage.getBlob(fileId);
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) { console.error(error); }
  };

  const handleDownloadToolFiles = async (files: (StoredFile | PdfStoredFile)[], toolType: ToolType | PdfToolType, type: "image" | "pdf", toolName: string) => {
    setDownloadingTool(toolType);
    try {
      const filesToZip = [];
      for (const file of files) {
        const blob = type === "image" ? await sessionStorageUtils.getBlob(file.id) : await pdfSessionStorage.getBlob(file.id);
        if (blob) filesToZip.push({ name: file.name, blob });
      }
      if (filesToZip.length > 0) {
        await zipDownloadUtils.downloadAsZip(filesToZip, toolName.toLowerCase().replace(/\s+/g, "-"));
      }
    } catch (error) { console.error(error); } finally { setDownloadingTool(null); }
  };

  const handleDeleteFile = async (fileId: string, toolType: ToolType | PdfToolType, type: "image" | "pdf") => {
    try {
      if (type === "image") await sessionStorageUtils.deleteFile(toolType as ToolType, fileId);
      else await pdfSessionStorage.deleteFile(toolType as PdfToolType, fileId);
    } catch (error) { console.error(error); }
  };

  const handleClearAllTool = async (toolType: ToolType | PdfToolType, type: "image" | "pdf") => {
    try {
      if (type === "image") await sessionStorageUtils.clearTool(toolType as ToolType);
      else await pdfSessionStorage.clearTool(toolType as PdfToolType);
      setConfirmClearTool(null);
    } catch (error) { console.error(error); }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const truncateFileName = (name: string, maxLength = 30) => {
    if (name.length <= maxLength) return name;
    const ext = name.split(".").pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
    return `${nameWithoutExt.substring(0, maxLength - 8)}...${ext}`;
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-zinc-200 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-zinc-500 animate-pulse font-medium">Scanning your files...</p>
      </div>
    );
  }

  if (filesByTool.length === 0) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <div className="text-center bg-white dark:bg-zinc-900/50 p-10 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800">
          <div className="mb-6 inline-flex p-5 bg-zinc-100 dark:bg-zinc-800 rounded-full">
            <FolderOpenSvg className="w-12 h-12 text-zinc-400" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">Workspace is Empty</h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
            Process some images or PDFs to see them organized here for download.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto md:px-4 md:py-12 py-2">
      {/* Confirmation Popup */}
      {confirmClearTool && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-sm w-full p-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
              <TrashSvg className="w-6 h-6 text-red-600" />
            </div>
            
            <h2 className="text-xl font-bold text-center text-zinc-900 dark:text-white mb-2">
              Clear All Files?
            </h2>
            
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">
              This action will permanently delete all files from this tool. This cannot be undone.
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
                  const toolSection = filesByTool.find(t => t.toolType === confirmClearTool);
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

      {/* Dynamic Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full uppercase tracking-wider">
            History
          </span>
          <h1 className="md:text-4xl text-2xl font-extrabold text-zinc-900 dark:text-white mt-3 tracking-tight">
            My Files
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 flex items-center gap-2 ">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {filesByTool.reduce((acc, t) => acc + t.files.length, 0)} processed files ready for download
          </p>
        </div>
        
        <div className="md:text-right">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">Session Security</p>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 px-4 py-2 rounded-lg inline-block">
            <p className="text-sm text-amber-700 dark:text-amber-400 font-medium italic">
              Files auto-delete in 2 hours
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {filesByTool.map((toolSection) => (
          <section
            key={toolSection.toolType}
            className="group transition-all duration-300"
          >
            {/* Tool Header Section */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: toolSection.color, color: 'white' }}
                >
                  <div className="w-6 h-6">{toolSection.toolIcon}</div>
                </div>
                <div>
                  <h3 className="md:text-xl text-md truncate font-bold text-zinc-800 dark:text-zinc-100 leading-tight">
                    {toolSection.toolName}
                  </h3>
                  <span className="md:text-sm text-xs font-medium text-zinc-500 uppercase tracking-tighter">
                    {toolSection.files.length} Item{toolSection.files.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {toolSection.files.length > 1 && (
              <div className="flex gap-3 mb-3">
                <button
                  onClick={() => handleDownloadToolFiles(toolSection.files, toolSection.toolType, toolSection.type, toolSection.toolName)}
                  disabled={downloadingTool === toolSection.toolType}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white cursor-pointer transition-all disabled:grayscale disabled:opacity-50"
                  style={{ backgroundColor: toolSection.color }}
                >
                  <DownloadSvg className="w-5 h-5" />
                  {downloadingTool === toolSection.toolType ? "Archiving..." : "Download All"}
                </button>

                <button
                  onClick={() => setConfirmClearTool(toolSection.toolType)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer transition-all"
                >
                  <TrashSvg className="w-5 h-5" />
                  Clear All
                </button>
              </div>
            )}

            {/* Files Container */}
            <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-4xl overflow-hidden backdrop-blur-md shadow-sm">
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {toolSection.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-5 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-all duration-200 group/item"
                  >
                    <div className="flex items-center gap-5 min-w-0">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${toolSection.color}15`, color: toolSection.color }}
                      >
                        {toolSection.type === "image" ? <FileImage  /> : <PDFToImageSVg />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate text-base" title={file.name}>
                          {truncateFileName(file.name)}
                        </h4>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500 mt-0.5">
                          {formatSize(file.size)} <span className="mx-1.5 opacity-30">•</span> {formatTimeAgo(file.timestamp)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-4">
                      <button
                        onClick={() => handleDownloadFile(file.id, file.name, toolSection.type)}
                        className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer"
                        title="Download File"
                      >
                        <DownloadSvg className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleDeleteFile(file.id, toolSection.toolType, toolSection.type)}
                        className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
                        title="Remove"
                      >
                        <TrashSvg className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default MyFiles;