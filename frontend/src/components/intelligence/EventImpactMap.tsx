import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Plus, Minus, Locate, ExternalLink, X, Maximize } from 'lucide-react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getEvents, getEventById, EventImpactData } from '../../services/eventApi';
import { MarketView } from './MarketView';
import { RiskView } from './RiskView';

import { QueryResponse } from '../../types/api';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';

maplibregl.config.WORKER_URL = workerUrl;

interface EventImpactMapProps {
  data?: QueryResponse | null;
  onOpenInfrastructureModal?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const maptilerKey = import.meta.env.VITE_MAPTILER_API_KEY;
const MAP_STYLE = maptilerKey 
  ? `https://api.maptiler.com/maps/basic-v2-light/style.json?key=${maptilerKey}`
  : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

// --- FALLBACK MOCK DATA REMOVED ---

export const EventImpactMap: React.FC<EventImpactMapProps> = ({
  data,
  onOpenInfrastructureModal,
  isExpanded = false,
  onToggleExpand,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ id: string, marker: maplibregl.Marker, type: string }[]>([]);
  
  const [activeTab, setActiveTab] = useState<'MAP' | 'MARKET' | 'RISK'>('MAP');
  const [layersVisible, setLayersVisible] = useState({
    storm: true, cone: true, refineries: true, ports: true, pipelines: true,
  });
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  // API State
  const [eventData, setEventData] = useState<EventImpactData | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [isDemoData, setIsDemoData] = useState(false);

  // 1. Fetch Event Data
  const loadEventData = async () => {
    if (data && data.event) {
      setEventData({
        id: data.run_id || 'real-event',
        name: data.event.event_name || 'Event',
        type: 'HURRICANE',
        status: data.data_quality?.overall_status === 'good' ? 'LIVE' : 'SIMULATED',
        category: data.event.category || 'Extreme',
        source: 'BACKEND',
        wind_speed: 0,
        pressure: 0,
        updated_at: new Date().toISOString(),
        current_position: { lat: 0, lng: 0 },
        observed_path: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] }, properties: {} },
        forecast_path: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] }, properties: {} },
        forecast_cone: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [] }, properties: {} },
        affected_regions: data.event.region ? [data.event.region] : [],
        infrastructure: { refineries: [], ports: [], pipelines: { type: 'FeatureCollection', features: [] } },
        portfolio_impact: { exposure: 'N/A', risk_change: 'N/A', affected_assets: 'N/A' }
      });
      setIsDemoData(false);
      setIsLoadingEvent(false);
      return;
    }

    // Create persistent demo fixtures for the map
    setEventData({
      id: 'demo-scenario',
      name: 'Global Market Events',
      type: 'SCENARIO',
      status: 'SCENARIO VIEW',
      category: 'Multiple',
      source: 'TERMINAL',
      wind_speed: 120,
      pressure: 980,
      updated_at: new Date().toISOString(),
      current_position: { lat: 15.0, lng: 88.0 }, // Bay of Bengal Cyclone
      observed_path: { type: 'Feature', geometry: { type: 'LineString', coordinates: [[88.0, 10.0], [88.0, 15.0]] }, properties: {} },
      forecast_path: { type: 'Feature', geometry: { type: 'LineString', coordinates: [[88.0, 15.0], [87.5, 18.0]] }, properties: {} },
      forecast_cone: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[87.0, 15.0], [89.0, 15.0], [88.5, 19.0], [86.5, 19.0], [87.0, 15.0]]] }, properties: {} },
      affected_regions: ['Bay of Bengal', 'US Gulf Coast'],
      infrastructure: {
        refineries: [{ id: 'ref-1', name: 'Gulf Coast Facility', lat: 29.7604, lng: -95.3698, status: 'AT RISK', assets: 'XOM, CVX', exposure: 'High', impact: 'Severe' }],
        ports: [{ id: 'port-1', name: 'Mumbai Port', lat: 18.944, lng: 72.836 }],
        pipelines: { type: 'FeatureCollection', features: [] }
      },
      portfolio_impact: { exposure: 'N/A', risk_change: 'N/A', affected_assets: 'N/A' }
    });
    setApiError(false);
    setIsDemoData(true);
    setIsLoadingEvent(false);
  };

  useEffect(() => {
    loadEventData();
    // Ensure map resizes when returning to the Map tab
    if (activeTab === 'MAP' && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.resize();
      }, 0);
    }
  }, [activeTab, data]);

  useEffect(() => {
    // Resize map when entering/exiting expanded mode
    setTimeout(() => {
      mapRef.current?.resize();
    }, 250); // After CSS transition finishes
  }, [isExpanded]);

  const toggleExpand = () => {
    if (onToggleExpand) {
      onToggleExpand();
    }
  };

  // 2. Initialize Map ONCE and Render Data
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !eventData) return;

    let isActive = true;

    fetch(MAP_STYLE)
      .then(res => res.json())
      .then(style => {
        if (!isActive) return;

        const newStyle = { ...style, layers: [...style.layers] };
        newStyle.layers = newStyle.layers.map((layer: any) => {
          const id = layer.id.toLowerCase();
          const paint = layer.paint ? { ...layer.paint } : {};
          const newLayer = { ...layer, paint };

          // Land & Background (Sage Green)
          if (id === 'background' || id.includes('landcover') || id.includes('park') || id.includes('landuse')) {
            if (layer.type === 'background') paint['background-color'] = '#E4EAE1'; 
            else if (layer.type === 'fill' && paint['fill-color']) paint['fill-color'] = '#DFE6DB'; 
          }
          
          // Water (Soft Muted Blue)
          if (id.includes('water') || id.includes('ocean') || id.includes('sea') || id.includes('lake') || id.includes('river')) {
            if (layer.type === 'fill' && paint['fill-color']) paint['fill-color'] = '#CFE0F2'; 
          }
          
          // Borders & Coastlines (Light Gray)
          if (layer.type === 'line' && (id.includes('boundary') || id.includes('border') || id.includes('coast'))) {
            if (typeof paint['line-color'] === 'string' || paint['line-color'] === undefined) paint['line-color'] = '#CBD5E1';
          }
          
          // Geographic Labels (Dark Gray)
          if (layer.type === 'symbol' && (id.includes('place') || id.includes('watername') || id.includes('country') || id.includes('state') || id.includes('city') || id.includes('label'))) {
            if (typeof paint['text-color'] === 'string' || paint['text-color'] === undefined) paint['text-color'] = '#475569';
            if (typeof paint['text-halo-color'] === 'string') paint['text-halo-color'] = 'rgba(255,255,255,0.7)';
          }

          return newLayer;
        });

        const map = new maplibregl.Map({
          container: mapContainerRef.current!,
          style: newStyle,
          center: [78.9629, 20.5937],
          zoom: 4.5,
          minZoom: 0,
          maxZoom: 18,
          dragPan: true,
          scrollZoom: true,
          doubleClickZoom: true,
          touchZoomRotate: true,
          attributionControl: false
        });

        mapRef.current = map;

        map.on('load', () => {
          if (!isActive) return;

          // Add GeoJSON sources & layers
          map.addSource('pipelines', { type: 'geojson', data: eventData.infrastructure.pipelines as any });
          map.addLayer({ id: 'pipelines-layer', type: 'line', source: 'pipelines', paint: { 'line-color': '#EAB308', 'line-width': 2, 'line-dasharray': [2, 2] } });
          
          map.addSource('cone', { type: 'geojson', data: eventData.forecast_cone as any });
          map.addLayer({ id: 'cone-layer', type: 'fill', source: 'cone', paint: { 'fill-color': '#3B82F6', 'fill-opacity': 0.25 } });

          map.addSource('observed-path', { type: 'geojson', data: eventData.observed_path as any });
          map.addLayer({ id: 'observed-path-layer', type: 'line', source: 'observed-path', paint: { 'line-color': '#2563EB', 'line-width': 2 } });
          
          map.addSource('forecast-path', { type: 'geojson', data: eventData.forecast_path as any });
          map.addLayer({ id: 'forecast-path-layer', type: 'line', source: 'forecast-path', paint: { 'line-color': '#60A5FA', 'line-width': 2, 'line-dasharray': [4, 4] } });

          // DOM Markers
          const addMarker = (lng: number, lat: number, el: HTMLElement, type: string, onClick?: () => void) => {
            if (onClick) {
              el.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
            }
            const marker = new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
            markersRef.current.push({ id: type + '-' + markersRef.current.length, marker, type });
          };

          // Bay of Bengal Cyclone Marker
          const cycloneEl = document.createElement('div');
          cycloneEl.className = 'relative group cursor-pointer';
          cycloneEl.innerHTML = `
            <div class="relative flex items-center justify-center">
              <div class="w-10 h-10 rounded-full border border-blue-400/50 bg-blue-500/10 animate-[spin_4s_linear_infinite] flex items-center justify-center">
                 <div class="w-6 h-6 rounded-full border border-blue-400/80 bg-blue-500/30 animate-[spin_2s_linear_infinite]"></div>
              </div>
              <div class="absolute w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-blue-800 bg-white/80 px-1.5 py-0.5 rounded backdrop-blur-sm border border-blue-200">
              BAY OF BENGAL CYCLONE
            </div>
          `;
          addMarker(88.0, 15.0, cycloneEl, 'storm', () => setSelectedFeature({ type: 'STORM' }));

          // Gulf Coast Marker
          const gulfEl = document.createElement('div');
          gulfEl.className = 'relative group cursor-pointer';
          gulfEl.innerHTML = `
            <div class="w-4 h-4 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse border-2 border-white"></div>
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold text-amber-800 bg-white/80 px-1.5 py-0.5 rounded backdrop-blur-sm border border-amber-200">
              GULF ENERGY EVENT
            </div>
          `;
          addMarker(-95.3698, 28.0, gulfEl, 'storm', () => setSelectedFeature({ type: 'STORM' }));

          // Refineries (Demo Industrial Facility)
          eventData.infrastructure.refineries.forEach(ref => {
            const el = document.createElement('div');
            el.className = 'text-[14px] text-red-700 cursor-pointer hover:scale-125 transition-transform drop-shadow-md';
            el.innerHTML = `■`;
            addMarker(ref.lng, ref.lat, el, 'refineries', () => setSelectedFeature({ type: 'REFINERY', data: ref }));
          });

          // Ports (Demo Port)
          eventData.infrastructure.ports.forEach(port => {
            const el = document.createElement('div');
            el.className = 'text-[14px] text-gray-800 cursor-pointer hover:scale-125 transition-transform drop-shadow-md';
            el.innerHTML = `▲`;
            el.title = port.name;
            addMarker(port.lng, port.lat, el, 'ports');
          });

          setIsMapLoaded(true);
        });
      })
      .catch(err => {
        console.error('Failed to initialize MapLibre', err);
      });

    return () => {
      isActive = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [eventData]); // Depends on eventData, runs when data is ready

  // 3. Handle Layer Visibility Toggles
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;
    
    const setVis = (layerId: string, visible: boolean) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      }
    };

    setVis('pipelines-layer', layersVisible.pipelines);
    setVis('cone-layer', layersVisible.cone);
    setVis('observed-path-layer', layersVisible.storm);
    setVis('forecast-path-layer', layersVisible.storm);

    // Toggle markers natively
    markersRef.current.forEach(({ marker, type }) => {
      const el = marker.getElement();
      if (type === 'storm') el.style.display = layersVisible.storm ? 'block' : 'none';
      if (type === 'refineries') el.style.display = layersVisible.refineries ? 'block' : 'none';
      if (type === 'ports') el.style.display = layersVisible.ports ? 'block' : 'none';
    });
  }, [layersVisible, isMapLoaded]);

  const toggleLayer = (key: keyof typeof layersVisible) => {
    setLayersVisible(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleZoomIn = () => mapRef.current?.zoomIn({ duration: 300 });
  const handleZoomOut = () => mapRef.current?.zoomOut({ duration: 300 });
  const handleReset = () => mapRef.current?.flyTo({ center: [78.9629, 20.5937], zoom: 4.5, duration: 800 });

  return (
    <div 
      ref={containerRef}
      id="event-impact-analysis-container"
      className="select-none relative w-full h-full flex flex-col flex-1"
    >
      {/* Panel Sub-header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#F1F5F9] mb-4">
        <div className="flex items-center gap-6">
          <h2 className="text-[21px] font-bold text-[#0F172A] flex items-center gap-3">
            Event Impact Analysis
            {isDemoData && !isLoadingEvent && (
              <span className="text-[10px] font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded uppercase tracking-wider">
                SIMULATION
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2 p-1 bg-slate-50 border border-slate-200 rounded-lg">
            {['MAP', 'MARKET', 'RISK'].map(tab => {
              const label = tab === 'MAP' ? 'MAP VIEW' : tab === 'MARKET' ? 'MARKET VIEW' : 'RISK VIEW';
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`relative px-4 py-1.5 rounded-md text-[12px] font-bold tracking-widest transition-all overflow-hidden ${
                    isActive 
                      ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {isActive && <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500 animate-[pulse_2s_ease-in-out_infinite]"></div>}
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend status indicators & Fullscreen Button */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-[#64748B]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            Observed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D97706]" />
            Model
          </span>
          <span className="flex items-center gap-1.5 pr-4 border-r border-[#E2E8F0]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            Simulation
          </span>
          <button className="text-[#94A3B8] hover:text-[#0F172A] ml-1 mr-2">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>



      {/* Main Geographic Map Visualizer */}
      {eventData && (
      <div className={`relative w-full flex-1 rounded-xl overflow-hidden bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col transition-all duration-300 ease-in-out ${
        isExpanded ? 'min-h-[650px]' : 'min-h-[420px]'
      }`}>
        
        {/* Map View Layer */}
        <div style={{ display: activeTab === 'MAP' ? 'block' : 'none' }} className="absolute inset-0 w-full h-full bg-[#E4EAE1]">
          {/* The pure MapLibre container */}
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" style={{ minHeight: '420px' }} />

        {/* Loading Overlay */}
        {(isLoadingEvent || !isMapLoaded) && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#E4EAE1] z-10 pointer-events-none">
            <span className="text-[12px] text-[#64748B] font-medium tracking-wide">
              {isLoadingEvent ? 'Loading intelligence...' : 'Initializing Geographic Intelligence...'}
            </span>
          </div>
        )}

        {/* Floating Top-Left Card: Active Hurricane Information */}
        {(eventData || data) && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-[#E2E8F0] flex items-center gap-3 pointer-events-auto z-20">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
            <span className="text-[20px]">🌊</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[14px] text-[#0F172A]">🌊 {data?.event?.event_name || eventData?.name}</span>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded uppercase">
                {data?.data_quality?.overall_status === 'good' ? 'LIVE' : (data?.data_quality?.overall_status || eventData?.status || 'SIMULATION').toUpperCase()}
              </span>
            </div>
            <div className="text-[12px] font-medium text-[#475569]">{data?.event?.category || eventData?.category}</div>
            <div className="text-[11px] text-[#94A3B8] font-mono-tech mt-0.5">
              {data ? 'BACKEND' : eventData?.source} • {new Date(eventData?.updated_at || Date.now()).toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute:'2-digit' })} UTC
            </div>
          </div>
        </div>
        )}

        {/* Floating Left Map Controls */}
        <div className="absolute left-4 bottom-4 flex flex-col gap-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-[#E2E8F0] p-1 pointer-events-auto z-20">
          <button onClick={handleZoomIn} className="p-1.5 hover:bg-[#F1F5F9] rounded text-[#475569] transition-colors" title="Zoom In">
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleZoomOut} className="p-1.5 hover:bg-[#F1F5F9] rounded text-[#475569] transition-colors" title="Zoom Out">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <div className="h-[1px] bg-[#E2E8F0] mx-1" />
          <button onClick={handleReset} className="p-1.5 hover:bg-[#F1F5F9] rounded text-[#475569] transition-colors" title="Reset View">
            <Locate className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Floating Map Legend (Top-Right) */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm border border-[#E2E8F0] text-[12px] space-y-2.5 text-[#475569] font-medium pointer-events-auto z-20">
          <button onClick={() => toggleLayer('storm')} className={`flex items-center gap-2 transition-opacity ${layersVisible.storm ? 'opacity-100' : 'opacity-40'}`}>
            <span className="text-[14px]">🔵</span>
            <span>Simulated Event Path</span>
          </button>
          <button onClick={() => toggleLayer('cone')} className={`flex items-center gap-2 transition-opacity ${layersVisible.cone ? 'opacity-100' : 'opacity-40'}`}>
            <span className="text-[14px]">🟦</span>
            <span>Simulated Impact Zone</span>
          </button>
          <button onClick={() => toggleLayer('ports')} className={`flex items-center gap-2 transition-opacity ${layersVisible.ports ? 'opacity-100' : 'opacity-40'}`}>
            <span className="text-[14px] text-gray-800">▲</span>
            <span>Port</span>
          </button>
          <button onClick={() => toggleLayer('refineries')} className={`flex items-center gap-2 transition-opacity ${layersVisible.refineries ? 'opacity-100' : 'opacity-40'}`}>
            <span className="text-[14px] text-gray-800">■</span>
            <span>Industrial Facility</span>
          </button>
          <button onClick={() => toggleLayer('pipelines')} className={`flex items-center gap-2 transition-opacity ${layersVisible.pipelines ? 'opacity-100' : 'opacity-40'}`}>
            <span className="text-[14px]">⚡</span>
            <span>Energy Infrastructure</span>
          </button>
        </div>

        {/* Floating Bottom-Right Button */}
        <div className="absolute bottom-4 right-4 pointer-events-auto z-20">
          <button
            onClick={onOpenInfrastructureModal}
            className="bg-white/95 backdrop-blur-sm hover:bg-white text-[#0F172A] text-[13px] font-medium px-4 py-2.5 rounded-lg shadow-sm border border-[#E2E8F0] flex items-center gap-2 transition-colors"
          >
            <span>View Infrastructure Map</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#64748B]" />
          </button>
        </div>

        {/* Selected Feature Popups */}
        {selectedFeature && selectedFeature.type === 'STORM' && eventData && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl border border-[#E2E8F0] w-64 overflow-hidden animate-in zoom-in-95 duration-200 pointer-events-auto z-50">
            <div className="bg-[#F8FAFC] px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
              <span className="font-semibold text-[#0F172A] text-[13px] uppercase">{data?.event?.event_name || 'EVENT'}</span>
              <button onClick={() => setSelectedFeature(null)} className="text-[#64748B] hover:text-[#0F172A]"><X className="w-3.5 h-3.5" /></button>
            </div>
            <div className="p-4 space-y-3 text-[12px] tabular-data">
              <div className="flex justify-between items-center pb-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Severity</span>
                <span className="font-bold text-[#DC2626] bg-[#FEE2E2] px-1.5 py-0.5 rounded text-[10px]">Severe</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Affected Region</span>
                <span className="font-medium text-[#0F172A]">{data?.event?.region || 'Unknown'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Affected Areas</span>
                <span className="font-medium text-[#0F172A] text-right ml-2 leading-tight">{data?.event?.region || 'Unknown'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Data State</span>
                <span className="font-medium text-[#D97706]">SIMULATION</span>
              </div>
              <button className="w-full mt-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-1.5 rounded-md font-medium transition-colors">
                Analyze Impact
              </button>
            </div>
          </div>
        )}

        {selectedFeature && selectedFeature.type === 'REFINERY' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl border border-[#E2E8F0] w-64 overflow-hidden animate-in zoom-in-95 duration-200 pointer-events-auto z-50">
            <div className="bg-[#F8FAFC] px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
              <span className="font-semibold text-[#0F172A] text-[13px] uppercase">Refinery: {selectedFeature.data.name}</span>
              <button onClick={() => setSelectedFeature(null)} className="text-[#64748B] hover:text-[#0F172A]"><X className="w-3.5 h-3.5" /></button>
            </div>
            <div className="p-4 space-y-3 text-[12px] tabular-data">
              <div className="flex justify-between items-center pb-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Status</span>
                <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${selectedFeature.data.status === 'AT RISK' ? 'text-[#DC2626] bg-[#FEE2E2]' : 'text-[#16A34A] bg-[#DCFCE7]'}`}>
                  {selectedFeature.data.status}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Affected Assets</span>
                <span className="font-medium text-[#0F172A]">{selectedFeature.data.assets}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Portfolio Exposure</span>
                <span className="font-medium text-[#D97706]">{selectedFeature.data.exposure}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Est. Risk Impact</span>
                <span className="font-medium text-[#DC2626]">{selectedFeature.data.impact}</span>
              </div>
              <button className="w-full mt-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] py-1.5 rounded-md font-medium transition-colors border border-[#E2E8F0]">
                View Evidence
              </button>
            </div>
          </div>
        )}
        </div> {/* End Map View Layer */}

        {/* Other Views Layer */}
        {activeTab === 'MARKET' && (
          <MarketView 
            isSimulation={isDemoData} 
            selectedAsset={selectedAsset} 
            onSelectAsset={setSelectedAsset} 
          />
        )}
        {activeTab === 'RISK' && (
          <RiskView isSimulation={isDemoData} selectedAsset={selectedAsset} />
        )}



      </div>
      )}
    </div>
  );
};
