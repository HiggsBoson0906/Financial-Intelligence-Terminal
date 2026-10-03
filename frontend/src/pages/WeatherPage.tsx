import React from 'react';
import type { WeatherDisruption } from '../types';
import { WeatherIntelligencePanel } from '../components/weather/WeatherIntelligencePanel';

interface WeatherPageProps {
  weatherData: WeatherDisruption;
  onSelectAsset: (symbol: string) => void;
}

export const WeatherPage: React.FC<WeatherPageProps> = ({ weatherData, onSelectAsset }) => {
  return (
    <div className="p-4 space-y-4 max-w-[1600px] mx-auto">
      <WeatherIntelligencePanel weatherData={weatherData} onSelectAsset={onSelectAsset} />
    </div>
  );
};
