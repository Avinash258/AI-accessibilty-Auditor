import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { AccessibilityReport, DownloadFormat } from './types';
import { analyzeUrlAccessibility, analyzeHtmlAccessibility, findPossibleUrls } from './services/geminiService';
import { exportAllAsJson, exportAllAsHtml, exportAllAsCsv, exportAllAsPdf, exportAllAsWord } from './services/reportExporter';
import Header from './components/Header';
import UrlInputForm from './components/UrlInputForm';
import HtmlInputForm from './components/HtmlInputForm';
import CrawlInputForm from './components/CrawlInputForm';
import ReportDisplay from './components/ReportDisplay';
import Loader from './components/Loader';
import ComplianceReference from './components/ComplianceReference';
import AuditRulesGuide from './components/AuditRulesGuide';
import { ErrorIcon, BookOpenIcon, CheckCircleIcon, CubeTransparentIcon, ArrowDownTrayIcon, ChevronDownIcon, ListBulletIcon } from './components/icons';

type InputMode = 'url' | 'html' | 'crawl';
type DiscoveredUrl = { url: string; selected: boolean };

const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [inputMode, setInputMode] = useState<InputMode>('url');
  const [reports, setReports] = useState<AccessibilityReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCrawling, setIsCrawling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState<string>('Worldwide');
  const [compliance, setCompliance] = useState<string>('WCAG 2.1 AA');
  const [isReferenceOpen, setIsReferenceOpen] = useState<boolean>(false);
  const [isRulesGuideOpen, setIsRulesGuideOpen] = useState<boolean>(false);
  const [discoveredUrls, setDiscoveredUrls] = useState<DiscoveredUrl[]>([]);
  const [isBulkDownloadMenuOpen, setIsBulkDownloadMenuOpen] = useState(false);
  const bulkDownloadMenuRef = useRef<HTMLDivElement>(null);


  const regions: { [key: string]: string } = {
    'Worldwide': 'WCAG 2.1 AA',
    'United States': 'ADA',
    'European Union': 'EAA',
  };

  const complianceStandards: string[] = ['WCAG 2.1 AA', 'ADA', 'Section 508', 'EAA'];

  useEffect(() => {
    setCompliance(regions[region] || 'WCAG 2.1 AA');
  }, [region]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (bulkDownloadMenuRef.current && !bulkDownloadMenuRef.current.contains(event.target as Node)) {
            setIsBulkDownloadMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const resetState = () => {
      setError(null);
      setReports([]);
      setDiscoveredUrls([]);
  }

  const handleScan = useCallback(async () => {
    resetState();
    setIsLoading(true);

    try {
      let apiResult: AccessibilityReport;
      if (inputMode === 'url') {
        if (!url.trim()) {
          setError('Please enter a valid URL.');
          setIsLoading(false);
          return;
        }
        apiResult = await analyzeUrlAccessibility(url, compliance);
      } else { // html mode
        if (!htmlContent.trim()) {
          setError('Please paste HTML content to analyze.');
          setIsLoading(false);
          return;
        }
        apiResult = await analyzeHtmlAccessibility(htmlContent, compliance);
      }
      
      const finalReport: AccessibilityReport = {
        ...apiResult,
        timestamp: new Date().toISOString()
      };
      setReports([finalReport]);

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate report. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [url, htmlContent, inputMode, compliance]);

  const handleCrawl = useCallback(async (baseUrl: string) => {
      resetState();
      if (!baseUrl.trim()) {
        setError('Please enter a valid URL to crawl.');
        return;
      }
      setIsCrawling(true);
      try {
        const urls = await findPossibleUrls(baseUrl);
        setDiscoveredUrls(urls.map(u => ({ url: u, selected: true })));
      } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(`Failed to find pages. ${errorMessage}`);
      } finally {
          setIsCrawling(false);
      }
  }, []);

  const handleBulkScan = useCallback(async () => {
    const urlsToScan = discoveredUrls.filter(u => u.selected).map(u => u.url);
    if (urlsToScan.length === 0) {
        setError("Please select at least one URL to analyze.");
        return;
    }
    setError(null);
    setReports([]);
    setIsLoading(true);

    try {
        const promises = urlsToScan.map(scanUrl => analyzeUrlAccessibility(scanUrl, compliance));
        const results = await Promise.all(promises);
        const finalReports: AccessibilityReport[] = results.map(res => ({ ...res, timestamp: new Date().toISOString() }));
        setReports(finalReports);
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(`Failed to generate all reports. ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  }, [discoveredUrls, compliance]);

  const handleBulkDownload = useCallback((format: DownloadFormat) => {
    setIsBulkDownloadMenuOpen(false);
    if (reports.length === 0) return;

    switch (format) {
        case 'json':
            exportAllAsJson(reports);
            break;
        case 'html':
            exportAllAsHtml(reports);
            break;
        case 'csv':
            exportAllAsCsv(reports);
            break;
        case 'pdf':
            exportAllAsPdf(reports);
            break;
        case 'word':
            exportAllAsWord(reports);
            break;
        default:
            console.error('Unknown download format:', format);
    }
  }, [reports]);

  const downloadOptions: { format: DownloadFormat, label: string }[] = [
    { format: 'json', label: 'JSON' },
    { format: 'html', label: 'HTML' },
    { format: 'csv', label: 'CSV (Excel)' },
    { format: 'pdf', label: 'PDF' },
    { format: 'word', label: 'Word (DOCX)' },
  ];

  const handleDiscoveredUrlSelection = (index: number) => {
      const newUrls = [...discoveredUrls];
      newUrls[index].selected = !newUrls[index].selected;
      setDiscoveredUrls(newUrls);
  };
  
  const handleSelectAll = (select: boolean) => {
    setDiscoveredUrls(discoveredUrls.map(u => ({ ...u, selected: select })));
  };

  const TabButton: React.FC<{
    label: string;
    mode: InputMode;
    currentMode: InputMode;
    setMode: (mode: InputMode) => void;
  }> = ({ label, mode, currentMode, setMode }) => {
    const isActive = mode === currentMode;
    const isDisabled = isLoading || isCrawling;
    return (
      <button
        onClick={() => {
            setMode(mode);
            resetState();
        }}
        role="tab"
        aria-selected={isActive}
        disabled={isDisabled}
        className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2 dark:focus:ring-offset-dark-bg disabled:cursor-not-allowed disabled:opacity-50 ${
          isActive
            ? 'bg-white dark:bg-dark-card text-brand-primary border-b-2 border-brand-primary'
            : 'bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        {label}
      </button>
    );
  };
  
  const allSelected = discoveredUrls.length > 0 && discoveredUrls.every(u => u.selected);
  const noneSelected = discoveredUrls.length > 0 && discoveredUrls.every(u => !u.selected);
  const selectedCount = discoveredUrls.filter(u => u.selected).length;

  return (
    <div className="min-h-screen font-sans text-slate-800 dark:text-slate-200">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-slate-600 dark:text-slate-400 mb-2 text-lg">
            Choose an analysis method. URL and HTML analysis perform single-page audits. Crawl mode finds and audits multiple pages from a single domain.
          </p>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-6 text-sm">
            Select a region to set a default compliance standard, or choose one manually.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="region-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Region</label>
              <select
                id="region-select"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                disabled={isLoading || isCrawling}
                className="w-full px-4 py-3 bg-light-bg dark:bg-dark-bg text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition duration-200"
              >
                {Object.keys(regions).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="compliance-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Compliance Standard</label>
              <select
                id="compliance-select"
                value={compliance}
                onChange={(e) => setCompliance(e.target.value)}
                disabled={isLoading || isCrawling}
                className="w-full px-4 py-3 bg-light-bg dark:bg-dark-bg text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition duration-200"
              >
                {complianceStandards.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
            <button
              onClick={() => setIsReferenceOpen(true)}
              disabled={isLoading || isCrawling}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-secondary hover:text-brand-primary dark:hover:text-blue-400 disabled:opacity-50 transition-colors"
              aria-haspopup="dialog"
            >
              <BookOpenIcon className="w-5 h-5" />
              View Compliance Standards
            </button>
             <button
              onClick={() => setIsRulesGuideOpen(true)}
              disabled={isLoading || isCrawling}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-secondary hover:text-brand-primary dark:hover:text-blue-400 disabled:opacity-50 transition-colors"
              aria-haspopup="dialog"
            >
              <ListBulletIcon className="w-5 h-5" />
              View All Audit Rules
            </button>
          </div>

          <div className="border-b border-slate-300 dark:border-slate-700 mb-[-1px]" role="tablist" aria-label="Analysis Input Method">
            <TabButton label="Analyze by URL" mode="url" currentMode={inputMode} setMode={setInputMode} />
            <TabButton label="Analyze by HTML" mode="html" currentMode={inputMode} setMode={setInputMode} />
            <TabButton label="Crawl & Audit Site" mode="crawl" currentMode={inputMode} setMode={setInputMode} />
          </div>

          {inputMode === 'url' ? (
            <UrlInputForm
              url={url}
              setUrl={setUrl}
              onScan={handleScan}
              isLoading={isLoading}
            />
          ) : inputMode === 'html' ? (
            <HtmlInputForm
              htmlContent={htmlContent}
              setHtmlContent={setHtmlContent}
              onScan={handleScan}
              isLoading={isLoading}
            />
          ) : ( // Crawl mode
            <div className="bg-white dark:bg-dark-card p-4 rounded-b-xl rounded-tr-xl shadow-lg">
                <CrawlInputForm onCrawl={handleCrawl} isLoading={isCrawling || isLoading} />
                {isCrawling && (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                        <CubeTransparentIcon className="w-16 h-16 text-brand-secondary animate-pulse" />
                        <p className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-300">
                           AI is discovering pages...
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                           This may take a moment.
                        </p>
                    </div>
                )}
                {discoveredUrls.length > 0 && !isCrawling && (
                    <div className="mt-6 animate-fade-in">
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Discovered Pages</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Select pages to include in the audit.</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleSelectAll(true)} disabled={allSelected} className="text-sm text-brand-secondary hover:underline disabled:opacity-50 disabled:no-underline">Select All</button>
                                <button onClick={() => handleSelectAll(false)} disabled={noneSelected} className="text-sm text-brand-secondary hover:underline disabled:opacity-50 disabled:no-underline">Deselect All</button>
                            </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-2 space-y-2 bg-light-bg dark:bg-dark-bg">
                            {discoveredUrls.map((item, index) => (
                                <label key={index} className="flex items-center p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={item.selected}
                                        onChange={() => handleDiscoveredUrlSelection(index)}
                                        className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-secondary"
                                    />
                                    <span className="ml-3 text-sm text-slate-700 dark:text-slate-300 break-all">{item.url}</span>
                                </label>
                            ))}
                        </div>
                         <button
                            onClick={handleBulkScan}
                            disabled={isLoading || selectedCount === 0}
                            className="w-full mt-4 flex items-center justify-center px-6 py-3.5 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary focus:ring-offset-white dark:focus:ring-offset-dark-card disabled:bg-slate-400 disabled:dark:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 ease-in-out"
                          >
                            {isLoading ? 'Scanning...' : `Analyze ${selectedCount} Selected Page(s)`}
                        </button>
                    </div>
                )}
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative flex items-center" role="alert">
              <ErrorIcon className="w-6 h-6 mr-3" />
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {isLoading && <Loader />}

          {reports.length > 0 && !isLoading && (
            <div className="mt-8">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                  <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                      {reports.length > 1 ? `Audit Reports (${reports.length})` : 'Audit Report'}
                  </h2>
                  {reports.length > 1 && (
                      <div className="relative" ref={bulkDownloadMenuRef}>
                          <button
                              onClick={() => setIsBulkDownloadMenuOpen(prev => !prev)}
                              className="inline-flex items-center gap-2 self-start sm:self-center px-4 py-2 text-sm font-semibold text-brand-secondary hover:text-brand-primary dark:hover:text-blue-400 transition-colors border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                              aria-haspopup="true"
                              aria-expanded={isBulkDownloadMenuOpen}
                              aria-label="Download all reports options"
                          >
                              <ArrowDownTrayIcon className="w-5 h-5" />
                              Download All Reports
                              <ChevronDownIcon className={`w-4 h-4 transition-transform ${isBulkDownloadMenuOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {isBulkDownloadMenuOpen && (
                              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-dark-card ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="bulk-options-menu">
                                      {downloadOptions.map(option => (
                                          <a
                                              key={option.format}
                                              href="#"
                                              onClick={(e) => { e.preventDefault(); handleBulkDownload(option.format); }}
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
                  )}
              </div>
              <div className="space-y-4">
                {reports.map((report, index) => (
                  <ReportDisplay key={report.timestamp} report={report} isInitiallyOpen={reports.length === 1 || index === 0} />
                ))}
              </div>
            </div>
          )}
          
          {!isLoading && reports.length === 0 && !error && (
             <div className="text-center mt-12 text-slate-500 dark:text-slate-400">
                <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                    <CheckCircleIcon className="w-16 h-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Ready to Scan</h2>
                    <p>Your accessibility report(s) will appear here once the scan is complete.</p>
                </div>
            </div>
          )}
        </div>
      </main>
      <footer className="text-center p-4 text-xs text-slate-500 dark:text-slate-600">
        <p>AI Accessibility Auditor &copy; 2024. This is a simulation and not a replacement for professional accessibility audits.</p>
      </footer>
      {isReferenceOpen && <ComplianceReference onClose={() => setIsReferenceOpen(false)} />}
      {isRulesGuideOpen && <AuditRulesGuide compliance={compliance} onClose={() => setIsRulesGuideOpen(false)} />}
    </div>
  );
};

export default App;