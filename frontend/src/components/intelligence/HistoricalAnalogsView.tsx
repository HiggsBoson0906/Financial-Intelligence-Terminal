import React, { useState } from 'react';
import { mockHistoricalAnalogs } from '../../data/mockEventImpactData';

export const HistoricalAnalogsView: React.FC<{
  isSimulation: boolean;
}> = ({ isSimulation }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="w-full h-full p-4 flex flex-col animate-in fade-in duration-200 overflow-y-auto">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-[15px] font-semibold text-[#0F172A] uppercase">Historical Analogs</h3>
        {isSimulation && (
          <span className="text-[10px] font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded uppercase tracking-wider">
            SIMULATION
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {mockHistoricalAnalogs.map((analog) => {
          const isExpanded = expandedId === analog.id;
          return (
            <div key={analog.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden transition-all duration-200">
              <div 
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(isExpanded ? null : analog.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-[13px] text-[#0F172A]">{analog.name}</h4>
                    <span className="text-[10px] text-gray-500 font-mono">{analog.date}</span>
                  </div>
                  <div className="text-[11px] text-gray-600">
                    <span className="mr-3">Similarity <span className="font-bold text-[#2563EB]">{analog.similarity}</span></span>
                    <span>Relevance <span className={`font-bold ${analog.portfolioRelevance === 'HIGH' ? 'text-red-600' : 'text-amber-600'}`}>{analog.portfolioRelevance}</span></span>
                  </div>
                </div>
                <div className="text-[12px] font-medium text-blue-600 flex items-center gap-1">
                  {isExpanded ? 'Hide Details' : 'View Event'}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <h5 className="text-[10px] font-bold text-gray-500 uppercase mb-1">Event</h5>
                       <div className="text-[12px] text-gray-800"><span className="font-semibold">Region:</span> {analog.region}</div>
                       <div className="text-[12px] text-gray-800"><span className="font-semibold">Severity:</span> {analog.severity}</div>
                     </div>
                     <div>
                       <h5 className="text-[10px] font-bold text-gray-500 uppercase mb-1">Market Response</h5>
                       <div className="text-[12px] text-gray-800">{analog.marketResponse}</div>
                     </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3 relative">
                    <div className="absolute top-0 left-4 bottom-0 w-px bg-blue-200"></div>
                    <div className="flex flex-col gap-3 pl-8 relative">
                      <div className="relative">
                        <div className="absolute top-1 -left-5 w-2 h-2 rounded-full bg-blue-500"></div>
                        <h6 className="text-[10px] font-bold text-blue-700 uppercase mb-0.5">Weather / Flood Characteristics</h6>
                        <p className="text-[11px] text-gray-600">{analog.details.weather}</p>
                      </div>
                      <div className="relative">
                        <div className="absolute top-1 -left-5 w-2 h-2 rounded-full bg-blue-500"></div>
                        <h6 className="text-[10px] font-bold text-blue-700 uppercase mb-0.5">News / Sentiment</h6>
                        <p className="text-[11px] text-gray-600">{analog.details.news}</p>
                      </div>
                      <div className="relative">
                        <div className="absolute top-1 -left-5 w-2 h-2 rounded-full bg-blue-500"></div>
                        <h6 className="text-[10px] font-bold text-blue-700 uppercase mb-0.5">Market Reaction</h6>
                        <p className="text-[11px] text-gray-600">{analog.details.market}</p>
                      </div>
                      <div className="relative">
                        <div className="absolute top-1 -left-5 w-2 h-2 rounded-full bg-blue-500"></div>
                        <h6 className="text-[10px] font-bold text-blue-700 uppercase mb-0.5">Portfolio Impact</h6>
                        <p className="text-[11px] text-gray-600 font-medium">{analog.details.impact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
