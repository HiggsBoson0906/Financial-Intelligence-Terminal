const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface GeoJSONGeometry {
  type: string;
  coordinates: any;
}

export interface GeoJSONFeature {
  type: string;
  geometry: GeoJSONGeometry;
  properties?: any;
}

export interface GeoJSONFeatureCollection {
  type: string;
  features: GeoJSONFeature[];
}

export interface Refinery {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: string;
  assets: string;
  exposure: string;
  impact: string;
}

export interface Port {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Infrastructure {
  refineries: Refinery[];
  ports: Port[];
  pipelines: GeoJSONFeatureCollection;
}

export interface PortfolioImpact {
  exposure: string;
  risk_change: string;
  affected_assets: string;
}

export interface EventImpactData {
  id: string;
  name: string;
  type: string;
  status: string;
  category: string;
  wind_speed: number;
  pressure: number;
  updated_at: string;
  source: string;
  
  current_position: Coordinate;
  observed_path: GeoJSONFeature;
  forecast_path: GeoJSONFeature;
  forecast_cone: GeoJSONFeature;
  
  affected_regions: string[];
  infrastructure: Infrastructure;
  portfolio_impact: PortfolioImpact;
}

export const getEvents = async (): Promise<EventImpactData[]> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/events`, {
    headers: { 'ngrok-skip-browser-warning': 'true' }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  return response.json();
};

export const getEventById = async (eventId: string): Promise<EventImpactData> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/events/${eventId}`, {
    headers: { 'ngrok-skip-browser-warning': 'true' }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch event details');
  }
  return response.json();
};
