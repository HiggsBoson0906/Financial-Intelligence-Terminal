import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HistoricalAnalogsSectionProps {
  onSelectAnalog?: (name: string) => void;
  onViewAll?: () => void;
}

export const HistoricalAnalogsSection: React.FC<HistoricalAnalogsSectionProps> = ({
  onSelectAnalog,
  onViewAll,
}) => {
  const analogs = [
    {
      name: 'Hurricane Harvey',
      year: '2017',
      similarity: '91%',
      isHighSim: true,
      wtiReaction: '+6.4%',
      energyImpact: 'High',
      impactColor: 'text-[#DC2626]',
    },
    {
      name: 'Hurricane Ida',
      year: '2021',
      similarity: '84%',
      isHighSim: true,
      wtiReaction: '+5.8%',
      energyImpact: 'High',
      impactColor: 'text-[#DC2626]',
    },
    {
      name: 'Hurricane Ian',
      year: '2022',
      similarity: '77%',
      isHighSim: false,
      wtiReaction: '+4.1%',
      energyImpact: 'Medium',
      impactColor: 'text-[#D97706]',
    },
  ];

  return (
    <div className="fit-card p-6 select-none h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
        <h2 className="text-[21px] font-bold text-[#0F172A]">
          Historical Analogs
        </h2>
        <button
          onClick={onViewAll}
          className="text-[11px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-0.5 transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 3 Analog Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {analogs.map((a) => (
          <div
            key={a.name}
            onClick={() => onSelectAnalog?.(a.name)}
            className="p-1 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              {/* Satellite hurricane radar graphic thumbnail */}
              <div className="w-full h-14 rounded bg-[#0F172A] relative overflow-hidden flex items-center justify-center mb-2 shadow-2xs group-hover:opacity-90 transition-opacity">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="opacity-90">
                  <path d="M12 6a6 6 0 0 1 5.66 4M12 18a6 6 0 0 1-5.66-4M6.34 10A6 6 0 0 1 12 6M17.66 14A6 6 0 0 1 12 18" />
                  <circle cx="12" cy="12" r="2" fill="#38BDF8" />
                </svg>
              </div>

              <div className="text-[14px] font-semibold text-[#0F172A] leading-tight truncate">
                {a.name}
              </div>
              <div className="text-[12px] text-[#94A3B8] tabular-data mt-0.5">{a.year}</div>
            </div>

            <div className="mt-2.5 pt-1.5 border-t border-[#F1F5F9] space-y-1.5 tabular-data text-[13px] text-[#64748B]">
              <div className="flex justify-between">
                <span>Similarity</span>
                <span className={`font-semibold ${a.isHighSim ? 'text-[#16A34A]' : 'text-[#2563EB]'}`}>
                  {a.similarity}
                </span>
              </div>
              <div className="flex justify-between">
                <span>WTI Reaction</span>
                <span className="font-semibold text-[#16A34A]">{a.wtiReaction}</span>
              </div>
              <div className="flex justify-between">
                <span>Energy Impact</span>
                <span className={`font-semibold ${a.impactColor}`}>{a.energyImpact}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
