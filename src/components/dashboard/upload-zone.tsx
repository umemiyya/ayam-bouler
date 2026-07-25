"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileImage, FileVideo, X, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatFileSize, cn } from "@/lib/utils";

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4"];
export const ACCEPTED_EXT = ".jpg,.jpeg,.png,.webp,.mp4";
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export interface SelectedFile {
  file: File;
  previewUrl: string;
  kind: "image" | "video";
}

interface UploadZoneProps {
  selected: SelectedFile | null;
  onSelect: (file: SelectedFile | null) => void;
  uploadProgress: number | null; // 0-100, or null when not uploading
  disabled?: boolean;
  error: string | null;
  onErrorChange: (message: string | null) => void;
}

export function UploadZone({
  selected,
  onSelect,
  uploadProgress,
  disabled,
  error,
  onErrorChange,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const validateAndSet = React.useCallback(
    (file: File) => {
      onErrorChange(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        onErrorChange("This file type is not supported.");
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        onErrorChange("File is too large. Please upload something under 50MB.");
        return;
      }

      const kind: "image" | "video" = file.type.startsWith("video") ? "video" : "image";
      const previewUrl = URL.createObjectURL(file);
      onSelect({ file, previewUrl, kind });
    },
    [onSelect, onErrorChange]
  );

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSet(file);
  };

  const handleBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
    e.target.value = "";
  };

  const handleRemove = () => {
    if (selected) URL.revokeObjectURL(selected.previewUrl);
    onSelect(null);
    onErrorChange(null);
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            aria-label="Upload a chicken image or video, drag and drop or press Enter to browse"
            onClick={() => !disabled && inputRef.current?.click()}
            onKeyDown={(e) => {
              if (!disabled && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (!disabled) setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "flex min-h-64 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              isDragging
                ? "border-accent bg-accent-soft"
                : "border-border-strong bg-surface-2/40 hover:border-muted-2 hover:bg-surface-2",
              disabled && "cursor-not-allowed opacity-60"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_EXT}
              onChange={handleBrowse}
              className="sr-only"
              disabled={disabled}
              aria-hidden="true"
              tabIndex={-1}
            />
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Upload gambar ayam broiler.
              </p>
              <p className="mt-1 text-sm text-muted">
                atau <span className="text-accent underline underline-offset-2">Cari di Komputer</span>
              </p>
            </div>
            <p className="text-xs text-muted-2">
              Mendukung JPG, PNG, WEBP.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="viewfinder overflow-hidden rounded-lg border border-border-subtle bg-surface-2/40"
          >
            <div className="relative flex items-center justify-center bg-black/40">
              {selected.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selected.previewUrl}
                  alt={`Preview of ${selected.file.name}`}
                  className="max-h-80 w-full object-contain"
                />
              ) : (
                <video
                  src={selected.previewUrl}
                  controls
                  className="max-h-80 w-full"
                  aria-label={`Preview of ${selected.file.name}`}
                />
              )}
              {!disabled && (
                <button
                  type="button"
                  onClick={handleRemove}
                  aria-label="Remove file"
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 border-t border-border-subtle px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-2 text-muted">
                {selected.kind === "image" ? (
                  <FileImage className="h-4.5 w-4.5" />
                ) : (
                  <FileVideo className="h-4.5 w-4.5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{selected.file.name}</p>
                <p className="text-xs text-muted-2">{formatFileSize(selected.file.size)}</p>
              </div>
            </div>
            {uploadProgress !== null && (
              <div className="space-y-1.5 border-t border-border-subtle px-4 py-3">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>Uploading…</span>
                  <span className="font-mono tabular-nums">{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} aria-label="Upload progress" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
