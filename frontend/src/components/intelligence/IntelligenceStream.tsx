import React, { useState } from 'react';
import { SlidersHorizontal, ArrowRight, BarChart2, FileText, Landmark, Flame } from 'lucide-react';

export interface StreamEvent {
  id: string;
  time: string;
  category: 'WEATHER' | 'MARKET' | 'NEWS' | 'MACRO' | 'ENERGY';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  iconType: 'storm' | 'chart' | 'news' | 'macro' | 'energy';
}

export const mockStreamEvents: StreamEvent[] = [
  {
    id: 'stream-1',
    time: '12:42',
    category: 'WEATHER',
    severity: 'HIGH',
    title: 'Gulf storm upgraded to Category 4',
    description: 'Trajectory shifted closer to key Gulf energy infrastructure.',
    iconType: 'storm',
  },
  {
    id: 'stream-2',
    time: '12:39',
    category: 'MARKET',
    severity: 'MEDIUM',
    title: 'WTI rises +2.8%',
    description: 'Supply disruption concerns drive energy prices higher.',
    iconType: 'chart',
  },
  {
    id: 'stream-3',
    time: '12:37',
    category: 'NEWS',
    severity: 'MEDIUM',
    title: 'Market sentiment -0.72',
    description: 'Increased recession and supply risk in latest headlines.',
    iconType: 'news',
  },
  {
    id: 'stream-4',
    time: '12:31',
    category: 'MACRO',
    severity: 'LOW',
    title: 'Fed signals caution',
    description: 'Inflation remains elevated, rate cut expectations lower.',
    iconType: 'macro',
  },
  {
    id: 'stream-5',
    time: '12:28',
    category: 'ENERGY',
    severity: 'MEDIUM',
    title: 'Refinery utilization at risk',
    description: 'Several Gulf Coast refineries in potential path.',
    iconType: 'energy',
  },
];

interface IntelligenceStreamProps {
  onSelectEvent?: (event: StreamEvent) => void;
}

export const IntelligenceStream: React.FC<IntelligenceStreamProps> = ({ onSelectEvent }) => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Weather' | 'Markets' | 'News' | 'Macro'>('All');

  const filterTabs = ['All', 'Weather', 'Markets', 'News', 'Macro'] as const;

  const renderIcon = (type: StreamEvent['iconType']) => {
    switch (type) {
      case 'storm':
        return (
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" className="transition-all duration-200 group-hover:brightness-110 group-hover:scale-[1.03]">
              <circle cx="12" cy="12" r="3" fill="#2563EB" stroke="none" />
              <path d="M12 6C15.3137 6 18 8.68629 18 12" strokeOpacity="0.8"/>
              <path d="M12 18C8.68629 18 6 15.3137 6 12" strokeOpacity="0.8"/>
              <path d="M12 2C17.5228 2 22 6.47715 22 12" strokeOpacity="0.3"/>
              <path d="M12 22C6.47715 22 2 17.5228 2 12" strokeOpacity="0.3"/>
            </svg>
          </div>
        );
      case 'chart':
        return (
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" className="transition-all duration-200 group-hover:brightness-110 group-hover:scale-[1.03]">
              <path d="M3 14l5-5 4 4 9-9" />
              <path d="M21 4v5h-5" />
              <path d="M3 18h18" strokeOpacity="0.2" strokeDasharray="2 2" />
            </svg>
          </div>
        );
      case 'news':
        return (
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" className="transition-all duration-200 group-hover:brightness-110 group-hover:scale-[1.03]">
              <rect x="4" y="4" width="16" height="16" strokeOpacity="0.4" />
              <path d="M8 9h8" />
              <path d="M8 13h5" />
              <rect x="4" y="4" width="8" height="8" fill="#334155" stroke="none" />
            </svg>
          </div>
        );
      case 'macro':
        return (
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" className="transition-all duration-200 group-hover:brightness-110 group-hover:scale-[1.03]">
              <circle cx="12" cy="12" r="9" strokeOpacity="0.3" />
              <ellipse cx="12" cy="12" rx="4" ry="9" strokeOpacity="0.3" />
              <path d="M3 12h18" strokeOpacity="0.3" />
              <path d="M8 14l3-4 2 2 4-5" stroke="#4F46E5" strokeWidth="1.5" />
              <circle cx="17" cy="7" r="1.5" fill="#4F46E5" stroke="none" />
            </svg>
          </div>
        );
      case 'energy':
        return (
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" className="transition-all duration-200 group-hover:brightness-110 group-hover:scale-[1.03]">
              <polygon points="12 3 20 7.5 20 16.5 12 21 4 16.5 4 7.5" strokeOpacity="0.3" />
              <polygon points="12 7 16 9.5 16 14.5 12 17 8 14.5 8 9.5" />
              <circle cx="12" cy="12" r="1.5" fill="#D97706" stroke="none" />
            </svg>
          </div>
        );
    }
  };

  const renderBadge = (severity: StreamEvent['severity']) => {
    switch (severity) {
      case 'HIGH':
        return (
          <span className="text-[10px] font-bold text-[#DC2626] bg-[#FEE2E2] px-1.5 py-0.5 rounded">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="text-[10px] font-bold text-[#D97706] bg-[#FEF3C7] px-1.5 py-0.5 rounded">
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="text-[10px] font-bold text-[#16A34A] bg-[#DCFCE7] px-1.5 py-0.5 rounded">
            LOW
          </span>
        );
    }
  };

  const filteredEvents = mockStreamEvents.filter((item) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Weather') return item.category === 'WEATHER';
    if (activeFilter === 'Markets') return item.category === 'MARKET';
    if (activeFilter === 'News') return item.category === 'NEWS';
    if (activeFilter === 'Macro') return item.category === 'MACRO';
    return true;
  });

  return (
    <div className="fit-card p-6 flex flex-col justify-between h-full select-none">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] mb-1">
          <h2 className="text-[18px] font-semibold text-[#0F172A]">
            Intelligence Stream
          </h2>
          <button className="text-[#94A3B8] hover:text-[#475569] transition-colors">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 my-3 pb-1 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                activeFilter === tab
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Feed List */}
        <div className="mt-3">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              onClick={() => onSelectEvent?.(evt)}
              className="py-4 border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC] transition-colors cursor-pointer flex gap-4 items-start group -mx-2 px-2 rounded-lg relative"
            >
              {/* Subtle active indicator on hover */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-[#2563EB] transition-all duration-200 group-hover:h-8 rounded-r-full opacity-0 group-hover:opacity-100" />
              {renderIcon(evt.iconType)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[#94A3B8] font-mono-tech">{evt.time}</span>
                    <span className="text-[#2563EB] font-medium uppercase">{evt.category}</span>
                  </div>
                  {renderBadge(evt.severity)}
                </div>

                <div className="text-[14px] font-semibold text-[#0F172A] leading-snug group-hover:text-[#2563EB] transition-colors">
                  {evt.title}
                </div>

                <p className="text-[13px] text-[#64748B] leading-relaxed mt-1 line-clamp-2">
                  {evt.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Link */}
      <div className="pt-4 border-t border-[#F1F5F9] mt-3">
        <button className="text-[13px] font-medium text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1.5 transition-colors">
          <span>View all intelligence</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
