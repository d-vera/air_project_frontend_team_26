export interface AirQualityReading {
  deviceId: string;
  deviceName?: string;
  time: string;
  temperature: number;
  humidity: number;
  co2: number;
  pm1_0: number;
  pm2_5: number;
  pm10: number;
}

export interface CurrentAirQualityResponse {
  readings: AirQualityReading[];
}

export type TimeRangeShortcut = '24h' | '7d' | '30d' | '1y' | 'custom';

export interface CustomDateRange {
  from: string; // ISO format or YYYY-MM-DD
  to: string;   // ISO format or YYYY-MM-DD
}

export interface HistoricalAirQualityQuery {
  deviceId?: string;
  rangeShortcut?: TimeRangeShortcut;
  from?: string;
  to?: string;
}

export interface HistoricalAirQualityResponse {
  readings: AirQualityReading[];
}
