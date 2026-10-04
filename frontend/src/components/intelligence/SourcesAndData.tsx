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
  const dataSources = data?.data_sources || allSources.filter(s => s.category === 'dataset' || s.category === 'api');
  const webSources = data?.web_sources || allSources.filter(s => s.category === 'article' || s.category === 'historical_event');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 flex flex-col min-h-[400px]">
      <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] mb-4">
        <h2 className="text-[18px] font-bold text-[#0F172A] uppercase tracking-wider">
          Sources & Data
        </h2>
        <div className="flex bg-[#F1F5F9] rounded-lg p-1">
          <button
            onClick={() => setActiveTab('DATASETS')}
            className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'DATASETS'
                ? 'bg-white text-[#0F172A] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Database className="w-4 h-4" />
            Datasets & APIs
          </button>
          <button
            onClick={() => setActiveTab('WEB')}
            className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'WEB'
                ? 'bg-white text-[#0F172A] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Globe className="w-4 h-4" />
            Web Sources
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'DATASETS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dataSources.length > 0 ? dataSources.map((source, idx) => (
              <div key={idx} className="p-4 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-[#0F172A] text-[14px]">{source.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      source.status === 'used' ? 'bg-[#DCFCE7] text-[#16A34A]' :
                      source.status === 'fallback' ? 'bg-[#FEF3C7] text-[#D97706]' :
                      'bg-[#FEE2E2] text-[#DC2626]'
                    }`}>
                      {source.status}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#64748B] mb-2">{source.description || source.provider || 'External Data Source'}</p>
                </div>
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 text-[12px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 w-fit"
                  >
                    Open Source <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )) : (
              <div className="col-span-2 py-8 text-center text-[#64748B] text-[13px]">
                No structured datasets or API sources used in this analysis.
              </div>
            )}
          </div>
        )}

        {activeTab === 'WEB' && (
          <div className="flex flex-col gap-4">
            {webSources.length > 0 ? webSources.map((source, idx) => (
              <div key={idx} className="p-4 border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors group">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-[#0F172A] text-[14px] group-hover:text-[#2563EB] transition-colors">
                      {source.title || source.name}
                    </h3>
                    <div className="text-[12px] text-[#64748B] mt-1 flex items-center gap-2">
                      <span className="font-medium text-[#475569]">{source.provider || new URL(source.url).hostname.replace('www.', '')}</span>
                      {source.category === 'historical_event' && (
                        <>
                          <span>•</span>
                          <span className="text-[#D97706] bg-[#FEF3C7] px-1.5 rounded text-[10px] font-bold uppercase">Web Source</span>
                        </>
                      )}
                    </div>
                    {source.description && (
                      <p className="text-[12px] text-[#64748B] mt-2 line-clamp-2">{source.description}</p>
                    )}
                  </div>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 p-2 text-[#94A3B8] hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors shrink-0"
                      title="Open Article"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-[#64748B] text-[13px]">
                No external web sources or citations were required for this analysis.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
