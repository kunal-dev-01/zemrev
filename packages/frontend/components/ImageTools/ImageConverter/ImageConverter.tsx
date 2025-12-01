// ============================================================================
// FILE: src/components/ImageTools/ImageConverter/ImageConverter.tsx
// PURPOSE: Main converter component
// ============================================================================

"use client";

import { useImageConverter } from "@/hooks/imageHooks/useImageConverter";
import { FileUploader } from "@/components/Shared/FileUploader";
import { FileList } from "@/components/Shared/FileList";
import { ConversionSettings } from "@/components/Shared/ConvertionSettings";
import { DownloadSection } from "@/components/Shared/DownloadSection";
import { Spinner } from "@/components/Layouts/Spinner";

const ImageConverter = () => {
  
  const {
    uploadedFiles,
    convertedFiles,
    settings,
    isProcessing,
    currentIndex,
    handleFilesSelected,
    removeFile,
    updateSettings,
    clearConverted,
    clearAll,
    startConversion,
  } = useImageConverter();
  
  return (
    <div className="w-full space-y-6 md:mt-[1vw] mt-[1vh]">
      
      {/* File Uploader */}
      <FileUploader
        onFilesSelected={handleFilesSelected}
        maxFiles={5}
        currentCount={uploadedFiles.length}
        dropColor="border-blue-500 bg-blue-50 dark:bg-blue-950/20"
        buttonColor="bg-blue-500 hover:bg-blue-600"
        showUrlOption
      />
      
      {/* Uploaded Files List */}
      <FileList
        files={uploadedFiles}
        onRemove={removeFile}
        disabled={isProcessing}
      />
      
      {/* Settings */}
      {uploadedFiles.length > 0 && (
        <ConversionSettings
          settings={settings}
          onChange={updateSettings}
          disabled={isProcessing}
        />
      )}
      
      {/* Convert Button */}
      {uploadedFiles.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={startConversion}
            disabled={isProcessing}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-400 text-white rounded-lg font-semibold text-lg transition-colors flex items-center gap-3"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5">
                  <Spinner />
                </div>
                <span>
                  Converting {currentIndex + 1} / {uploadedFiles.length}
                </span>
              </>
            ) : (
              <span>Convert Images</span>
            )}
          </button>
        </div>
      )}
      
      {/* Download Section */}
      <DownloadSection
        files={convertedFiles}
        onClearAll={() => {
          clearConverted();
          clearAll();
        }}
      />
      
    </div>
  );
};

export default ImageConverter;