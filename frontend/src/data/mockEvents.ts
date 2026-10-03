export interface HistoricalEvent {
  id: string;
  name: string;
  date: string;
  category: string;
  similarityScore: number; // 0 - 100
  description: string;
  marketOutcome: string;
  refiningDisruption: string;
  priceReaction: {
    crude: string;
    natgas: string;
    refiners: string;
  };
}

export const mockHistoricalEvents: HistoricalEvent[] = [
  {
    id: 'HIST-2005-KATRINA',
    name: 'Hurricane Katrina',
    date: 'August 2005',
    category: 'Category 5 Gulf Hurricane',
    similarityScore: 94,
    description: 'Direct strike on Louisiana refining corridor, shutting down 24% of US crude production.',
    marketOutcome: 'Refinery equities dropped 12% over 7 days while NatGas surged +28%.',
    refiningDisruption: '950K bpd offline for 14 days',
    priceReaction: {
      crude: '+14.2%',
      natgas: '+28.4%',
      refiners: '-12.1%'
    }
  },
  {
    id: 'HIST-2017-HARVEY',
    name: 'Hurricane Harvey',
    date: 'August 2017',
    category: 'Category 4 Texas Coast Hurricane',
    similarityScore: 88,
    description: 'Record rainfall stalled over Houston/Port Arthur refinery belt.',
    marketOutcome: 'Gasoline crack spreads widened to 3-year highs; natural gas volatility spiked.',
    refiningDisruption: '3.1M bpd offline for 10 days',
    priceReaction: {
      crude: '+4.8%',
      natgas: '+12.6%',
      refiners: '-7.5%'
    }
  },
  {
    id: 'HIST-2021-IDA',
    name: 'Hurricane Ida',
    date: 'August 2021',
    category: 'Category 4 Louisiana Hurricane',
    similarityScore: 91,
    description: 'Landfall near Port Fourchon damaged offshore power grids and export terminals.',
    marketOutcome: 'Natural gas futures gained +18% over 2 weeks due to offshore platform shut-ins.',
    refiningDisruption: '1.4M bpd offline for 9 days',
    priceReaction: {
      crude: '+8.1%',
      natgas: '+18.2%',
      refiners: '-9.3%'
    }
  }
];
