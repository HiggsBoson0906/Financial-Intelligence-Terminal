import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, CloudLightning, AlertTriangle, Info, Map as MapIcon, ShieldAlert } from 'lucide-react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const maptilerKey = import.meta.env.VITE_MAPTILER_API_KEY;
const MAP_STYLE = maptilerKey 
  ? `https://api.maptiler.com/maps/bright/style.json?key=${maptilerKey}`
  : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

export const WeatherPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const fetchWeather = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/api/v1/events/weather');
      if (!res.ok) throw new Error('Failed to fetch live weather data');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  // Initialize MapLibre Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || isLoading) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: [78.9629, 20.5937], // Center of India
      zoom: 4,
      attributionControl: false
    });

    mapRef.current.on('load', () => {
      // Data loaded
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isLoading]);

  // Determine threat level for background
  const hasAlerts = data?.alerts && data.alerts.length > 0;
  
  const numWarnings = data?.alerts?.filter((a: any) => a.event.includes('Warning')).length || 0;
  const numWatches = data?.alerts?.filter((a: any) => a.event.includes('Watch')).length || 0;
  const numAdvisories = data?.alerts?.filter((a: any) => a.event.includes('Advisory')).length || 0;

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#F8FAFC] font-sans animate-in fade-in duration-700">
      
      {/* SKY BLUE ATMOSPHERIC HERO */}
      <div className="relative w-full overflow-hidden bg-gradient-to-b from-sky-300 to-sky-100 text-[#0F172A] pb-24 pt-8 px-6 border-b border-[#E2E8F0]">
        
        {/* Cloud Visual Elements */}
        <div className="absolute top-[-50px] right-[-50px] opacity-60 pointer-events-none animate-[pulse-subtle_8s_ease-in-out_infinite]">
          <svg width="400" height="300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white w-96 h-96 drop-shadow-xl">
            <path d="M17.5 19a4.5 4.5 0 0 0 2.9-7.9c-.3-4.2-3.8-7.1-7.9-7.1-3.6 0-6.7 2.4-7.6 5.8A4.5 4.5 0 0 0 5.5 19h12z" fill="#ffffff" stroke="none" />
          </svg>
        </div>
        <div className="absolute top-10 left-10 opacity-40 pointer-events-none animate-[pulse-subtle_12s_ease-in-out_infinite]">
          <svg width="200" height="150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white w-48 h-48 drop-shadow-md">
            <path d="M17.5 19a4.5 4.5 0 0 0 2.9-7.9c-.3-4.2-3.8-7.1-7.9-7.1-3.6 0-6.7 2.4-7.6 5.8A4.5 4.5 0 0 0 5.5 19h12z" fill="#ffffff" stroke="none" />
          </svg>
        </div>
        
        <div className="relative z-10 max-w-[1600px] mx-auto flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center border bg-white/40 text-blue-700 border-white/50 shadow-sm backdrop-blur-md">
              <CloudLightning className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-[32px] font-bold tracking-widest text-[#0F172A] leading-none mb-2 shadow-sm drop-shadow-sm">
                WEATHER INTELLIGENCE
              </h1>
              <div className="text-[12px] font-mono-tech text-blue-900/80 uppercase tracking-widest flex items-center gap-3 bg-white/30 px-3 py-1 rounded inline-flex border border-white/40 backdrop-blur-md">
                <span>INDIA</span>
                <span>•</span>
                <span>{hasAlerts ? 'ACTIVE WEATHER' : 'CLEAR CONDITIONS'}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={fetchWeather}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/40 hover:bg-white/60 border border-white/50 text-[#0F172A] rounded font-mono-tech text-[11px] disabled:opacity-50 uppercase tracking-widest transition-colors backdrop-blur-md shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'SYNCING...' : 'SYNC FEED'}
          </button>
        </div>
      </div>

      {/* LIGHT CONTENT PANELS (Overlapping Hero) */}
      <div className="relative z-20 px-6 max-w-[1600px] mx-auto -mt-14 pb-12">
        
        {/* API Failure State */}
        {error && !data && (
          <div className="w-full p-8 flex flex-col items-center justify-center border border-red-200 bg-red-50 rounded-xl shadow-md">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4 animate-pulse" />
            <h3 className="font-bold text-[#0F172A] text-[18px] tracking-widest mb-2">WEATHER FEED TEMPORARILY UNAVAILABLE</h3>
            <p className="text-[13px] text-[#475569] max-w-md text-center">{error}</p>
            <button onClick={fetchWeather} className="mt-6 px-6 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-[12px] font-bold rounded tracking-widest transition-colors">
              RETRY CONNECTION
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !data && !error && (
          <div className="w-full h-[400px] bg-white rounded-xl shadow-md border border-[#E2E8F0] flex flex-col items-center justify-center">
            <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <div className="text-[12px] text-[#64748B] font-mono-tech tracking-widest uppercase animate-pulse">Establishing Data Uplink...</div>
          </div>
        )}

        {/* Main Content */}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Command Center Metrics & Map */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              
              {/* Telemetry Strip */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm">
                  <div className="text-[10px] text-[#64748B] font-bold tracking-widest uppercase mb-1">Active Warnings</div>
                  <div className="text-[32px] font-mono-tech text-red-600 leading-none">{numWarnings}</div>
                </div>
                <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm">
                  <div className="text-[10px] text-[#64748B] font-bold tracking-widest uppercase mb-1">Active Watches</div>
                  <div className="text-[32px] font-mono-tech text-amber-500 leading-none">{numWatches}</div>
                </div>
                <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm">
                  <div className="text-[10px] text-[#64748B] font-bold tracking-widest uppercase mb-1">Advisories</div>
                  <div className="text-[32px] font-mono-tech text-blue-600 leading-none">{numAdvisories}</div>
                </div>
                <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm">
                  <div className="text-[10px] text-[#64748B] font-bold tracking-widest uppercase mb-1">Total Alerts</div>
                  <div className="text-[32px] font-mono-tech text-[#0F172A] leading-none">{data.alerts?.length || 0}</div>
                </div>
              </div>

              {/* Map Visualizer */}
              <div className="w-full h-[500px] bg-[#E2E8F0] rounded-xl border border-[#CBD5E1] relative overflow-hidden flex flex-col shadow-inner">
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded border border-[#E2E8F0] shadow-sm">
                  <MapIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-[11px] font-bold tracking-widest text-[#0F172A] uppercase">INDIA WEATHER MAP</span>
                </div>
                {/* Map Container */}
                <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
                
                {/* Subtle Scanning overlay effect for light theme */}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(59,130,246,0.05)_50%,transparent_100%)] h-[20%] animate-[scan_4s_ease-in-out_infinite] pointer-events-none" />
              </div>
            </div>

            {/* Right Column: Threat Feed */}
            <div className="lg:col-span-4 flex flex-col mt-[88px]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E2E8F0]">
                <h3 className="text-[12px] font-bold tracking-widest text-[#0F172A] uppercase">ACTIVE THREATS</h3>
                <span className="text-[10px] bg-[#F1F5F9] px-2 py-0.5 rounded text-[#475569] font-mono-tech border border-[#E2E8F0]">{data.alerts?.length || 0} TOTAL</span>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[600px] custom-scrollbar">
                {hasAlerts ? (
                  data.alerts.map((alert: any, idx: number) => {
                    const isSevere = alert.severity === 'Severe' || alert.severity === 'Extreme';
                    const color = isSevere ? 'red' : alert.severity === 'Moderate' ? 'amber' : 'blue';
                    return (
                      <div key={idx} className={`bg-white border border-${color}-200 rounded-lg p-5 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
                        <div className={`absolute top-0 left-0 w-1 h-full bg-${color}-500`} />
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-[10px] font-bold text-${color}-700 uppercase tracking-widest`}>{alert.event}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase bg-${color}-50 text-${color}-700 border border-${color}-200`}>
                            {alert.severity}
                          </span>
                        </div>
                        <h4 className="font-bold text-[14px] text-[#0F172A] leading-snug mb-3">{alert.headline}</h4>
                        <div className="text-[11px] text-[#64748B] font-mono-tech space-y-1.5 pt-3 border-t border-[#F1F5F9]">
                          <div className="flex justify-between">
                            <span>EFFECTIVE:</span>
                            <span className="text-[#0F172A] font-medium">{new Date(alert.effective).toLocaleTimeString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>EXPIRES:</span>
                            <span className="text-[#0F172A] font-medium">{new Date(alert.expires).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center px-6 bg-white border border-[#E2E8F0] rounded-xl shadow-sm">
                    <CloudLightning className="w-10 h-10 text-blue-200 mb-3" />
                    <h4 className="text-[13px] font-bold tracking-widest text-[#475569] uppercase mb-1">NO ACTIVE SEVERE WEATHER ALERTS</h4>
                    <p className="text-[11px] text-[#94A3B8]">Intelligence feeds currently show no active severe-weather threats within the monitored region.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
