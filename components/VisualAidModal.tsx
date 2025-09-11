import React, { useEffect } from 'react';
import { XMarkIcon } from './icons';

interface VisualAidModalProps {
  imageUrl: string;
  description: string;
  onClose: () => void;
}

const VisualAidModal: React.FC<VisualAidModalProps> = ({ imageUrl, description, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="visual-aid-title"
    >
      <div
        className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <h2 id="visual-aid-title" className="text-lg font-bold text-slate-800 dark:text-white">
                Visual Example
            </h2>
            <button
                onClick={onClose}
                aria-label="Close visual example"
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
                <XMarkIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
            </button>
        </header>
        <div className="p-4 overflow-auto flex-grow flex items-center justify-center">
             <img src={imageUrl} alt={description} className="max-w-full max-h-full object-contain rounded-md" />
        </div>
        <footer className="p-4 text-center text-sm text-slate-500 dark:text-slate-400 flex-shrink-0 border-t border-slate-200 dark:border-slate-700">
            <p>{description}</p>
        </footer>
      </div>
    </div>
  );
};

export default VisualAidModal;
