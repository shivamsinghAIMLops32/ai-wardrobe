import React from 'react';
import type { GeneratedImage } from '../types';
import { ModelViewer } from './ModelViewer';

interface ResultsDisplayProps {
  images: GeneratedImage[];
  onReset: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
  onRegenerate: (viewId: string) => void;
  regeneratingViews: Set<string>;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ images, onReset, showToast, onRegenerate, regeneratingViews }) => {

  if (images.length === 0) {
      return (
        <div className="text-center animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Generation Failed</h2>
            <p className="text-text-secondary mb-6">We couldn't generate any images. Please try again with different photos.</p>
            <button
                onClick={onReset}
                className="px-6 py-3 bg-brand-primary text-white font-bold rounded-lg shadow-lg hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-opacity-50 transition-colors duration-300"
            >
                Try Again
            </button>
        </div>
      )
  }

  return (
    <div className="w-full flex flex-col items-center animate-fade-in">
      <h2 className="text-3xl font-bold mb-2 text-center">Your Virtual Try-On Results</h2>
      <p className="text-text-secondary mb-8 text-center max-w-lg">
        Select a view below. Not perfect? Hover over a thumbnail and click the icon to regenerate it.
      </p>
      
      <ModelViewer 
        images={images} 
        showToast={showToast} 
        onRegenerate={onRegenerate} 
        regeneratingViews={regeneratingViews} 
      />

      <button
        onClick={onReset}
        className="mt-8 px-8 py-4 bg-brand-primary text-white font-bold text-lg rounded-lg shadow-lg hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-opacity-50 transition-colors duration-300 transform hover:scale-105"
      >
        Try Another Outfit
      </button>
    </div>
  );
};