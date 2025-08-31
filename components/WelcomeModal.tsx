import React from 'react';

interface WelcomeModalProps {
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-base-200 p-8 rounded-2xl shadow-2xl w-full max-w-lg text-center relative">
        <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
          Welcome to AI Wardrobe!
        </h2>
        <p className="text-text-secondary mb-6">
          Ready to revolutionize your style? Here's how it works:
        </p>
        <ol className="text-left space-y-3 mb-8 text-text-primary">
          <li className="flex items-start">
            <span className="bg-brand-primary text-white rounded-full w-6 h-6 text-sm font-bold flex items-center justify-center mr-3 flex-shrink-0">1</span>
            Upload a clear, full-body photo of yourself.
          </li>
          <li className="flex items-start">
            <span className="bg-brand-primary text-white rounded-full w-6 h-6 text-sm font-bold flex items-center justify-center mr-3 flex-shrink-0">2</span>
            Upload an image of a clothing item you want to try on.
          </li>
          <li className="flex items-start">
            <span className="bg-brand-primary text-white rounded-full w-6 h-6 text-sm font-bold flex items-center justify-center mr-3 flex-shrink-0">3</span>
            (Optional) Add creative directives for pose, lighting, or background.
          </li>
          <li className="flex items-start">
            <span className="bg-brand-primary text-white rounded-full w-6 h-6 text-sm font-bold flex items-center justify-center mr-3 flex-shrink-0">4</span>
            Click Generate and watch the magic happen!
          </li>
        </ol>
        <button
          onClick={onClose}
          className="px-8 py-3 bg-brand-primary text-white font-bold text-lg rounded-lg shadow-lg hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105"
        >
          Let's Get Started
        </button>
      </div>
    </div>
  );
};
