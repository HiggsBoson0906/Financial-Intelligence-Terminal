import React, { useState, useEffect, useRef } from 'react';
import { MarketSeries, MARKET_DATA_MODE } from '../../services/marketApi';
import { getInitialDemoMarketData, getNextDemoMarketTick } from '../../data/mockMarketStream';

export const MarketView: React.FC<{
  selectedAsset: string | null;
  onSelectAsset: (asset: string) => void;
  isSimulation: boolean;
}> = ({ selectedAsset, onSelectAsset, isSimulation }) => {
  const activeAsset = selectedAsset || 'WTI';
  const availableAssets = ['WTI', 'BRENT', 'XOM', 'CVX'];
  const [timeRange, setTimeRange] = useState('1D');
  const [marketData, setMarketData] = useState<MarketSeries | null>(null);
  const [error, setError] = useState(false);
  
  // Ref for the line path to animate it
  const pathRef = useRef<SVGPathElement>(null);

  // Initialize and stream data
  useEffect(() => {
    let isActive = true;
    let timer: number;

    const loadData = async () => {
      try {
        setError(false);
        if (MARKET_DATA_MODE === 'demo') {
          const initialData = getInitialDemoMarketData(activeAsset, timeRange);
          if (isActive) setMarketData(initialData);

          // Start the live stream simulation
          timer = window.setInterval(() => {
            if (isActive) {
              const nextTick = getNextDemoMarketTick(activeAsset, timeRange);
              setMarketData(nextTick);
            }
          }, 3000); // 3 seconds per tick
        } else {
          // Future backend connection
          // const liveData = await fetchLiveMarketData(activeAsset, timeRange);
          // if (isActive) setMarketData(liveData);
        }
      } catch (err) {
        if (isActive) setError(true);
      }
    };

    loadData();

    return () => {
      isActive = false;
      if (timer) clearInterval(timer);
    };
  }, [activeAsset, timeRange]);

  // Generate SVG path from points
  const generateChartPath = (points: { price: number }[]) => {
    if (!points || points.length === 0) return { d: '', currentY: 50 };
    
    // Auto-scale y-axis
    const prices = points.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const padding = (maxPrice - minPrice) * 0.1 || 1;
    const yMin = minPrice - padding;
    const yMax = maxPrice + padding;
    const yRange = yMax - yMin;
    
    // Scale X to fit 400px width, Y to 100px height
    const getX = (index: number) => (index / (points.length - 1)) * 400;
    const getY = (price: number) => 100 - ((price - yMin) / yRange) * 100;

    let d = `M ${getX(0)},${getY(points[0].price)}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${getX(i)},${getY(points[i].price)}`;
    }
    return { d, currentY: getY(prices[prices.length - 1]) };
  };

  const chartData = marketData ? generateChartPath(marketData.points) : { d: '', currentY: 50 };
  const isPositive = marketData ? marketData.changePercent >= 0 : true;
  const color = isPositive ? '#16A34A' : '#DC2626';

  return (
    <div className="w-full h-full p-4 flex flex-col animate-in fade-in duration-200">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-[15px] font-semibold text-[#0F172A] uppercase">Market Impact</h3>
          {MARKET_DATA_MODE === 'demo' ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded text-slate-500 text-[10px] font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              DEMO STREAM
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 rounded text-green-700 text-[10px] font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              LIVE MARKET DATA
            </div>
          )}
        </div>
        
        {isSimulation && (
          <span className="text-[10px] font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded uppercase tracking-wider">
            SIMULATION
          </span>
        )}
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          {availableAssets.map(asset => (
            <button
              key={asset}
              onClick={() => onSelectAsset(asset)}
              className={`px-3 py-1.5 rounded border text-[12px] font-semibold transition-colors ${
                activeAsset === asset ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {asset}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {['1D', '1W', '1M', '3M', '1Y'].map(tf => (
            <button 
              key={tf} 
              onClick={() => setTimeRange(tf)}
              className={`text-[11px] font-medium px-2 py-1 rounded transition-colors ${timeRange === tf ? 'bg-[#2563EB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 border border-gray-100 rounded-lg bg-white p-4 pr-16 flex flex-col relative mb-4 shadow-sm">
        {error ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/50 backdrop-blur-sm z-20">
             <div className="text-[13px] font-medium text-gray-500 mb-2">Market data unavailable</div>
             <button onClick={() => setError(false)} className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">Retry</button>
           </div>
        ) : !marketData ? (
           <div className="absolute inset-0 flex items-center justify-center bg-white z-20">
             <div className="text-[12px] text-gray-400 font-medium">Loading market data...</div>
           </div>
        ) : null}

        <div className="flex-1 relative w-full h-full">
          {/* Chart SVG */}
          <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 400 100" className="overflow-visible">
             {/* Subtle Grid Lines */}
             <line x1="0" y1="25" x2="400" y2="25" stroke="#F1F5F9" strokeWidth="1" />
             <line x1="0" y1="50" x2="400" y2="50" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4" />
             <line x1="0" y1="75" x2="400" y2="75" stroke="#F1F5F9" strokeWidth="1" />
             
             {/* The Data Line */}
             <path 
               ref={pathRef}
               d={chartData.d} 
               fill="none" 
               stroke={color} 
               strokeWidth="2"
               strokeLinejoin="round"
               className="transition-all duration-700 ease-in-out"
             />
             
             {/* Event Marker */}
             <line x1="200" y1="0" x2="200" y2="100" stroke="#94A3B8" strokeWidth="1" strokeDasharray="4" />
             <circle cx="200" cy={chartData.d ? 50 : -10} r="4" fill="#3B82F6" className="transition-all duration-700" />
             <text x="200" y="15" fontSize="10" fill="#64748B" fontWeight="600" textAnchor="middle">Flood</text>
             
             {/* Latest Point Indicator */}
             {chartData.d && (
               <circle 
                 cx="400" 
                 cy={chartData.currentY} 
                 r="3" 
                 fill={color} 
                 className="transition-all duration-700 ease-in-out shadow-sm"
               />
             )}
          </svg>
          
          {/* Current Price Floating Label */}
          {marketData && (
            <div 
              className="absolute right-[-50px] w-[50px] flex flex-col items-start transition-all duration-700 ease-in-out" 
              style={{ top: `calc(${chartData.currentY}% - 16px)` }}
            >
              <div className="text-[12px] font-bold text-[#0F172A] tabular-nums">${marketData.currentPrice.toFixed(2)}</div>
              <div className={`text-[10px] font-semibold tabular-nums ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{marketData.changePercent.toFixed(2)}%
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 bg-gray-50 rounded-lg p-3 border border-gray-100 mt-auto">
        <div>
          <div className="text-[10px] text-gray-500 mb-1 font-semibold uppercase">{activeAsset} Price</div>
          <div className="text-[14px] font-bold text-gray-900 tabular-nums">
            {marketData ? `$${marketData.currentPrice.toFixed(2)}` : '---'}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 mb-1 font-semibold uppercase">Change</div>
          <div className={`text-[14px] font-bold tabular-nums transition-colors duration-300 ${!marketData ? 'text-gray-900' : isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {marketData ? `${isPositive ? '+' : ''}${marketData.changePercent.toFixed(2)}%` : '---'}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 mb-1 font-semibold uppercase">Event Sensitivity</div>
          {marketData ? (
            <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded inline-block ${marketData.sensitivity === 'HIGH' ? 'bg-red-100 text-red-700' : marketData.sensitivity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
              {marketData.sensitivity}
            </div>
          ) : (
            <div className="text-[10px] font-bold text-gray-400">---</div>
          )}
        </div>
        <div>
          <div className="text-[10px] text-gray-500 mb-1 font-semibold uppercase">Estimated Impact</div>
          <div className="text-[14px] font-bold text-[#D97706]">{marketData ? marketData.estimatedImpact : '---'}</div>
          <div className="text-[8px] text-[#D97706] font-semibold mt-0.5">SIMULATION</div>
        </div>
      </div>
    </div>
  );
};
