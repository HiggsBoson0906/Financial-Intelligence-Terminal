import React, { useState } from 'react';
import { QueryResponse, SourceLink } from '../../types/api';
import { ExternalLink, Database, Globe } from 'lucide-react';

interface SourcesAndDataProps {
  data?: QueryResponse | null;
}

export const SourcesAndData: React.FC<SourcesAndDataProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'DATASETS' | 'WEB'>('DATASETS');

  // Fallback to checking `data.evidence` or just use the new `sources` field
  const allSources: SourceLink[] = data?.sources || [];
  
  // Also collect data_sources and web_sources if they are separated
  const usedSources = allSources.filter(s => s.status === 'used' || s.status === 'fallback');
  const dataSources = (data?.data_sources || usedSources).filter(s => (s.category === 'dataset' || s.category === 'api') && (s.status === 'used' || s.status === 'fallback'));
  const webSources = (data?.web_sources || usedSources).filter(s => (s.category === 'article' || s.category === 'historical_event') && (s.status === 'used' || s.status === 'fallback'));

  return (
    <div className="bg-white dark:bg-[#111827] rounded-xl shadow-sm border border-[#E2E8F0] dark:border-[#1F2937] p-6 flex flex-col min-h-[400px]">
      <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] dark:border-[#1F2937] mb-4">
        <h2 className="text-[18px] font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider">
          Evidence & Sources
        </h2>
        <div className="flex bg-[#F1F5F9] dark:bg-[#1E293B] rounded-lg p-1">
          <button
            onClick={() => setActiveTab('DATASETS')}
            className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'DATASETS'
                ? 'bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] shadow-sm'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <Database className="w-4 h-4" />
            Datasets & APIs
          </button>
          <button
            onClick={() => setActiveTab('WEB')}
            className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'WEB'
                ? 'bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] shadow-sm'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <Globe className="w-4 h-4" />
            Web Sources
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'DATASETS' && (
          <div className="flex flex-col">
            {dataSources.length > 0 ? dataSources.map((source, idx) => (
              <div key={idx} className="py-4 border-b border-[#F1F5F9] dark:border-[#1F2937] last:border-b-0 flex flex-col gap-1 group">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-[14px]">{source.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8]">
                    USED
                  </span>
                </div>
                <p className="text-[14px] font-['Times_New_Roman',_Times,_serif] text-[#0F172A] dark:text-[#CBD5E1] mt-1">{source.description || source.provider || 'External Data Source'}</p>
                {source.url && (
                  <div className="mt-2">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold tracking-widest text-[#2563EB] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-700 dark:hover:text-blue-300 rounded transition-all duration-200 group w-fit uppercase"
                    >
                      VIEW SOURCE
                      <ExternalLink className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                )}
              </div>
            )) : (
              <div className="py-8 text-center text-[#64748B] dark:text-[#94A3B8] text-[13px]">
                No structured datasets or API sources used in this analysis.
              </div>
            )}
          </div>
        )}

        {activeTab === 'WEB' && (
          <div className="flex flex-col">
            {webSources.length > 0 ? webSources.map((source, idx) => (
              <div key={idx} className="py-4 border-b border-[#F1F5F9] dark:border-[#1F2937] last:border-b-0 group">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest mb-1">
                      {source.provider || new URL(source.url || 'https://unknown').hostname.replace('www.', '')}
                    </div>
                    <h3 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-[14px] group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors leading-snug">
                      {source.title || source.name}
                    </h3>
                    {source.description && (
                      <p className="text-[14px] font-['Times_New_Roman',_Times,_serif] text-[#0F172A] dark:text-[#CBD5E1] mt-1.5 line-clamp-2 leading-relaxed">{source.description}</p>
                    )}
                    {source.url && (
                      <div className="mt-3">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold tracking-widest text-[#2563EB] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-700 dark:hover:text-blue-300 rounded transition-all duration-200 group uppercase"
                        >
                          VIEW SOURCE
                          <ExternalLink className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-[#64748B] dark:text-[#94A3B8] text-[13px]">
                No external web sources or citations were required for this analysis.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
