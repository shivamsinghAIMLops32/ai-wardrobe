import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { UploadedImage } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { CloseIcon } from './icons/CloseIcon';

interface ImageUploaderProps {
  title: string;
  onImageUpload: (image: UploadedImage | null) => void;
}

const MIN_DIMENSION = 512;
const MAX_FILE_SIZE_MB = 5;
const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ImageUploader: React.FC<ImageUploaderProps> = ({ title, onImageUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploaderRef = useRef<HTMLDivElement>(null);

  const cleanup = useCallback(() => {
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
  }, [preview]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const validateAndProcessFile = useCallback((file: File) => {
    cleanup();
    // Type validation
    if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
      setError('Unsupported format. Please use PNG, JPEG, or WEBP.');
      return;
    }

    // Size validation
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      // Dimension validation
      if (image.width < MIN_DIMENSION || image.height < MIN_DIMENSION) {
        setError(`Image is too small. Minimum dimensions are ${MIN_DIMENSION}x${MIN_DIMENSION}px.`);
        URL.revokeObjectURL(objectUrl);
        return;
      }
      
      setFileName(file.name);
      setPreview(objectUrl);
      setError(null);

      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onImageUpload({ file, base64: base64String, preview: objectUrl });
      };
      reader.readAsDataURL(file);
    };
    
    image.onerror = () => {
        setError("Could not read image file.");
        URL.revokeObjectURL(objectUrl);
    }

    image.src = objectUrl;
  }, [onImageUpload, cleanup]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  }, [validateAndProcessFile]);
  
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file) {
          validateAndProcessFile(file);
      }
  }, [validateAndProcessFile]);
  
  // This effect handles the copy-paste functionality
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (!isFocused) return; // Only handle paste if this component is focused
      
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
          if (item.type.indexOf("image") !== -1) {
              const file = item.getAsFile();
              if (file) {
                  validateAndProcessFile(file);
                  break;
              }
          }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
        window.removeEventListener('paste', handlePaste);
    }
  }, [isFocused, validateAndProcessFile]);


  const handleDragEvents = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.type === 'dragenter' || event.type === 'dragover') {
          setIsDragging(true);
      } else if (event.type === 'dragleave') {
          setIsDragging(false);
      }
  };

  const handleClick = () => inputRef.current?.click();
  
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    cleanup();
    setPreview(null);
    setFileName(null);
    setError(null);
    onImageUpload(null);
    if(inputRef.current) {
        inputRef.current.value = '';
    }
  };

  const uploaderClass = `bg-base-200 border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 flex flex-col items-center justify-center aspect-square relative focus:outline-none ${
    isDragging ? 'border-brand-primary scale-105 bg-base-300' 
    : error ? 'border-red-500' 
    : isFocused ? 'border-brand-primary ring-2 ring-brand-primary'
    : 'border-base-300 hover:border-brand-secondary'
  }`;

  return (
    <div 
      ref={uploaderRef}
      className={uploaderClass}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragEnter={handleDragEvents}
      onDragOver={handleDragEvents}
      onDragLeave={handleDragEvents}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      role="button"
      tabIndex={0}
      aria-label={title}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={SUPPORTED_MIME_TYPES.join(',')}
      />
      {preview ? (
        <>
            <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
            <p className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-60 text-white text-xs p-1 rounded truncate">{fileName}</p>
            <button onClick={handleClear} className="absolute top-3 right-3 bg-base-100 rounded-full p-1.5 text-text-primary hover:bg-red-500 hover:text-white transition-colors" aria-label="Clear image">
                <CloseIcon className="w-5 h-5" />
            </button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-text-secondary pointer-events-none">
            {error ? (
                <>
                    <p className="text-red-400 font-semibold">Upload Error</p>
                    <p className="text-red-400 mt-2 text-sm">{error}</p>
                     <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setError(null);
                        }}
                        className="mt-4 px-4 py-1 bg-brand-primary text-white text-sm font-bold rounded-lg pointer-events-auto"
                    >
                        Try Again
                    </button>
                </>
            ) : (
                <>
                    <UploadIcon className="w-16 h-16 mb-4" />
                    <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
                    <p className="mt-1">Click, Paste, or Drag & Drop</p>
                </>
            )}
        </div>
      )}
    </div>
  );
};
