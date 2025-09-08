
import React, { useEffect } from 'react';
import { complianceData } from '../data/complianceData';
import { BookOpenIcon, XMarkIcon } from './icons';

interface ComplianceReferenceProps {
  onClose: () => void;
}

const ComplianceReference: React.FC<ComplianceReferenceProps> = ({ onClose }) => {
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
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in" 
      onClick={onClose}
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="compliance-reference-title"
    >
      <div 
        className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <BookOpenIcon className="w-7 h-7 text-brand-secondary" />
            <h2 id="compliance-reference-title" className="text-xl font-bold text-slate-800 dark:text-white">
              Compliance Standards Reference
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close reference"
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
          </button>
        </header>
        
        <div className="overflow-y-auto p-6 space-y-8">
          {Object.entries(complianceData).map(([key, standard]) => (
            <section key={key} aria-labelledby={`standard-heading-${key.replace(/\s/g, '-')}`}>
              <h3 id={`standard-heading-${key.replace(/\s/g, '-')}`} className="text-2xl font-semibold text-brand-primary mb-2">{standard.name}</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">{standard.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {standard.principles.map(principle => (
                  <div key={principle.title} className="bg-light-bg dark:bg-dark-bg border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">{principle.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{principle.summary}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <a href={standard.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand-secondary hover:underline">
                  Read full standard for {standard.name.split(' (')[0]} &rarr;
                </a>
              </div>
            </section>
          ))}
        </div>
        
        <footer className="p-4 border-t border-slate-200 dark:border-slate-700 text-center flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary focus:ring-offset-white dark:focus:ring-offset-dark-card"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ComplianceReference;
