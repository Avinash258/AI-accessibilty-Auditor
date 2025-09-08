
import React from 'react';
import { ShieldCheckIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-dark-card shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center space-x-3">
          <ShieldCheckIcon className="w-10 h-10 text-brand-secondary" />
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
            AI Accessibility Auditor
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
