import React, { useState } from 'react';

export interface GlobalTickerItem {
  symbol: string;
  value: string;
  change: string;
  isPositive: boolean;
  sparkline: number[];
}

export const defaultTickers: GlobalTickerItem[] = [
  {
    symbol: 'S&P 500',
    value: '5,842.16',
    change: '+0.82%',
    isPositive: true,
    sparkline: [40, 42, 41, 44, 46, 45, 48, 52],
  },
  {
    symbol: 'NASDAQ',
    value: '18,432.21',
    change: '+1.14%',
    isPositive: true,
    sparkline: [30, 32, 35, 34, 38, 42, 45, 50],
  },
  {
    symbol: 'VIX',
    value: '16.42',
    change: '-4.21%',
    isPositive: false,
    sparkline: [50, 48, 46, 44, 42, 41, 38, 35],
  },
  {
    symbol: 'WTI',
    value: '80.42',
    change: '+2.80%',
    isPositive: true,
    sparkline: [35, 36, 38, 42, 45, 46, 49, 54],
  },
  {
    symbol: 'BRENT',
    value: '83.11',
    change: '+2.10%',
    isPositive: true,
    sparkline: [38, 39, 41, 43, 44, 46, 48, 51],
  },
  {
    symbol: 'GOLD',
    value: '2,347.20',
    change: '+0.40%',
    isPositive: true,
    sparkline: [45, 44, 46, 47, 46, 48, 49, 50],
  },
  {
    symbol: 'DXY',
    value: '104.21',
    change: '+0.20%',
    isPositive: true,
    sparkline: [42, 43, 42, 44, 45, 44, 45, 46],
  },
];

interface GlobalMarketTickerProps {
  tickers?: GlobalTickerItem[];
  onSelectTicker?: (symbol: string) => void;
}

export const GlobalMarketTicker: React.FC<GlobalMarketTickerProps> = ({
  tickers = defaultTickers,
  onSelectTicker,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(3); // Start with middle item

  const renderSparkline = (data: number[], isPositive: boolean, isSelected: boolean) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = isSelected ? 80 : 64;
    const height = isSelected ? 24 : 18;

    const points = data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${x},${y}`;
      })
      .join(' ');

    const strokeColor = isPositive ? '#16A34A' : '#DC2626';

    return (
      <svg width={width} height={height} className="overflow-visible shrink-0 transition-all duration-500">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth={isSelected ? "2" : "1.5"}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="w-full overflow-x-auto custom-scrollbar pb-6 pt-2 select-none">
      <div className="flex sm:justify-center items-center gap-4 min-w-max px-4">
        {tickers.map((t, idx) => {
          const isSelected = selectedIndex === idx;
          const dist = Math.abs(idx - selectedIndex);
          // Create an arc: center is highest (translateY 0), others are pushed down and scaled down
          const translateY = dist * 16;
          const scale = Math.max(1 - dist * 0.05, 0.85);
          const opacity = Math.max(1 - dist * 0.2, 0.5);

          return (
            <div
              key={t.symbol}
              onClick={() => {
                setSelectedIndex(idx);
                onSelectTicker?.(t.symbol);
              }}
              className={`relative overflow-hidden bg-white border rounded-xl shadow-sm transition-all duration-500 cursor-pointer group flex-shrink-0
                ${t.isPositive ? 'border-green-100' : 'border-red-100'}
                ${isSelected ? 'hover:border-blue-300 ring-2 ring-blue-500/20 shadow-md' : 'hover:border-slate-300'}
              `}
              style={{
                transform: `translateY(${translateY}px) scale(${scale})`,
                opacity: opacity,
                width: isSelected ? '200px' : '150px',
                padding: isSelected ? '16px' : '12px',
                zIndex: 10 - dist
              }}
            >
              {/* Subtle Grid Background */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
              
              <div className={`relative z-10 flex items-center justify-between text-[#64748B] font-bold tracking-widest mb-2 uppercase transition-all duration-500 ${isSelected ? 'text-[14px]' : 'text-[12px]'}`}>
                <div className="flex items-center gap-1.5">
                   <span className={`rounded-full transition-all duration-500 ${isSelected ? 'w-2 h-2 animate-pulse' : 'w-1.5 h-1.5'} ${t.isPositive ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]'}`} />
                   {t.symbol}
                </div>
              </div>
              
              <div className="relative z-10 mb-2">
                {renderSparkline(t.sparkline, t.isPositive, isSelected)}
              </div>

              <div className="relative z-10 flex items-baseline justify-between gap-2 mt-2 pt-2 border-t border-slate-100">
                <span className={`font-mono-tech font-bold text-[#0F172A] tracking-tight transition-all duration-500 ${isSelected ? 'text-[20px]' : 'text-[15px]'}`}>
                  {t.value}
                </span>
                <span
                  className={`font-mono-tech font-bold transition-all duration-500 ${isSelected ? 'text-[14px]' : 'text-[12px]'} ${
                    t.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {t.change}
                </span>
              </div>
              
              {/* Edge Glow */}
              <div className={`absolute bottom-0 left-0 h-[3px] w-full transition-opacity duration-500 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'} ${t.isPositive ? 'bg-gradient-to-r from-transparent via-green-500 to-transparent' : 'bg-gradient-to-r from-transparent via-red-500 to-transparent'}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

