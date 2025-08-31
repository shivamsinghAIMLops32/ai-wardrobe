import React from 'react';
import type { BackgroundSource } from '../types';

interface BackgroundSelectorProps {
  selected: BackgroundSource;
  onSelect: (source: BackgroundSource) => void;
}

const options: { id: BackgroundSource; label: string }[] = [
  { id: 'auto', label: 'AI Generated' },
  { id: 'user', label: 'My Background' },
  { id: 'clothing', label: 'Clothing Bkg.' },
];

export const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="flex items-center justify-center space-x-2 bg-base-200 p-1.5 rounded-full">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={`px-4 py-2 text-sm sm:text-base sm:px-6 rounded-full font-semibold transition-colors duration-300 focus:outline-none ${
            selected === option.id
              ? 'bg-brand-primary text-white shadow'
              : 'bg-transparent text-text-secondary hover:bg-base-300'
          }`}
          aria-pressed={selected === option.id}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
