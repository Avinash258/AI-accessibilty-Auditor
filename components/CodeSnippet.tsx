
import React from 'react';

const CodeSnippet: React.FC<{ code: string }> = ({ code }) => {
  // A simple regex-based highlighter. Not a full parser, but good for aesthetics.
  // It's safer because we escape the original string first, then inject our own safe <span> tags.
  const highlightedCode = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    // Highlight tag names (e.g., <div)
    .replace(/(&lt;\/?)(\w+)/g, '$1<span class="text-pink-500">$2</span>')
    // Highlight attribute names (e.g., class=)
    .replace(/(\s+[\w-]+)=/g, ' <span class="text-sky-400">$1</span>=')
    // Highlight attribute values (e.g., "...")
    .replace(/(".*?")/g, '<span class="text-emerald-400">$1</span>');

  return (
    <pre className="bg-slate-200 dark:bg-slate-900 p-3 rounded-lg text-sm text-slate-800 dark:text-slate-200 overflow-x-auto font-mono">
      <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
    </pre>
  );
};

export default CodeSnippet;
