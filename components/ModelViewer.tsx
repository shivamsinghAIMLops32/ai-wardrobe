import React, { useState, useRef, MouseEvent as ReactMouseEvent } from 'react';
import type { GeneratedImage } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { CheckIcon } from './icons/CheckIcon';
import { RegenerateIcon } from './icons/RegenerateIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { ZoomInIcon } from './icons/ZoomInIcon';
import { ZoomOutIcon } from './icons/ZoomOutIcon';
import { ResetZoomIcon } from './icons/ResetZoomIcon';


interface ModelViewerProps {
  images: GeneratedImage[];
  showToast: (message: string, type?: 'success' | 'error') => void;
  onRegenerate: (viewId: string) => void;
  regeneratingViews: Set<string>;
}

export const ModelViewer: React.FC<ModelViewerProps> = ({ images, showToast, onRegenerate, regeneratingViews }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState<Record<string, boolean>>({});
  
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const activeImage = images[activeIndex];

  const handleDownload = (e: ReactMouseEvent) => {
    e.stopPropagation();
    if (!activeImage) return;
    const { src, title, id } = activeImage;
    const link = document.createElement('a');
    link.href = src;
    link.download = `${title.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Image downloaded successfully!');
    setDownloadStatus(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setDownloadStatus(prev => ({ ...prev, [id]: false })), 2000);
  };
  
  const resetZoom = () => {
      setScale(1);
      setOffset({ x: 0, y: 0 });
  };
  
  const handleSelectImage = (index: number) => {
      setActiveIndex(index);
      resetZoom();
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newScale = Math.min(Math.max(0.5, scale - e.deltaY * 0.001), 5);
    setScale(newScale);
  };
  
  const handleMouseDown = (e: ReactMouseEvent) => {
      if(scale > 1) {
          setIsPanning(true);
      }
  };
  
  const handleMouseUp = () => {
      setIsPanning(false);
  };
  
  const handleMouseMove = (e: ReactMouseEvent) => {
      if(isPanning) {
          setOffset(prev => ({
              x: prev.x + e.movementX,
              y: prev.y + e.movementY
          }))
      }
  };


  return (
    <div className="w-full max-w-4xl">
      <div 
        ref={imageContainerRef}
        className="relative aspect-[3/4] bg-base-200 rounded-2xl overflow-hidden shadow-lg mb-4 select-none"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {activeImage ? (
            <>
                <img
                    src={activeImage.src}
                    alt={activeImage.title}
                    className="w-full h-full object-contain transition-transform duration-100"
                    style={{ 
                        transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`,
                        cursor: isPanning ? 'grabbing' : (scale > 1 ? 'grab' : 'default')
                    }}
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button onClick={() => setScale(s => Math.min(s + 0.2, 5))} className="bg-black/50 p-2 rounded-full text-white hover:bg-black/75 transition-colors" title="Zoom In"><ZoomInIcon className="w-5 h-5"/></button>
                    <button onClick={() => setScale(s => Math.max(s - 0.2, 0.5))} className="bg-black/50 p-2 rounded-full text-white hover:bg-black/75 transition-colors" title="Zoom Out"><ZoomOutIcon className="w-5 h-5"/></button>
                    <button onClick={resetZoom} className="bg-black/50 p-2 rounded-full text-white hover:bg-black/75 transition-colors" title="Reset Zoom"><ResetZoomIcon className="w-5 h-5"/></button>
                    <button onClick={handleDownload} className="bg-black/50 p-2 rounded-full text-white hover:bg-black/75 transition-colors" title="Download Image">
                      {downloadStatus[activeImage.id] ? <CheckIcon className="w-5 h-5 text-green-400"/> : <DownloadIcon className="w-5 h-5"/>}
                    </button>
                </div>
            </>
        ) : (
             <div className="w-full h-full flex items-center justify-center">
                <p className="text-text-secondary">No image to display.</p>
            </div>
        )}
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-2 -mx-4 px-4">
        {images.map((image, index) => {
          const isRegenerating = regeneratingViews.has(image.id);
          return (
            <div key={image.id} className="relative group flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28">
                <button
                    onClick={() => handleSelectImage(index)}
                    className={`w-full h-full rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-brand-primary transition-all duration-200 ${
                    index === activeIndex ? 'ring-2 ring-brand-primary' : 'opacity-60 hover:opacity-100'
                    } ${isRegenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isRegenerating}
                >
                    <img src={image.src} alt={image.title} className="w-full h-full object-cover" />
                </button>

                {isRegenerating ? (
                    <div className="absolute inset-0 bg-base-200 bg-opacity-70 rounded-lg flex items-center justify-center">
                        <SpinnerIcon className="w-8 h-8 text-white" />
                    </div>
                ) : (
                    <button
                        onClick={() => onRegenerate(image.id)}
                        className="absolute top-1 right-1 bg-black bg-opacity-50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-75 focus:opacity-100 z-10"
                        aria-label={`Regenerate ${image.title}`}
                        title={`Regenerate ${image.title}`}
                    >
                        <RegenerateIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
};