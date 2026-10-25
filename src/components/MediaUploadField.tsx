import React, { useState, useRef } from 'react';
import {
  Upload,
  Link as LinkIcon,
  X,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  Eye,
  RefreshCw
} from 'lucide-react';

interface MediaUploadFieldProps {
  label: string;
  type: 'image' | 'pdf';
  value: string;
  onChange: (val: string, meta?: { fileName?: string; fileSize?: string; isUpload?: boolean }) => void;
  fileName?: string;
  fileSize?: string;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  previewAspect?: 'video' | 'portrait' | 'square' | 'auto';
}

export const MediaUploadField: React.FC<MediaUploadFieldProps> = ({
  label,
  type,
  value,
  onChange,
  fileName,
  fileSize,
  placeholder,
  required = false,
  helperText,
  previewAspect = 'video'
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState(value && !value.startsWith('data:') ? value : '');
  const [localFileName, setLocalFileName] = useState<string>(fileName || '');
  const [localFileSize, setLocalFileSize] = useState<string>(fileSize || '');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileProcess = (file: File) => {
    const sizeStr = formatFileSize(file.size);
    setLocalFileName(file.name);
    setLocalFileSize(sizeStr);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onChange(result, {
        fileName: file.name,
        fileSize: sizeStr,
        isUpload: true
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileProcess(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileProcess(files[0]);
    }
  };

  const handleUrlSubmit = (url: string) => {
    setUrlInput(url);
    if (!url.trim()) {
      onChange('', { fileName: undefined, fileSize: undefined });
      return;
    }
    const derivedName = url.split('/').pop() || (type === 'image' ? 'web_image.jpg' : 'document.pdf');
    setLocalFileName(derivedName);
    onChange(url.trim(), {
      fileName: derivedName,
      fileSize: undefined,
      isUpload: false
    });
  };

  const handleClear = () => {
    onChange('', { fileName: undefined, fileSize: undefined });
    setUrlInput('');
    setLocalFileName('');
    setLocalFileSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasValue = Boolean(value && value.trim());

  return (
    <div className="space-y-1.5">
      {/* Label & Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
          {label} {required && <span className="text-emerald-500">*</span>}
        </label>

        <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer flex items-center space-x-1 ${
              mode === 'upload'
                ? 'bg-white dark:bg-neutral-700 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Upload className="h-3 w-3" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer flex items-center space-x-1 ${
              mode === 'url'
                ? 'bg-white dark:bg-neutral-700 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <LinkIcon className="h-3 w-3" />
            <span>Link URL</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={type === 'image' ? 'image/*' : 'application/pdf'}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Zone or URL Input */}
      {mode === 'upload' ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-emerald-500 bg-emerald-500/10 scale-99'
              : hasValue
              ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-950/10'
              : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 hover:border-emerald-500/40 hover:bg-neutral-100/70 dark:hover:bg-neutral-900'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 rounded-2xl bg-white dark:bg-neutral-800 shadow-2xs border border-neutral-200/80 dark:border-neutral-700 text-emerald-600 dark:text-emerald-400">
              {type === 'image' ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-800 dark:text-stone-200">
                {hasValue ? 'Click to replace or drag new file' : `Click to upload ${type === 'image' ? 'cover image' : 'PDF document'}`}
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {type === 'image'
                  ? 'Supports JPG, PNG, WebP (up to 20MB)'
                  : 'Supports PDF documents, CAD schematics, and vector guides'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={placeholder || (type === 'image' ? 'https://images.unsplash.com/photo-...' : 'https://example.com/document.pdf')}
              value={urlInput}
              onChange={e => handleUrlSubmit(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          {hasValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
              title="Clear input"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Live Preview Display (Image Thumbnail or PDF Document Card) */}
      {hasValue && (
        <div className="pt-2">
          {type === 'image' ? (
            <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-900 group">
              <div
                className={`w-full overflow-hidden ${
                  previewAspect === 'portrait'
                    ? 'aspect-3/4 max-h-56'
                    : previewAspect === 'square'
                    ? 'aspect-square max-h-48'
                    : 'aspect-video max-h-48'
                }`}
              >
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Overlay controls */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 flex items-between justify-between p-3">
                <div className="self-end text-white text-[11px] font-mono">
                  {localFileName && <span className="truncate max-w-[200px] block font-bold">{localFileName}</span>}
                  {localFileSize && <span className="text-stone-300 text-[10px]">{localFileSize}</span>}
                </div>

                <div className="flex items-center space-x-1.5 self-start">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs flex items-center space-x-1 cursor-pointer"
                    title="Replace file"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-white text-xs cursor-pointer"
                    title="Remove file"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* PDF Document Card */
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-neutral-900 dark:text-stone-100 truncate">
                      {localFileName || 'Uploaded PDF Document'}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold shrink-0">
                      PDF
                    </span>
                  </div>
                  {localFileSize && (
                    <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono mt-0.5">
                      {localFileSize}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 text-stone-600 dark:text-stone-300 hover:text-emerald-500 transition-colors"
                  title="Test / View document"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-red-50 hover:border-red-200 text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
                  title="Remove document"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {helperText && (
        <p className="text-[11px] text-stone-500 dark:text-stone-400">
          {helperText}
        </p>
      )}
    </div>
  );
};
