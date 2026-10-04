import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, CloudLightning, AlertTriangle, Info, Map as MapIcon, ShieldAlert } from 'lucide-react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { API_BASE_URL } from '../services/api';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { useTheme } from '../context/ThemeContext';

maplibregl.setWorkerUrl(workerUrl);
maplibregl.config.WORKER_URL = workerUrl;

export const WeatherPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isDark } = useTheme();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const currentMapStyle = isDark 
    ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
    : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

  const fetchWeather = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/events/weather`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
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
      style: currentMapStyle,
      center: [78.9629, 20.5937], // Center of India
      zoom: 4,
      attributionControl: false
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isLoading]);

  // Dynamically update basemap on theme change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setStyle(currentMapStyle);
    }
  }, [currentMapStyle]);

  // Determine threat level for background
  const hasAlerts = data?.alerts && data.alerts.length > 0;
  
  const numWarnings = data?.alerts?.filter((a: any) => a.event.includes('Warning')).length || 0;
  const numWatches = data?.alerts?.filter((a: any) => a.event.includes('Watch')).length || 0;
  const numAdvisories = data?.alerts?.filter((a: any) => a.event.includes('Advisory')).length || 0;

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#F8FAFC] dark:bg-[#0B0F19] font-sans animate-in fade-in duration-700 transition-colors duration-300">
      
      {/* ATMOSPHERIC HERO */}
      <div className="relative w-full overflow-hidden bg-gradient-to-b from-sky-300 to-sky-100 dark:from-slate-900 dark:to-slate-950 text-[#0F172A] dark:text-slate-100 pb-24 pt-8 px-6 border-b border-[#E2E8F0] dark:border-slate-800">
        
        {/* Cloud Visual Elements */}
        <div className="absolute top-[-50px] right-[-50px] opacity-60 dark:opacity-10 pointer-events-none animate-[pulse-subtle_8s_ease-in-out_infinite]">
          <svg width="400" height="300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white dark:text-slate-600 w-96 h-96 drop-shadow-xl">
            <path d="M17.5 19a4.5 4.5 0 0 0 2.9-7.9c-.3-4.2-3.8-7.1-7.9-7.1-3.6 0-6.7 2.4-7.6 5.8A4.5 4.5 0 0 0 5.5 19h12z" fill="#ffffff" stroke="none" />
          </svg>
        </div>
        <div className="absolute top-10 left-10 opacity-40 dark:opacity-10 pointer-events-none animate-[pulse-subtle_12s_ease-in-out_infinite]">
          <svg width="200" height="150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white dark:text-slate-600 w-48 h-48 drop-shadow-md">
            <path d="M17.5 19a4.5 4.5 0 0 0 2.9-7.9c-.3-4.2-3.8-7.1-7.9-7.1-3.6 0-6.7 2.4-7.6 5.8A4.5 4.5 0 0 0 5.5 19h12z" fill="#ffffff" stroke="none" />
          </svg>
        </div>
        
        <div className="relative z-10 max-w-[1600px] mx-auto flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center border bg-white/40 dark:bg-slate-800/80 text-blue-700 dark:text-blue-400 border-white/50 dark:border-slate-700 shadow-sm backdrop-blur-md">
              <CloudLightning className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-[32px] font-bold tracking-widest text-[#0F172A] dark:text-slate-100 leading-none mb-2 shadow-sm drop-shadow-sm">
                WEATHER INTELLIGENCE
              </h1>
              <div className="text-[12px] font-mono-tech text-blue-900/80 dark:text-slate-300 uppercase tracking-widest flex items-center gap-3 bg-white/30 dark:bg-slate-800/60 px-3 py-1 rounded inline-flex border border-white/40 dark:border-slate-700 backdrop-blur-md">
                <span>INDIA</span>
                <span>•</span>
                <span>{hasAlerts ? 'ACTIVE WEATHER' : 'CLEAR CONDITIONS'}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={fetchWeather}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/40 dark:bg-slate-800/80 hover:bg-white/60 dark:hover:bg-slate-700 border border-white/50 dark:border-slate-700 text-[#0F172A] dark:text-slate-100 rounded font-mono-tech text-[11px] disabled:opacity-50 uppercase tracking-widest transition-colors backdrop-blur-md shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'SYNCING...' : 'SYNC FEED'}
          </button>
        </div>
      </div>

      {/* CONTENT PANELS (Overlapping Hero) */}
      <div className="relative z-20 px-6 max-w-[1600px] mx-auto -mt-14 pb-12">
        
        {/* API Failure State */}
        {error && !data && (
          <div className="w-full p-8 flex flex-col items-center justify-center border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 rounded-xl shadow-md">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4 animate-pulse" />
            <h3 className="font-bold text-[#0F172A] dark:text-slate-100 text-[18px] tracking-widest mb-2">WEATHER FEED TEMPORARILY UNAVAILABLE</h3>
            <p className="text-[13px] text-[#475569] dark:text-slate-300 max-w-md text-center">{error}</p>
            <button onClick={fetchWeather} className="mt-6 px-6 py-2 bg-red-100 dark:bg-red-900/60 hover:bg-red-200 dark:hover:bg-red-900 text-red-700 dark:text-red-200 text-[12px] font-bold rounded tracking-widest transition-colors">
              RETRY CONNECTION
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !data && !error && (
          <div className="w-full h-[400px] bg-white dark:bg-slate-900 rounded-xl shadow-md border border-[#E2E8F0] dark:border-slate-800 flex flex-col items-center justify-center">
            <RefreshCw className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
            <div className="text-[12px] text-[#64748B] dark:text-slate-400 font-mono-tech tracking-widest uppercase animate-pulse">Establishing Data Uplink...</div>
          </div>
        )}

        {/* Main Content */}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Command Center Metrics & Map */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              
              {/* Telemetry Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-lg p-5 shadow-sm">
                  <div className="text-[10px] text-[#64748B] dark:text-slate-400 font-bold tracking-widest uppercase mb-1">Active Warnings</div>
                  <div className="text-[32px] font-mono-tech text-red-600 dark:text-red-400 leading-none">{numWarnings}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-lg p-5 shadow-sm">
                  <div className="text-[10px] text-[#64748B] dark:text-slate-400 font-bold tracking-widest uppercase mb-1">Active Watches</div>
                  <div className="text-[32px] font-mono-tech text-amber-500 dark:text-amber-400 leading-none">{numWatches}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-lg p-5 shadow-sm">
                  <div className="text-[10px] text-[#64748B] dark:text-slate-400 font-bold tracking-widest uppercase mb-1">Advisories</div>
                  <div className="text-[32px] font-mono-tech text-blue-600 dark:text-blue-400 leading-none">{numAdvisories}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-lg p-5 shadow-sm">
                  <div className="text-[10px] text-[#64748B] dark:text-slate-400 font-bold tracking-widest uppercase mb-1">Total Alerts</div>
                  <div className="text-[32px] font-mono-tech text-[#0F172A] dark:text-slate-100 leading-none">{data.alerts?.length || 0}</div>
                </div>
              </div>

              {/* Map Visualizer */}
              <div className="w-full h-[500px] bg-[#E2E8F0] dark:bg-slate-950 rounded-xl border border-[#CBD5E1] dark:border-slate-800 relative overflow-hidden flex flex-col shadow-inner">
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded border border-[#E2E8F0] dark:border-slate-800 shadow-sm">
                  <MapIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-[11px] font-bold tracking-widest text-[#0F172A] dark:text-slate-100 uppercase">INDIA WEATHER MAP</span>
                </div>
                {/* Map Container */}
                <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
                
                {/* Subtle Scanning overlay effect */}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(59,130,246,0.05)_50%,transparent_100%)] h-[20%] animate-[scan_4s_ease-in-out_infinite] pointer-events-none" />
              </div>
            </div>

            {/* Right Column: Threat Feed */}
            <div className="lg:col-span-4 flex flex-col mt-0 lg:mt-[88px]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E2E8F0] dark:border-slate-800">
                <h3 className="text-[12px] font-bold tracking-widest text-[#0F172A] dark:text-slate-100 uppercase">ACTIVE THREATS</h3>
                <span className="text-[10px] bg-[#F1F5F9] dark:bg-slate-800 px-2 py-0.5 rounded text-[#475569] dark:text-slate-300 font-mono-tech border border-[#E2E8F0] dark:border-slate-700">{data.alerts?.length || 0} TOTAL</span>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[600px] custom-scrollbar">
                {hasAlerts ? (
                  data.alerts.map((alert: any, idx: number) => {
                    const isSevere = alert.severity === 'Severe' || alert.severity === 'Extreme';
                    const color = isSevere ? 'red' : alert.severity === 'Moderate' ? 'amber' : 'blue';
                    return (
                      <div key={idx} className={`bg-white dark:bg-slate-900 border border-${color}-200 dark:border-${color}-900/60 rounded-lg p-5 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
                        <div className={`absolute top-0 left-0 w-1 h-full bg-${color}-500`} />
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-[10px] font-bold text-${color}-700 dark:text-${color}-400 uppercase tracking-widest`}>{alert.event}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase bg-${color}-50 dark:bg-${color}-950/60 text-${color}-700 dark:text-${color}-300 border border-${color}-200 dark:border-${color}-800`}>
                            {alert.severity}
                          </span>
                        </div>
                        <h4 className="font-bold text-[14px] text-[#0F172A] dark:text-slate-100 leading-snug mb-3">{alert.headline}</h4>
                        <div className="text-[11px] text-[#64748B] dark:text-slate-400 font-mono-tech space-y-1.5 pt-3 border-t border-[#F1F5F9] dark:border-slate-800">
                          <div className="flex justify-between">
                            <span>EFFECTIVE:</span>
                            <span className="text-[#0F172A] dark:text-slate-200 font-medium">{new Date(alert.effective).toLocaleTimeString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>EXPIRES:</span>
                            <span className="text-[#0F172A] dark:text-slate-200 font-medium">{new Date(alert.expires).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center px-6 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl shadow-sm">
                    <CloudLightning className="w-10 h-10 text-blue-200 dark:text-slate-700 mb-3" />
                    <h4 className="text-[13px] font-bold tracking-widest text-[#475569] dark:text-slate-300 uppercase mb-1">NO ACTIVE SEVERE WEATHER ALERTS</h4>
                    <p className="text-[11px] text-[#94A3B8] dark:text-slate-500">Intelligence feeds currently show no active severe-weather threats within the monitored region.</p>
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
