import React from 'react';
import type { PortfolioMetric, SectorExposure, RiskHeatmapItem } from '../types';
import { PortfolioRiskSection } from '../components/portfolio/PortfolioRiskSection';

interface PortfolioPageProps {
  metrics: PortfolioMetric;
  sectors: SectorExposure[];
  heatmap: RiskHeatmapItem[];
  onSelectAsset: (symbol: string) => void;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({
  metrics,
  sectors,
  heatmap,
  onSelectAsset,
}) => {
  return (
    <div className="p-4 space-y-4 max-w-[1600px] mx-auto font-mono-data">
      <PortfolioRiskSection
        metrics={metrics}
        sectors={sectors}
        heatmap={heatmap}
        onSelectAsset={onSelectAsset}
      />
    </div>
  );
};
