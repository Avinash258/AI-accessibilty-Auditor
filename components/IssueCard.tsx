import React from 'react';
import type { AccessibilityIssue } from '../types';
import { ImpactLevel } from '../types';
import CodeSnippet from './CodeSnippet';
import { CameraIcon } from './icons';

const impactStyles: { [key in ImpactLevel]: { badge: string; border: string; icon: string } } = {
  [ImpactLevel.Critical]: { badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', border: 'border-red-500', icon: '🔴' },
  [ImpactLevel.Serious]: { badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', border: 'border-orange-500', icon: '🟠' },
  [ImpactLevel.Moderate]: { badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', border: 'border-amber-500', icon: '🟡' },
  [ImpactLevel.Minor]: { badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', border: 'border-blue-500', icon: '🔵' },
  [ImpactLevel.Info]: { badge: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200', border: 'border-sky-500', icon: 'ℹ️' },
  [ImpactLevel.None]: { badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', border: 'border-green-500', icon: '✅' },
};


const IssueCard: React.FC<{ issue: AccessibilityIssue }> = ({ issue }) => {
  const styles = impactStyles[issue.impact] || impactStyles[ImpactLevel.Info];

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
        
        {issue.visualAidUrl && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <a
                    href={issue.visualAidUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-secondary hover:text-brand-primary dark:hover:text-blue-400 disabled:opacity-50 transition-colors border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                    <CameraIcon className="w-5 h-5" />
                    View Visual Example
                </a>
            </div>
        )}
      </div>
    </div>
  );
};

export default IssueCard;