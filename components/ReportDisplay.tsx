import React, { useState, useRef, useEffect } from 'react';
import type { AccessibilityReport, DownloadFormat } from '../types';
import ReportSection from './ReportSection';
import { exportAsJson, exportAsHtml, exportAsCsv, exportAsPdf, exportAsWord } from '../services/reportExporter';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, ArrowDownTrayIcon, ChevronDownIcon } from './icons';

const ReportDisplay: React.FC<{ 
    report: AccessibilityReport, 
    isInitiallyOpen?: boolean,
    onShowVisualAid: (url: string, description: string) => void;
}> = ({ report, isInitiallyOpen = false, onShowVisualAid }) => {
    const { violations, incomplete, passes, url, timestamp } = report;
    const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
    const downloadMenuRef = useRef<HTMLDivElement>(null);

    const summary = [
        { count: violations.length, label: 'Violations', icon: <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />, color: 'red' },
        { count: incomplete.length, label: 'Needs Review', icon: <InformationCircleIcon className="w-8 h-8 text-amber-500" />, color: 'amber' },
        { count: passes.length, label: 'Passes', icon: <CheckCircleIcon className="w-8 h-8 text-green-500" />, color: 'green' },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
                setIsDownloadMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleDownload = (format: DownloadFormat) => {
        setIsDownloadMenuOpen(false);
        if (!report) return;

        switch (format) {
            case 'json':
                exportAsJson(report);
                break;
            case 'html':
                exportAsHtml(report);
                break;
            case 'csv':
                exportAsCsv(report);
                break;
            case 'pdf':
                exportAsPdf(report);
                break;
            case 'word':
                exportAsWord(report);
                break;
            default:
                console.error('Unknown download format:', format);
        }
    };

    const downloadOptions: { format: DownloadFormat, label: string }[] = [
        { format: 'json', label: 'JSON' },
        { format: 'html', label: 'HTML' },
        { format: 'csv', label: 'CSV (Excel)' },
        { format: 'pdf', label: 'PDF' },
        { format: 'word', label: 'Word (DOCX)' },
    ];

    return (
        <details className="bg-white dark:bg-dark-card shadow-lg rounded-xl overflow-hidden animate-fade-in" open={isInitiallyOpen}>
            <summary className="p-6 list-none cursor-pointer flex justify-between items-start group">
                <div className="flex-grow pr-4">
                     <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                        Audit for: <span className="text-brand-primary break-all">{url}</span>
                     </h3>
                     <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
                         <span><strong className={`font-bold ${violations.length > 0 ? 'text-red-600 dark:text-red-400' : ''}`}>{violations.length}</strong> Violations</span>
                         <span><strong className={`font-bold ${incomplete.length > 0 ? 'text-amber-600 dark:text-amber-400' : ''}`}>{incomplete.length}</strong> Needs Review</span>
                         <span><strong className="text-green-600 dark:text-green-400">{passes.length}</strong> Passes</span>
                     </div>
                </div>
                <div className="flex-shrink-0 pt-1">
                    <ChevronDownIcon className="w-6 h-6 text-slate-500 group-open:rotate-180 transition-transform duration-300" />
                </div>
            </summary>

            <div className="px-6 pb-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center my-6">
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                            Full URL: {url.startsWith('http') ? (
                                <a href={url} target="_blank" rel="noopener noreferrer" className="text-brand-secondary hover:underline break-all">{url}</a>
                            ) : (
                                <span className="break-all">{url}</span>
                            )}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Scanned on: {new Date(timestamp).toLocaleString()}
                        </p>
                    </div>
                    <div className="relative mt-4 sm:mt-0" ref={downloadMenuRef}>
                        <button
                            onClick={() => setIsDownloadMenuOpen(prev => !prev)}
                            className="inline-flex items-center gap-2 self-start sm:self-center px-4 py-2 text-sm font-semibold text-brand-secondary hover:text-brand-primary dark:hover:text-blue-400 transition-colors border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                            aria-haspopup="true"
                            aria-expanded={isDownloadMenuOpen}
                            aria-label="Download report options"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            Download Report
                            <ChevronDownIcon className={`w-4 h-4 transition-transform ${isDownloadMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isDownloadMenuOpen && (
                            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-dark-card ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                    {downloadOptions.map(option => (
                                        <a
                                            key={option.format}
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); handleDownload(option.format); }}
                                            className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                                            role="menuitem"
                                        >
                                            {option.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-8">
                    {summary.map(item => (
                        <div key={item.label} className={`p-4 rounded-lg bg-${item.color}-50 dark:bg-slate-800 border border-${item.color}-200 dark:border-${item.color}-700/50`}>
                            <div className="flex justify-center mb-2">{item.icon}</div>
                            <p className={`text-3xl font-bold text-${item.color}-600 dark:text-${item.color}-400`}>{item.count}</p>
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{item.label}</p>
                        </div>
                    ))}
                </div>

                <ReportSection title="Violations" issues={violations} defaultOpen={true} onShowVisualAid={onShowVisualAid} />
                <ReportSection title="Needs Review" issues={incomplete} onShowVisualAid={onShowVisualAid} />
                <ReportSection title="Passed Tests" issues={passes} />
            </div>
        </details>
    );
};

export default ReportDisplay;