import React from 'react';
import type { AiEventImpact, AiRecommendation } from '../types';
import { RecommendationPanel } from '../components/recommendations/RecommendationPanel';
import { AiIntelligencePanel } from '../components/intelligence/AiIntelligencePanel';

interface IntelligencePageProps {
  eventImpact: AiEventImpact;
  recommendation: AiRecommendation;
  onOpenAudit: () => void;
  onSelectAsset: (symbol: string) => void;
  onOpenWeather: () => void;
}

export const IntelligencePage: React.FC<IntelligencePageProps> = ({
  eventImpact,
  recommendation,
  onOpenAudit,
  onSelectAsset,
  onOpenWeather,
}) => {
  return (
    <div className="p-4 space-y-4 max-w-[1600px] mx-auto">
      <RecommendationPanel recommendation={recommendation} onOpenAudit={onOpenAudit} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AiIntelligencePanel
          eventImpact={eventImpact}
          onOpenWeatherDetail={onOpenWeather}
          onSelectAsset={onSelectAsset}
        />
      </div>
    </div>
  );
};
