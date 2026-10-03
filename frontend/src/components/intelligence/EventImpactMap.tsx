import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Plus, Minus, Locate, ExternalLink, X } from 'lucide-react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getEvents, getEventById, EventImpactData } from '../../services/eventApi';

interface EventImpactMapProps {
  onOpenInfrastructureModal?: () => void;
}

const maptilerKey = import.meta.env.VITE_MAPTILER_API_KEY;
const MAP_STYLE = maptilerKey 
  ? `https://api.maptiler.com/maps/basic-v2-light/style.json?key=${maptilerKey}`
  : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

// --- FALLBACK MOCK DATA (DEMO DATA) ---
const FALLBACK_EVENT: EventImpactData = {
  id: "demo-event-001",
  name: "Gulf Hurricane",
  type: "STORM",
  status: "OBSERVED",
  category: "4",
  wind_speed: 145,
  pressure: 945,
  updated_at: new Date().toISOString(),
  source: "NOAA",
  current_position: { lat: 27, lng: -92 },
  observed_path: {
    type: "Feature",
    geometry: { type: "LineString", coordinates: [[-88, 23], [-90, 25], [-92, 27]] },
    properties: {}
  },
  forecast_path: {
    type: "Feature",
    geometry: { type: "LineString", coordinates: [[-92, 27], [-93.5, 28.5], [-94.5, 30.5]] },
    properties: {}
  },
  forecast_cone: {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [[[-92, 27], [-91, 30.5], [-93, 31.5], [-96, 30.5], [-92, 27]]]
    },
    properties: {}
  },
  affected_regions: ["Texas", "Louisiana", "Gulf of Mexico"],
  infrastructure: {
    refineries: [
      { id: 'ref-1', name: 'Port Arthur', lat: 29.88, lng: -93.94, status: 'AT RISK', assets: 'XOM · CVX · XLE', exposure: '$2.4M', impact: '+8.4%' },
      { id: 'ref-2', name: 'Houston Refining', lat: 29.73, lng: -94.98, status: 'AT RISK', assets: 'MPC · PSX', exposure: '$1.8M', impact: '+6.1%' },
      { id: 'ref-3', name: 'Garyville', lat: 30.06, lng: -90.62, status: 'SAFE', assets: 'VLO', exposure: '$0.5M', impact: '0%' }
    ],
    ports: [
      { id: 'port-1', name: 'Port of Houston', lat: 29.74, lng: -95.27 },
      { id: 'port-2', name: 'Port of New Orleans', lat: 29.95, lng: -90.07 }
    ],
    pipelines: {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'LineString', coordinates: [[-97, 28], [-95.3, 29.7], [-93.9, 29.9], [-90, 30]] }, properties: {} },
        { type: 'Feature', geometry: { type: 'LineString', coordinates: [[-95.3, 29.7], [-95, 32]] }, properties: {} }
      ]
    }
  },
  portfolio_impact: {
    exposure: "$4.2M",
    risk_change: "+14.2%",
    affected_assets: "Energy sector"
  }
};

export const EventImpactMap: React.FC<EventImpactMapProps> = ({
  onOpenInfrastructureModal,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ id: string, marker: maplibregl.Marker, type: string }[]>([]);
  
  const [activeTab, setActiveTab] = useState<'MAP' | 'MARKET' | 'RISK' | 'ANALOGS'>('MAP');
  const [layersVisible, setLayersVisible] = useState({
    storm: true, cone: true, refineries: true, ports: true, pipelines: true,
  });
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // API State
  const [eventData, setEventData] = useState<EventImpactData | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [isDemoData, setIsDemoData] = useState(false);

  // 1. Fetch Event Data
  const loadEventData = async () => {
    setIsLoadingEvent(true);
    setApiError(false);
    try {
      // Get all events first to find an ID if needed, 
      // or we just fetch the main event. For now, fetch all and pick first.
      const events = await getEvents();
      if (events && events.length > 0) {
        const fullEvent = await getEventById(events[0].id);
        setEventData(fullEvent);
        setIsDemoData(fullEvent.id.includes('demo') || fullEvent.source.includes('DEMO'));
      } else {
        throw new Error('No events found in API');
      }
    } catch (err) {
      console.error("API Failed, using fallback demo data:", err);
      setApiError(true);
      setEventData(FALLBACK_EVENT);
      setIsDemoData(true);
    } finally {
      setIsLoadingEvent(false);
    }
  };

  useEffect(() => {
    loadEventData();
  }, []);

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
          center: [-92, 28.5],
          zoom: 5.5,
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
          map.addLayer({ id: 'pipelines-layer', type: 'line', source: 'pipelines', paint: { 'line-color': '#94A3B8', 'line-width': 1.5, 'line-dasharray': [2, 2] } });
          
          map.addSource('cone', { type: 'geojson', data: eventData.forecast_cone as any });
          map.addLayer({ id: 'cone-layer', type: 'fill', source: 'cone', paint: { 'fill-color': '#F43F5E', 'fill-opacity': 0.15 } });

          map.addSource('observed-path', { type: 'geojson', data: eventData.observed_path as any });
          map.addLayer({ id: 'observed-path-layer', type: 'line', source: 'observed-path', paint: { 'line-color': '#DC2626', 'line-width': 2 } });
          
          map.addSource('forecast-path', { type: 'geojson', data: eventData.forecast_path as any });
          map.addLayer({ id: 'forecast-path-layer', type: 'line', source: 'forecast-path', paint: { 'line-color': '#2563EB', 'line-width': 2, 'line-dasharray': [4, 4] } });

          // DOM Markers
          const addMarker = (lng: number, lat: number, el: HTMLElement, type: string, onClick?: () => void) => {
            if (onClick) {
              el.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
            }
            const marker = new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
            markersRef.current.push({ id: type + '-' + markersRef.current.length, marker, type });
          };

          // Storm Marker
          const stormEl = document.createElement('div');
          stormEl.className = 'relative group cursor-pointer';
          stormEl.innerHTML = `<div class="absolute inset-0 bg-[#DC2626] rounded-full animate-ping opacity-30 scale-150" style="animation-duration: 2s"></div><div class="w-4 h-4 bg-[#DC2626] rounded-full flex items-center justify-center border-2 border-white relative z-10 shadow-sm"><div class="w-1 h-1 bg-white rounded-full"></div></div>`;
          addMarker(eventData.current_position.lng, eventData.current_position.lat, stormEl, 'storm', () => setSelectedFeature({ type: 'STORM' }));

          // Refineries
          eventData.infrastructure.refineries.forEach(ref => {
            const el = document.createElement('div');
            el.className = 'w-3 h-3 bg-[#D97706] border-[1.5px] border-white shadow-sm cursor-pointer hover:scale-110 transition-transform';
            addMarker(ref.lng, ref.lat, el, 'refineries', () => setSelectedFeature({ type: 'REFINERY', data: ref }));
          });

          // Ports
          eventData.infrastructure.ports.forEach(port => {
            const el = document.createElement('div');
            el.className = 'w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[9px] border-b-[#2563EB] cursor-pointer hover:scale-110 transition-transform origin-bottom';
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
  const handleReset = () => mapRef.current?.flyTo({ center: [-92, 28.5], zoom: 5.5, duration: 800 });

  return (
    <div className="select-none">
      {/* Panel Sub-header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#F1F5F9] mb-4">
        <div className="flex items-center gap-6">
          <h2 className="text-[18px] font-semibold text-[#0F172A] flex items-center gap-3">
            Event Impact Analysis
            {isDemoData && !isLoadingEvent && (
              <span className="text-[10px] font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded border border-[#FDE68A]">
                DEMO DATA
              </span>
            )}
          </h2>
          <div className="flex items-center gap-5 text-[13px] font-medium text-[#64748B]">
            {['MAP', 'MARKET', 'RISK', 'ANALOGS'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`hover:text-[#0F172A] transition-colors ${activeTab === tab ? 'text-[#2563EB] font-semibold' : ''}`}
              >
                {tab === 'MAP' ? 'Map View' : tab === 'MARKET' ? 'Market View' : tab === 'RISK' ? 'Risk View' : 'Historical Analogs'}
              </button>
            ))}
          </div>
        </div>

        {/* Legend status indicators */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-[#64748B]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            Observed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D97706]" />
            Model
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            Simulation
          </span>
          <button className="text-[#94A3B8] hover:text-[#0F172A] ml-1">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {apiError && !eventData && (
        <div className="w-full h-[420px] rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col items-center justify-center">
          <div className="text-[13px] font-medium text-[#475569] mb-3">Unable to load event intelligence</div>
          <button onClick={loadEventData} className="px-4 py-1.5 bg-white border border-[#CBD5E1] rounded text-[12px] font-medium text-[#0F172A] hover:bg-[#F1F5F9] transition-colors">
            Retry
          </button>
        </div>
      )}

      {/* Main Geographic Map Visualizer */}
      {!apiError && (
      <div className="relative w-full h-[420px] min-h-[420px] rounded-xl overflow-hidden bg-[#E4EAE1] border border-[#E2E8F0]">
        
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
        {eventData && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-[#E2E8F0] flex items-center gap-3 pointer-events-auto z-20">
          <div className="w-9 h-9 rounded-lg bg-[#FEE2E2] flex items-center justify-center shrink-0 text-[#DC2626]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6a6 6 0 0 1 5.66 4M12 18a6 6 0 0 1-5.66-4M6.34 10A6 6 0 0 1 12 6M17.66 14A6 6 0 0 1 12 18" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[14px] text-[#0F172A]">{eventData.name}</span>
              <span className="text-[10px] font-bold text-[#DC2626] bg-[#FEE2E2] px-1.5 py-0.5 rounded uppercase">
                {eventData.status}
              </span>
            </div>
            <div className="text-[12px] font-medium text-[#475569]">Category {eventData.category}</div>
            <div className="text-[11px] text-[#94A3B8] font-mono-tech mt-0.5">
              {eventData.source} • {new Date(eventData.updated_at).toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute:'2-digit' })} UTC
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
            <span className="w-4 h-0.5 bg-[#DC2626] rounded inline-block" />
            <span>Storm Path (CAT {eventData?.category || '4'})</span>
          </button>
          <button onClick={() => toggleLayer('cone')} className={`flex items-center gap-2 transition-opacity ${layersVisible.cone ? 'opacity-100' : 'opacity-40'}`}>
            <span className="w-3 h-3 bg-[#F43F5E]/20 border border-[#F43F5E]/50 rounded-xs inline-block" />
            <span>Forecast Cone</span>
          </button>
          <button onClick={() => toggleLayer('refineries')} className={`flex items-center gap-2 transition-opacity ${layersVisible.refineries ? 'opacity-100' : 'opacity-40'}`}>
            <span className="w-2.5 h-2.5 bg-[#D97706] rounded-xs inline-block border border-white" />
            <span>Refinery</span>
          </button>
          <button onClick={() => toggleLayer('ports')} className={`flex items-center gap-2 transition-opacity ${layersVisible.ports ? 'opacity-100' : 'opacity-40'}`}>
            <span className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-[#2563EB] inline-block" />
            <span>Port</span>
          </button>
          <button onClick={() => toggleLayer('pipelines')} className={`flex items-center gap-2 transition-opacity ${layersVisible.pipelines ? 'opacity-100' : 'opacity-40'}`}>
            <span className="w-4 border-b border-dashed border-[#94A3B8] inline-block" />
            <span>Pipeline</span>
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
              <span className="font-semibold text-[#0F172A] text-[13px] uppercase">{eventData.name}</span>
              <button onClick={() => setSelectedFeature(null)} className="text-[#64748B] hover:text-[#0F172A]"><X className="w-3.5 h-3.5" /></button>
            </div>
            <div className="p-4 space-y-3 text-[12px] tabular-data">
              <div className="flex justify-between items-center pb-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Status</span>
                <span className="font-bold text-[#DC2626] bg-[#FEE2E2] px-1.5 py-0.5 rounded text-[10px]">{eventData.status} (CAT {eventData.category})</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Wind</span>
                <span className="font-medium text-[#0F172A]">{eventData.wind_speed} mph</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Pressure</span>
                <span className="font-medium text-[#0F172A]">{eventData.pressure} hPa</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Portfolio Exposure</span>
                <span className="font-medium text-[#DC2626]">{eventData.portfolio_impact.exposure}</span>
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
      </div>
      )}
    </div>
  );
};
