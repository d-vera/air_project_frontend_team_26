import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AirQualityService } from './air-quality.service';

describe('AirQualityService', () => {
  let service: AirQualityService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AirQualityService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AirQualityService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch current readings with optional deviceId', () => {
    const mockResponse = {
      readings: [
        {
          deviceId: 'ESP32_01',
          time: '2026-09-08T12:00:00Z',
          temperature: 23.5,
          humidity: 48,
          co2: 420,
          pm1_0: 5,
          pm2_5: 12,
          pm10: 20
        }
      ]
    };

    service.getCurrentReadings('ESP32_01').subscribe(res => {
      expect(res.readings.length).toBe(1);
      expect(res.readings[0].deviceId).toBe('ESP32_01');
    });

    const req = httpMock.expectOne(r => r.url === '/api/air-quality/current' && r.params.get('deviceId') === 'ESP32_01');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch historical readings with range shortcut mapped correctly', () => {
    const mockBackendResponse = {
      range: { from: '2026-08-08', to: '2026-09-08' },
      aggregationInterval: '12 hours',
      data: [
        {
          bucket: '2026-09-08T10:00:00Z',
          deviceId: 'SENSOR-001',
          avgTemperature: 21.4,
          avgHumidity: 55.2,
          avgCo2: 450.0,
          avgPm1_0: 6.2,
          avgPm2_5: 14.8,
          avgPm10: 28.1
        }
      ]
    };

    service.getHistoricalReadings({
      deviceId: 'SENSOR-001',
      rangeShortcut: '30d'
    }).subscribe(res => {
      expect(res.readings.length).toBe(1);
      expect(res.readings[0].deviceId).toBe('SENSOR-001');
      expect(res.readings[0].time).toBe('2026-09-08T10:00:00Z');
      expect(res.readings[0].temperature).toBe(21.4);
      expect(res.readings[0].pm2_5).toBe(14.8);
    });

    const req = httpMock.expectOne(
      r => r.url === '/api/air-quality/historical' &&
           r.params.get('deviceId') === 'SENSOR-001' &&
           r.params.get('range') === 'LAST_MONTH'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockBackendResponse);
  });

  it('should format YYYY-MM-DD dates to ISO timestamps (start of day and end of day)', () => {
    service.getHistoricalReadings({
      deviceId: 'SENSOR-002',
      from: '2026-09-28',
      to: '2026-09-28'
    }).subscribe(res => {
      expect(res.readings).toBeDefined();
    });

    const req = httpMock.expectOne(
      r => r.url === '/api/air-quality/historical' &&
           r.params.get('from') === '2026-09-28T00:00:00Z' &&
           r.params.get('to') === '2026-09-28T23:59:59Z'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ readings: [] });
  });

  it('should preserve ISO timestamp if already provided with time', () => {
    service.getHistoricalReadings({
      deviceId: 'SENSOR-002',
      from: '2026-09-28T12:00:00Z',
      to: '2026-09-29T18:30:00Z'
    }).subscribe(res => {
      expect(res.readings).toBeDefined();
    });

    const req = httpMock.expectOne(
      r => r.url === '/api/air-quality/historical' &&
           r.params.get('from') === '2026-09-28T12:00:00Z' &&
           r.params.get('to') === '2026-09-29T18:30:00Z'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ readings: [] });
  });

  it('should not include range parameter when from/to are present (mutually exclusive)', () => {
    service.getHistoricalReadings({
      deviceId: 'SENSOR-002',
      rangeShortcut: '30d',
      from: '2026-09-01',
      to: '2026-09-08'
    }).subscribe(res => {
      expect(res.readings).toBeDefined();
    });

    const req = httpMock.expectOne(
      r => r.url === '/api/air-quality/historical' &&
           !r.params.has('range') &&
           r.params.get('from') === '2026-09-01T00:00:00Z' &&
           r.params.get('to') === '2026-09-08T23:59:59Z'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ readings: [] });
  });

  it('should handle direct readings array format in historical response', () => {
    const mockDirectResponse = {
      readings: [
        {
          deviceId: 'SENSOR-002',
          time: '2026-09-08T11:00:00Z',
          temperature: 20.0,
          humidity: 50.0,
          co2: 400.0,
          pm1_0: 5.0,
          pm2_5: 10.0,
          pm10: 15.0
        }
      ]
    };

    service.getHistoricalReadings({
      deviceId: 'SENSOR-002',
      from: '2026-09-01',
      to: '2026-09-08'
    }).subscribe(res => {
      expect(res.readings.length).toBe(1);
      expect(res.readings[0].deviceId).toBe('SENSOR-002');
    });

    const req = httpMock.expectOne(
      r => r.url === '/api/air-quality/historical' &&
           r.params.get('from') === '2026-09-01T00:00:00Z' &&
           r.params.get('to') === '2026-09-08T23:59:59Z'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockDirectResponse);
  });

  it('should return empty readings when response is empty or null', () => {
    service.getHistoricalReadings({ deviceId: 'SENSOR-EMPTY' }).subscribe(res => {
      expect(res.readings).toEqual([]);
    });

    const req = httpMock.expectOne(r => r.url === '/api/air-quality/historical');
    req.flush(null);
  });
});
