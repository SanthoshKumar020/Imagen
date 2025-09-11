import React, { useState } from 'react';
import SettingsModal from './SettingsModal';

const LogoIcon: React.FC = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="url(#grad1)"/>
        <path d="M2 17l10 5 10-5" stroke="url(#grad2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12l10 5 10-5" stroke="url(#grad3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
            <linearGradient id="grad1" x1="12" y1="2" x2="12" y2="12">
                <stop offset="0%" stopColor="#3b82f6"/>
                <stop offset="100%" stopColor="#2563eb"/>
            </linearGradient>
            <linearGradient id="grad2" x1="2" y1="19.5" x2="22" y2="19.5">
                <stop offset="0%" stopColor="#a78bfa"/>
                <stop offset="100%" stopColor="#818cf8"/>
            </linearGradient>
             <linearGradient id="grad3" x1="2" y1="14.5" x2="22" y2="14.5">
                <stop offset="0%" stopColor="#60a5fa"/>
                <stop offset="100%" stopColor="#3b82f6"/>
            </linearGradient>
        </defs>
    </svg>
);

const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V15a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51-1z"></path>
    </svg>
);


const Header: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <LogoIcon />
            <h1 className="text-2xl font-bold text-white tracking-wider">
              AI Influencer <span className="text-blue-400">Studio</span>
            </h1>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Open settings"
          >
            <SettingsIcon />
          </button>
        </div>
      </header>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};

export default Header;