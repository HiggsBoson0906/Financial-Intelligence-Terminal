import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`relative inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-200 
        ${isDark 
          ? 'bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-700 hover:text-amber-300' 
          : 'bg-slate-100/80 border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900'} 
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 
        ${isDark ? 'focus-visible:ring-offset-slate-900' : 'focus-visible:ring-offset-white'} 
        ${className}`}
    >
      <span className="sr-only">{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</span>
      <div className="relative w-4 h-4 flex items-center justify-center">
        <Sun 
          className={`w-4 h-4 transition-all duration-300 transform ${
            isDark ? 'scale-0 rotate-90 opacity-0 absolute' : 'scale-100 rotate-0 opacity-100'
          }`} 
        />
        <Moon 
          className={`w-4 h-4 transition-all duration-300 transform ${
            isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0 absolute'
          }`} 
        />
      </div>
    </button>
  );
};
