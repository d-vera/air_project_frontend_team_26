import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  AirQualityReading,
  CurrentAirQualityResponse,
  HistoricalAirQualityQuery,
  HistoricalAirQualityResponse
} from '../../models/air-quality.model';

@Injectable({
  providedIn: 'root'
})
export class AirQualityService {
  private http = inject(HttpClient);

  private readonly API_URL = '/api/air-quality';

  /**
   * Fetch real-time current air quality readings.
   * Public access (No authentication token required).
   * Optional query param: deviceId
   */
  getCurrentReadings(deviceId?: string): Observable<CurrentAirQualityResponse> {
    let params = new HttpParams();
    if (deviceId && deviceId.trim().length > 0) {
      params = params.set('deviceId', deviceId.trim());
    }
    return this.http.get<CurrentAirQualityResponse>(`${this.API_URL}/current`, { params });
  }

  /**
   * Fetch historical air quality readings.
   * Access: Public for 24h, 7d, 30d; Authenticated required for 1y and custom date ranges.
   */
  getHistoricalReadings(query: HistoricalAirQualityQuery): Observable<HistoricalAirQualityResponse> {
    let params = new HttpParams();
    if (query.deviceId && query.deviceId.trim().length > 0) {
      params = params.set('deviceId', query.deviceId.trim());
    }
    if (query.rangeShortcut && query.rangeShortcut !== 'custom') {
      const rangeMap: Record<string, string> = {
        '24h': 'LAST_DAY',
        '7d': 'LAST_WEEK',
        '30d': 'LAST_MONTH',
        '1y': 'LAST_YEAR'
      };
      const backendRange = rangeMap[query.rangeShortcut] || query.rangeShortcut;
      params = params.set('range', backendRange);
    }
    if (query.from) {
      params = params.set('from', query.from);
    }
    if (query.to) {
      params = params.set('to', query.to);
    }
    return this.http.get<any>(`${this.API_URL}/historical`, { params }).pipe(
      map(res => {
        if (!res) {
          return { readings: [] };
        }
        if (Array.isArray(res.readings)) {
          return res as HistoricalAirQualityResponse;
        }
        if (Array.isArray(res.data)) {
          const readings: AirQualityReading[] = res.data.map((item: any) => ({
            deviceId: item.deviceId || query.deviceId || '',
            deviceName: query.deviceId || '',
            time: item.bucket || item.time || new Date().toISOString(),
            temperature: item.avgTemperature ?? item.temperature ?? 0,
            humidity: item.avgHumidity ?? item.humidity ?? 0,
            co2: item.avgCo2 ?? item.co2 ?? 0,
            pm1_0: item.avgPm1_0 ?? item.pm1_0 ?? 0,
            pm2_5: item.avgPm2_5 ?? item.pm2_5 ?? 0,
            pm10: item.avgPm10 ?? item.pm10 ?? 0
          }));
          return { readings };
        }
        return { readings: [] };
      })
    );
  }
}
