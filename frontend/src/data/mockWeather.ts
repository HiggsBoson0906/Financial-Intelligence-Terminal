import type { WeatherDisruption } from '../types';

export const mockWeatherDisruption: WeatherDisruption = {
  id: 'WX-2026-AURELIA',
  name: 'HURRICANE AURELIA',
  category: 'CATEGORY 4',
  location: 'GULF OF MEXICO (LAT 25.4°N, LON 89.2°W)',
  windSpeed: '145 mph',
  landfallHorizon: '72 hours (Est. Tuesday 14:00 EST)',
  affectedInfrastructure: {
    refineries: [
      'Motiva Port Arthur (630K bpd)',
      'Marathon Garyville (596K bpd)',
      'ExxonMobil Beaumont (369K bpd)',
      'Chevron Pascagoula (356K bpd)'
    ],
    ports: [
      'Port of Houston (Oil Export Terminal)',
      'Corpus Christi Crude Port',
      'Sabine Pass LNG Terminal'
    ],
    pipelines: [
      'Colonial Pipeline Mainline 1 & 2',
      'Capline Crude Pipeline',
      'Explorer Pipeline System'
    ]
  },
  causalChain: [
    {
      stage: 1,
      label: 'HURRICANE AURELIA',
      description: 'Category 4 storm with 145 mph sustained winds & 15 ft storm surge entering Gulf oil production zone',
      affectedSymbols: ['NOAA', 'NHC']
    },
    {
      stage: 2,
      label: 'GULF REFINERIES & INFRASTRUCTURE',
      description: 'Precautionary evacuation & emergency shutdown idling 1.8M bpd (40% of Gulf refining capacity)',
      affectedSymbols: ['MOTIVA', 'MARATHON', 'EXXON']
    },
    {
      stage: 3,
      label: 'EQUITY & COMMODITY IMPACT',
      description: 'Refiner equity margins compress while Natural Gas & Gasoline futures surge on supply bottleneck',
      affectedSymbols: ['XOM', 'CVX', 'MPC', 'NG=F', 'RB=F']
    },
    {
      stage: 4,
      label: 'ENERGY PRICE SHOCK',
      description: 'Projected +8.4% Natural Gas jump & +3.8% Crude futures shift over 3-5 day horizon',
      affectedSymbols: ['WTI', 'HENRY_HUB']
    }
  ]
};
