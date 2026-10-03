import React from 'react';
import { Bell } from 'lucide-react';
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
  const navTabs: Array<{ id: ActivePage; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'markets', label: 'Markets' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'intelligence', label: 'Intelligence' },
    { id: 'risk', label: 'Risk' },
    { id: 'events', label: 'Events' },
    { id: 'weather', label: 'Weather' },
    { id: 'agents', label: 'Agents' },
    { id: 'reports', label: 'Reports' },
  ];

  return (
    <header className="bg-white border-b border-[#F1F5F9] px-6 h-16 flex items-center justify-between select-none">
      {/* Left: Logo & Navigation Links */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight text-[#0F172A]">
            FIT
          </span>
          <div className="text-[11px] leading-tight text-[#64748B] font-medium border-l border-[#F1F5F9] pl-3">
            <div>Financial</div>
            <div>Intelligence Terminal</div>
          </div>
        </div>

        {/* Horizontal Navigation Links */}
        <nav className="flex items-center gap-7 text-[13px] font-medium">
          {navTabs.map((tab) => {
            const isActive = activePage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePage(tab.id)}
                className={`py-4 transition-colors relative ${
                  isActive
                    ? 'text-[#2563EB]'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2563EB]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right: Notification, User, Market Status, Clock */}
      <div className="flex items-center gap-4 text-xs text-[#0F172A]">
        <button className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-full transition-colors relative">
          <Bell className="w-4 h-4" />
        </button>

        <div className="w-7 h-7 rounded-full bg-[#E2E8F0] text-[#475569] font-semibold flex items-center justify-center text-xs">
          A
        </div>

        <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#475569] pl-3 border-l border-[#F1F5F9]">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] inline-block" />
          <span>Market Open</span>
        </div>

        <div className="font-mono-tech text-[12px] text-[#64748B]">
          {currentTime || '12:43:08 EST'}
        </div>
      </div>
    </header>
  );
};
