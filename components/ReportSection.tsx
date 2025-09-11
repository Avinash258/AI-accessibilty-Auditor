import React, { useState } from 'react';
import type { AccessibilityIssue } from '../types';
import IssueCard from './IssueCard';
import { ChevronDownIcon } from './icons';

interface ReportSectionProps {
  title: string;
  issues: AccessibilityIssue[];
  defaultOpen?: boolean;
  onShowVisualAid?: (url: string, description: string) => void;
}

const ReportSection: React.FC<ReportSectionProps> = ({ title, issues, defaultOpen = false, onShowVisualAid }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (issues.length === 0) {
    return null;
  }

  const getBackgroundColor = () => {
    if (title === 'Violations') return 'bg-red-50 dark:bg-red-900/20';
    if (title === 'Needs Review') return 'bg-amber-50 dark:bg-amber-900/20';
    if (title === 'Passed Tests') return 'bg-green-50 dark:bg-green-900/20';
    return 'bg-slate-50 dark:bg-slate-800';
  };

  const getTextColor = () => {
    if (title === 'Violations') return 'text-red-800 dark:text-red-200';
    if (title === 'Needs Review') return 'text-amber-800 dark:text-amber-200';
    if (title === 'Passed Tests') return 'text-green-800 dark:text-green-200';
    return 'text-slate-800 dark:text-slate-200';
  };
  
  const getBorderColor = () => {
    if (title === 'Violations') return 'border-red-200 dark:border-red-800/50';
    if (title === 'Needs Review') return 'border-amber-200 dark:border-amber-800/50';
    if (title === 'Passed Tests') return 'border-green-200 dark:border-green-800/50';
    return 'border-slate-200 dark:border-slate-700';
  }

  return (
    <div className={`mb-4 border ${getBorderColor()} rounded-lg overflow-hidden`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex justify-between items-center p-4 text-left font-bold text-xl ${getBackgroundColor()} ${getTextColor()}`}
        aria-expanded={isOpen}
      >
        <span>{title} ({issues.length})</span>
        <ChevronDownIcon
          className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="bg-white dark:bg-dark-card p-4">
          <div className="space-y-4">
            {issues.map((issue, index) => (
              <IssueCard key={`${issue.id}-${index}`} issue={issue} onShowVisualAid={onShowVisualAid} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportSection;