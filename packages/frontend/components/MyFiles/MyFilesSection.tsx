import { DownloadSvg, TrashSvg } from "@/components/Svg/CommonSvg";
import { FileImage } from "@/components/Svg/HomeSvg";
import { PDFToImageSVg } from "@/components/Svg/PdfSvg";
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

interface MyFilesSectionProps {
  toolSection: FilesByTool;
  downloadingTool: string | null;
  onDownloadFile: (fileId: string, toolType: ToolType | PdfToolType, type: "image" | "pdf") => void;
  onDownloadToolFiles: (files: (StoredFile | PdfStoredFile)[], toolType: ToolType | PdfToolType, type: "image" | "pdf", toolName: string) => void;
  onDeleteFile: (fileId: string, toolType: ToolType | PdfToolType, type: "image" | "pdf") => void;
  onSetConfirmClearTool: (tool: ToolType | PdfToolType | null) => void;
  formatSize: (bytes: number) => string;
  formatTimeAgo: (timestamp: number) => string;
  truncateFileName: (name: string, maxLength?: number) => string;
}

export const MyFilesSection = ({
  toolSection,
  downloadingTool,
  onDownloadFile,
  onDownloadToolFiles,
  onDeleteFile,
  onSetConfirmClearTool,
  formatSize,
  formatTimeAgo,
  truncateFileName
}: MyFilesSectionProps) => {
  return (
    <section className="group transition-all duration-300">
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
            onClick={() => onDownloadToolFiles(toolSection.files, toolSection.toolType, toolSection.type, toolSection.toolName)}
            disabled={downloadingTool === toolSection.toolType}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white cursor-pointer transition-all disabled:grayscale disabled:opacity-50"
            style={{ backgroundColor: toolSection.color }}
          >
            <DownloadSvg className="w-5 h-5" />
            {downloadingTool === toolSection.toolType ? "Archiving..." : "Download All"}
          </button>

          <button
            onClick={() => onSetConfirmClearTool(toolSection.toolType)}
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
                  {toolSection.type === "image" ? <FileImage /> : <PDFToImageSVg />}
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
                  onClick={() => onDownloadFile(file.id, toolSection.toolType, toolSection.type)}
                  className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer"
                  title="Download File"
                >
                  <DownloadSvg className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onDeleteFile(file.id, toolSection.toolType, toolSection.type)}
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
  );
};