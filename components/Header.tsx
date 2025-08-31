import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full max-w-6xl text-center mb-8 sm:mb-12">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-purple-400 to-indigo-400">
        AI Wardrobe
      </h1>
      <p className="mt-2 text-lg text-text-secondary">Your Personal AI Stylist</p>
    </header>
  );
};
