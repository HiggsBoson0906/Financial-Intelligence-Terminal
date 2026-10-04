import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { ActivePage } from '../../types';

interface TopNavProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  currentTime: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  activePage,
  setActivePage,
  currentTime,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navTabs: Array<{ id: string; label: string }> = [
    { id: 'home', label: 'HOME' },
    { id: 'news', label: 'NEWS' },
    { id: 'weather', label: 'WEATHER' },
    { id: 'portfolio', label: 'PORTFOLIO' },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'pt-2 pb-2 backdrop-blur-md bg-white/70 shadow-sm' : 'pt-4 pb-4 bg-transparent'}`}>
      <div className={`max-w-[1200px] mx-auto bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-between px-6 transition-all duration-300 ${isScrolled ? 'h-14 shadow-md' : 'h-16 shadow-sm'}`}>
        
        {/* Left: Brand */}
        <a href="/" className="flex items-center gap-3 cursor-pointer group">
          {/* Subtle pillar motif */}
          <div className="flex items-end gap-[3px] transition-transform duration-300 group-hover:-translate-y-0.5">
            <div className="w-1.5 h-3.5 bg-blue-300 rounded-sm"></div>
            <div className="w-1.5 h-6 bg-blue-900 rounded-sm"></div>
            <div className="w-1.5 h-4.5 bg-cyan-500 rounded-sm"></div>
          </div>
          <span className="text-[22px] font-extrabold tracking-tight text-[#0F172A] font-sans">
            PillerStreet
          </span>
        </a>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navTabs.map((tab) => {
            const isActive = activePage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActivePage(tab.id as ActivePage);
                }}
                className={`relative px-4 py-2 text-[12px] font-bold tracking-widest transition-all duration-200 rounded-lg overflow-hidden ${
                  isActive
                    ? 'text-blue-900 bg-blue-50'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-blue-600 rounded-t-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Clock & Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 font-mono-tech text-[11px] font-bold text-[#475569] bg-[#F8FAFC] px-3 py-1.5 rounded-md border border-[#F1F5F9] shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            {currentTime || '04 OCT 2026 | 05:34 IST'}
          </div>
          
          <button 
            className="md:hidden p-2 text-[#0F172A]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-4 right-4 mt-2 bg-white border border-[#E2E8F0] rounded-xl shadow-lg p-4 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
          {navTabs.map((tab) => {
            const isActive = activePage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActivePage(tab.id as ActivePage);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-4 py-3 text-[13px] font-bold tracking-widest text-left rounded-lg transition-colors ${
                  isActive
                    ? 'text-blue-900 bg-blue-50 border-l-4 border-blue-600'
                    : 'text-[#64748B] hover:bg-slate-50 border-l-4 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
