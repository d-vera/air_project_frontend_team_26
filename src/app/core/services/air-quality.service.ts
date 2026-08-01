import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
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
    if (query.rangeShortcut) {
      params = params.set('range', query.rangeShortcut);
    }
    if (query.from) {
      params = params.set('from', query.from);
    }
    if (query.to) {
      params = params.set('to', query.to);
    }
    return this.http.get<HistoricalAirQualityResponse>(`${this.API_URL}/historical`, { params });
  }
}
