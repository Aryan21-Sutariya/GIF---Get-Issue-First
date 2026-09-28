import React, { useState, useRef, useEffect } from 'react';
import { Puzzle, ExternalLink } from 'lucide-react';
import Button from './Button';

const ExtensionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const storeUrl = import.meta.env.VITE_EXTENSION_STORE_URL;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOpenStore = () => {
    if (storeUrl) {
      window.open(storeUrl, '_blank', 'noopener,noreferrer');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Extension info text"
      >
        <Puzzle className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 z-50 overflow-hidden text-left origin-top-right">
          <div className="p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <Puzzle className="h-4 w-4 text-purple-500" />
              GIF Browser Extension
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              Get GIF notifications directly from your Chrome toolbar.
            </p>
            
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 mb-5 list-disc pl-4 marker:text-purple-400">
              <li>See new issue notifications from Chrome</li>
              <li>Check unread notifications quickly</li>
              <li>Open issues directly in GIF</li>
            </ul>

            {storeUrl ? (
              <Button 
                variant="primary" 
                className="w-full justify-center flex items-center gap-2 focus:ring-purple-500 outline-none"
                onClick={handleOpenStore}
              >
                Get GIF Extension <ExternalLink className="h-3 w-3" />
              </Button>
            ) : (
              <button 
                disabled 
                className="w-full py-2 px-4 rounded-lg bg-slate-100 text-slate-500 text-xs font-medium dark:bg-slate-800 dark:text-slate-400 cursor-not-allowed border-none focus:outline-none focus:ring-0"
              >
                Chrome Web Store link coming soon
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtensionButton;
