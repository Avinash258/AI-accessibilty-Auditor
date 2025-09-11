import React, { useState } from 'react';
import type { AccessibilityIssue } from '../types';
import { ImpactLevel } from '../types';
import CodeSnippet from './CodeSnippet';
import { CameraIcon, SparklesIcon, ExclamationCircleIcon } from './icons';
import { getFixSuggestion } from '../services/geminiService';
import type { FixSuggestion } from '../services/geminiService';

const impactStyles: { [key in ImpactLevel]: { badge: string; border: string; icon: string } } = {
  [ImpactLevel.Critical]: { badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', border: 'border-red-500', icon: '🔴' },
  [ImpactLevel.Serious]: { badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', border: 'border-orange-500', icon: '🟠' },
  [ImpactLevel.Moderate]: { badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', border: 'border-amber-500', icon: '🟡' },
  [ImpactLevel.Minor]: { badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', border: 'border-blue-500', icon: '🔵' },
  [ImpactLevel.Info]: { badge: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200', border: 'border-sky-500', icon: 'ℹ️' },
  [ImpactLevel.None]: { badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', border: 'border-green-500', icon: '✅' },
};


const IssueCard: React.FC<{ 
  issue: AccessibilityIssue,
  onShowVisualAid?: (url: string, description: string) => void
}> = ({ issue, onShowVisualAid }) => {
  const styles = impactStyles[issue.impact] || impactStyles[ImpactLevel.Info];
  const [suggestion, setSuggestion] = useState<FixSuggestion | null>(null);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState<boolean>(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const handleGetSuggestion = async () => {
      if (!issue.htmlElementSnippet) {
          setSuggestionError("Cannot generate suggestion without an HTML snippet.");
          return;
      }
      setIsSuggestionLoading(true);
      setSuggestionError(null);
      setSuggestion(null);

      try {
          const result = await getFixSuggestion(issue);
          setSuggestion(result);
      } catch (e) {
          console.error(e);
          const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
          setSuggestionError(`Failed to get AI suggestion. ${errorMessage}`);
      } finally {
          setIsSuggestionLoading(false);
      }
  };

  const hasSnippet = issue.htmlElementSnippet && issue.htmlElementSnippet.trim() !== '';

  return (
    <div className={`border-l-4 ${styles.border} bg-slate-50 dark:bg-dark-card rounded-r-lg shadow-sm`}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2 sm:mb-0">
            {issue.description}
          </h3>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${styles.badge}`}>
              {issue.impact}
            </span>
          </div>
        </div>

        <p className="text-slate-600 dark:text-slate-400 mb-4">{issue.help}</p>

        {issue.htmlElementSnippet && (
            <div className="my-4">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Element Snippet</p>
                <CodeSnippet code={issue.htmlElementSnippet} />
            </div>
        )}

        <div className="text-sm">
          <a
            href={issue.helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-secondary hover:underline"
          >
            Learn more about "{issue.id}" &rarr;
          </a>
        </div>
        
        {issue.visualAidUrl && onShowVisualAid && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => onShowVisualAid(issue.visualAidUrl!, issue.description)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-secondary hover:text-brand-primary dark:hover:text-blue-400 disabled:opacity-50 transition-colors border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                    <CameraIcon className="w-5 h-5" />
                    View Generic Example
                </button>
            </div>
        )}
      </div>
      
      {hasSnippet && (issue.impact !== ImpactLevel.None && issue.impact !== ImpactLevel.Info) && (
        <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-700">
          <div className="pt-4">
            {!suggestion && !isSuggestionLoading && !suggestionError && (
                <button
                    onClick={handleGetSuggestion}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-primary hover:text-blue-800 dark:text-brand-secondary dark:hover:text-blue-300 transition-colors bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg"
                >
                    <SparklesIcon className="w-5 h-5" />
                    Get AI Fix & Visualization
                </button>
            )}

            {isSuggestionLoading && (
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <svg className="animate-spin h-5 w-5 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Generating suggestion... This may take a few moments.</span>
                </div>
            )}
            
            {suggestionError && (
                <div className="text-red-700 dark:text-red-500 flex items-center gap-2">
                    <ExclamationCircleIcon className="w-5 h-5" />
                    <span>{suggestionError}</span>
                    <button onClick={handleGetSuggestion} className="ml-2 text-sm underline font-semibold">Retry</button>
                </div>
            )}

            {suggestion && (
                <div className="space-y-6 animate-fade-in">
                    <div>
                        <h4 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">Code Suggestion</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Before</p>
                                <CodeSnippet code={issue.htmlElementSnippet!} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">After (Suggested Fix)</p>
                                <CodeSnippet code={suggestion.suggestedCode} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">Visual Context</h4>
                        <div className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg inline-block bg-white dark:bg-dark-bg">
                            <img src={suggestion.imageUrl} alt={suggestion.imageCaption} className="rounded-md max-w-sm w-full" />
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 italic">{suggestion.imageCaption}</p>
                    </div>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueCard;
