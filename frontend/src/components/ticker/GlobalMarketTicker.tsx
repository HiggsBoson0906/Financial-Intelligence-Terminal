import React from 'react';

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
  const renderSparkline = (data: number[], isPositive: boolean) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 64;
    const height = 18;

    const points = data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${x},${y}`;
      })
      .join(' ');

    const strokeColor = isPositive ? '#16A34A' : '#DC2626';

    return (
      <svg width={width} height={height} className="overflow-visible shrink-0">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 select-none">
      {tickers.map((t) => (
        <div
          key={t.symbol}
          onClick={() => onSelectTicker?.(t.symbol)}
          className="bg-white border border-[#F1F5F9] rounded-xl p-3 shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-[12px] text-[#64748B] font-medium mb-1.5">
            <span>{t.symbol}</span>
            {renderSparkline(t.sparkline, t.isPositive)}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="tabular-data font-semibold text-[15px] text-[#0F172A] tracking-tight">
              {t.value}
            </span>
            <span
              className={`tabular-data text-[12px] font-medium ${
                t.isPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'
              }`}
            >
              {t.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

