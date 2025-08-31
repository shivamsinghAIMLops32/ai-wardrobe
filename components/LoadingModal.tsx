
import React, { useState, useEffect } from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';

const loadingMessages = [
  "Warming up the AI stylist...",
  "Stitching pixels together...",
  "Perfecting the fit and lighting...",
  "Tailoring your virtual look...",
  "Almost ready for the runway...",
  "This can take a moment, thank you for your patience."
];

export const LoadingModal: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50">
      <div className="bg-base-200 p-8 rounded-2xl shadow-2xl flex flex-col items-center w-full max-w-sm">
        <SpinnerIcon className="w-16 h-16 text-brand-primary mb-6" />
        <h2 className="text-2xl font-bold mb-2 text-text-primary">Generating Your Look...</h2>
        <p className="text-text-secondary text-center transition-opacity duration-500">
          {loadingMessages[messageIndex]}
        </p>
      </div>
    </div>
  );
};
