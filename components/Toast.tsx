import React from 'react';
import type { ToastMessage } from '../types';

interface ToastProps extends Omit<ToastMessage, 'id'> {
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div
      className={`fixed bottom-5 right-5 ${bgColor} text-white py-3 px-6 rounded-lg shadow-xl animate-toast-in z-50`}
      role="alert"
    >
      <p>{message}</p>
    </div>
  );
};
