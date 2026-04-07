'use client';

import { useCallback, useState, useRef } from 'react';

interface UploadZoneProps {
  onImage: (file: File) => void;
  disabled?: boolean;
}

export default function UploadZone({ onImage, disabled }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type.startsWith('image/')) {
        onImage(file);
      }
    },
    [onImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        flex cursor-pointer flex-col items-center justify-center gap-3
        border-2 border-dashed border-border rounded-[20px] p-10 transition-all
        ${dragOver ? 'border-accent bg-accent-light' : 'hover:border-accent hover:bg-accent-light'}
        ${disabled ? 'pointer-events-none opacity-50' : ''}
      `}
    >
      <div className="w-12 h-12 bg-accent-light text-accent rounded-xl flex items-center justify-center">
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
      </div>
      <p className="text-base font-semibold text-primary">
        Drop a face photo here or click to upload
      </p>
      <p className="text-sm text-text-tertiary">
        JPG, PNG — processed locally in your browser
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
