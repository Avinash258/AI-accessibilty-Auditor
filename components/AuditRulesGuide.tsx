import React, { useState, useEffect, useMemo } from 'react';
import type { AuditRule } from '../types';
import { getAuditRulesList } from '../services/geminiService';
import { ListBulletIcon, XMarkIcon, ErrorIcon } from './icons';

interface AuditRulesGuideProps {
  onClose: () => void;
  compliance: string;
}

const AuditRulesGuide: React.FC<AuditRulesGuideProps> = ({ onClose, compliance }) => {
  const [rules, setRules] = useState<AuditRule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    const fetchRules = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedRules = await getAuditRulesList(compliance);
        setRules(fetchedRules);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(`Failed to load audit rules. ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRules();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, compliance]);

  const filteredRules = useMemo(() => {
    if (!searchTerm) return rules;
    const lowercasedFilter = searchTerm.toLowerCase();
    return rules.filter(
      (rule) =>
        rule.id.toLowerCase().includes(lowercasedFilter) ||
        rule.description.toLowerCase().includes(lowercasedFilter) ||
        rule.importance.toLowerCase().includes(lowercasedFilter)
    );
  }, [rules, searchTerm]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-rules-title"
    >
      <div
        className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <ListBulletIcon className="w-7 h-7 text-brand-secondary" />
            <h2 id="audit-rules-title" className="text-xl font-bold text-slate-800 dark:text-white">
              Audit Rules ({compliance})
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close rules guide"
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
          </button>
        </header>

        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <input
              type="search"
              placeholder="Search rules by ID, description, or importance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-light-bg dark:bg-dark-bg text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition duration-200"
              aria-label="Search audit rules"
            />
        </div>

        <div className="overflow-y-auto p-6 space-y-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <svg className="animate-spin h-8 w-8 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 font-semibold">Loading audit rules...</p>
            </div>
          )}
          {error && (
             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative flex items-center" role="alert">
              <ErrorIcon className="w-6 h-6 mr-3" />
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {!isLoading && !error && (
            filteredRules.length > 0 ? (
                filteredRules.map((rule) => (
                    <div key={rule.id} className="bg-light-bg dark:bg-dark-bg border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 font-mono text-sm">{rule.id}</h4>
                        <p className="text-md text-slate-700 dark:text-slate-300 mt-1">{rule.description}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                           <span className="font-semibold">Why it matters:</span> {rule.importance}
                        </p>
                    </div>
                ))
            ) : (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">No rules found matching your search.</p>
            )
          )}
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

export default AuditRulesGuide;
