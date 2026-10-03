import React, { useEffect, useRef } from 'react';
import { MarketTicker } from '../../types';
import { animateCounter } from '../../utils/animeUtils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiStripProps {
  tickers: MarketTicker[];
  onSelectTicker?: (ticker: MarketTicker) => void;
}

export const KpiStrip: React.FC<KpiStripProps> = ({ tickers, onSelectTicker }) => {
  const valueRefs = useRef<{ [key: string]: HTMLSpanElement | null }>({});

  useEffect(() => {
    tickers.forEach((ticker) => {
      const el = valueRefs.current[ticker.symbol];
      if (el) {
        const decimals = ticker.symbol.includes('TREASURY') || ticker.symbol.includes('VIX') || ticker.symbol.includes('INR') ? 3 : 2;
        animateCounter(el, ticker.value * 0.995, ticker.value, 1200, '', '', decimals);
      }
    });
  }, [tickers]);

  const renderSparkline = (data: number[], isPositive: boolean) => {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 60;
    const height = 20;

    const points = data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${x},${y}`;
      })
      .join(' ');

    const color = isPositive ? '#10b981' : '#f43f5e';

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 select-none">
      {tickers.map((ticker) => {
        const isPositive = ticker.change >= 0;
        return (
          <div
            key={ticker.symbol}
            onClick={() => onSelectTicker?.(ticker)}
            className="terminal-card p-2.5 rounded cursor-pointer hover:border-[#00f0ff]/40 transition-all group"
          >
            <div className="flex items-center justify-between text-[11px] font-mono-data text-slate-400 mb-1">
              <span className="font-bold text-slate-200 group-hover:text-[#00f0ff] transition-colors truncate">
                {ticker.symbol}
              </span>
              <span className="text-[9px] text-slate-500 uppercase">{ticker.category}</span>
            </div>

            <div className="flex items-baseline justify-between gap-1 mb-1">
              <span
                ref={(el) => {
                  valueRefs.current[ticker.symbol] = el;
                }}
                className="text-sm font-bold font-mono-data text-slate-100 tracking-tight"
              >
                {ticker.value.toFixed(2)}
              </span>

              <div
                className={`flex items-center gap-0.5 text-[11px] font-mono-data font-semibold ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>
                  {isPositive ? '+' : ''}
                  {ticker.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Sparkline & Range */}
            <div className="flex items-center justify-between pt-1 border-t border-[#171b29]">
              <div className="text-[9px] font-mono-data text-slate-500">
                L: {ticker.low} H: {ticker.high}
              </div>
              <div>{renderSparkline(ticker.sparkline, isPositive)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
