// ============================================================================
// FILE: ImageMetadata/MainMetadata/MetadataViewer.tsx
// ============================================================================

import { useEffect, useState, useCallback } from "react";
import { CopySvg, CheckSvg } from "@/components/Svg/CommonSvg";
import GlassButton from "@/components/Layouts/GlassButton";
import { sessionStorageUtils } from "@/utils/sessionStorage.utils";
import { useImageMetadata } from "@/hooks/imageHooks/useImageMetadata.hook";
import type { MetadataResponse, StoredFile } from "@/services/imageService/types";

type Props = {
  extractedMetadata?: MetadataResponse;
  reset?: () => void;
};

type SavedMetadataItem = StoredFile & {
  json: MetadataResponse;
};

type MetadataSectionData = Record<string, unknown>;

const MetadataViewer = ({ extractedMetadata, reset }: Props) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [savedMetadata, setSavedMetadata] = useState<SavedMetadataItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const {
    getSavedMetadata,
    deleteSavedMetadata,
    clearAllSavedMetadata,
    exportMetadataAsJson,
  } = useImageMetadata();

  // -------------------------------------------------------
  // LOAD SAVED METADATA
  // -------------------------------------------------------
  useEffect(() => {
    const loadSaved = async () => {
      const stored = getSavedMetadata();
      const full: SavedMetadataItem[] = [];

      for (const item of stored) {
        const blob = await sessionStorageUtils.getBlob(item.id);
        if (!blob) continue;

        full.push({
          ...item,
          json: JSON.parse(await blob.text()),
        });
      }
      setSavedMetadata(full);
    };

    loadSaved();
    window.addEventListener("sessionStorageUpdated", loadSaved);

    return () =>
      window.removeEventListener("sessionStorageUpdated", loadSaved);
  }, [getSavedMetadata]);

  // -------------------------------------------------------
  // COPY HANDLER
  // -------------------------------------------------------
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  }, []);

  // -------------------------------------------------------
  // METADATA SECTION RENDERER
  // -------------------------------------------------------
  const renderSection = (title: string, data: Record<string, unknown>) => {
    const entries = Object.entries(data).filter(
      ([, v]) => v !== null && v !== undefined && v !== ""
    );

    if (!entries.length) return null;

    return (
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 bg-zinc-50 dark:bg-zinc-800/50">
        <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
          {title}
        </h4>

        <div className="space-y-2">
          {entries.map(([key, value]) => {
            const val =
              typeof value === "object"
                ? JSON.stringify(value, null, 2)
                : String(value);

            return (
              <div
                key={key}
                className="flex justify-between gap-1 items-center py-2 border-b border-zinc-200 dark:border-zinc-700 last:border-0"
              >
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 capitalize">
                  {key.replace(/_/g, " ")}:
                </span>

                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-zinc-800 dark:text-zinc-200 max-w-xs truncate font-mono">
                    {val}
                  </span>

                  <button
                    onClick={() => handleCopy(val)}
                    className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                  >
                    {copiedText === val ? <CheckSvg /> : <CopySvg />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // -------------------------------------------------------
  // SAVED METADATA VIEW (list)
  // -------------------------------------------------------
  if (!extractedMetadata) {
    return savedMetadata.length > 0 ? (
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-zinc-900/40 p-3 md:p-6 mb-[1vh] md:mb-[1vw]">

        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md md:text-lg font-semibold">
            Saved Metadata ({savedMetadata.length})
          </h3>

          <button
            onClick={clearAllSavedMetadata}
            className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 cursor-pointer hover:bg-red-100 dark:hover:bg-red-800/20 transition-all"
          >
            Clear All
          </button>
        </div>

        <div className="space-y-3">
          {savedMetadata.map((item) => (
            <div
              key={item.id}
              className="border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{item.name}</h4>
                  <p className="text-xs text-zinc-500">{new Date(item.timestamp).toLocaleString()}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => exportMetadataAsJson(item.id, item.name)}
                    className="px-3 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700 cursor-pointer text-sm dark:bg-zinc-800 bg-zinc-200"
                  >
                    Export
                  </button>

                  <button
                    onClick={() => deleteSavedMetadata(item.id)}
                    className="px-3 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700 cursor-pointer text-sm dark:bg-zinc-800 bg-zinc-200"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div>Size: <b>{item.json.metadata.file.size_mb.toFixed(2)} MB</b></div>
                <div>Dims: <b>{item.json.metadata.image.dimensions}</b></div>
                <div>Format: <b>{item.json.metadata.file.format.toUpperCase()}</b></div>
                <div>EXIF: <b>{item.json.metadata.exif.has_exif ? "Yes" : "No"}</b></div>
              </div>

              {/* Expand */}
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="mt-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400"
              >
                {expandedId === item.id ? "Hide Details" : "Show Details"}
              </button>

              {expandedId === item.id && (
                <div className="mt-3 space-y-2 overflow-hidden">
                  {renderSection("File Information", item.json.metadata.file)}
                  {renderSection("Image Properties", item.json.metadata.image)}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    ) : null;
  }

  // -------------------------------------------------------
  // EXTRACTED METADATA VIEW
  // -------------------------------------------------------
  const m = extractedMetadata.metadata;

  return (
    <div className="space-y-4 mt-4">

      <div className="flex justify-end">
        <GlassButton
          onClick={async () => {
            const saved = getSavedMetadata();
            const last = saved.at(-1);
            if (last) exportMetadataAsJson(last.id, last.name);
          }}
          primaryColor="#6366f1"
        >
          Export JSON
        </GlassButton>
      </div>

      {renderSection("File Information", m.file)}
      {renderSection("Image Properties", m.image)}
      {renderSection("Technical Details", m.technical)}
      {renderSection("Color Information", m.color)}

      {m.exif.has_exif && renderSection("Camera Info", m.exif.camera as MetadataSectionData)}
      {m.exif.has_exif && renderSection("Camera Settings", m.exif.settings as MetadataSectionData)}
      {m.exif.has_exif && renderSection("GPS Location", m.exif.location as MetadataSectionData)}
      {m.exif.has_exif && renderSection("Date & Time", m.exif.datetime as MetadataSectionData)}
      {m.exif.has_exif && renderSection("Additional Info", m.exif.other)}

      {reset && (
        <button
          onClick={reset}
          className="w-full px-6 py-2 rounded-xl font-semibold text-white cursor-pointer"
          style={{ backgroundColor: "#6366f1" }}
        >
          Extract Another Image
        </button>
      )}
    </div>
  );
};

export default MetadataViewer;
