
import React from 'react';

interface HtmlInputFormProps {
  htmlContent: string;
  setHtmlContent: (html: string) => void;
  onScan: () => void;
  isLoading: boolean;
}

const HtmlInputForm: React.FC<HtmlInputFormProps> = ({ htmlContent, setHtmlContent, onScan, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onScan();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 bg-white dark:bg-dark-card p-4 rounded-b-xl rounded-tr-xl shadow-lg">
      <textarea
        value={htmlContent}
        onChange={(e) => setHtmlContent(e.target.value)}
        placeholder="Paste your page's full HTML source code here..."
        required
        className="flex-grow w-full px-4 py-3 bg-light-bg dark:bg-dark-bg text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition duration-200 h-64 font-mono text-sm"
        aria-label="HTML source code to scan"
        disabled={isLoading}
        spellCheck="false"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="w-full sm:w-auto flex items-center justify-center px-6 py-3.5 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary focus:ring-offset-white dark:focus:ring-offset-dark-card disabled:bg-slate-400 disabled:dark:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 ease-in-out"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Scanning...
          </>
        ) : (
          'Scan HTML'
        )}
      </button>
    </form>
  );
};

export default HtmlInputForm;
