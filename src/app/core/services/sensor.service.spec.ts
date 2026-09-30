import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { SensorService } from './sensor.service';
import { Sensor, CreateSensorRequest, UpdateSensorRequest } from '../../models/sensor.model';

describe('SensorService', () => {
  let service: SensorService;
  let httpTesting: HttpTestingController;

  const mockSensor: Sensor = {
    id: 1,
    uidSensor: 'ACEA5AC8E720',
    name: 'Sensor Patio Central',
    sensorType: 'ESP32_AIR',
    latitude: -12.046374,
    longitude: -77.042793,
    firmwareVersion: '1.0.2',
    sensorStatus: 'ONLINE',
    lastSeen: '2026-08-16T15:18:00Z',
    userId: 1,
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  };

  const mockInactiveSensor: Sensor = {
    ...mockSensor,
    id: 2,
    uidSensor: 'B189DF621C11',
    name: 'Sensor Laboratorio Norte',
    active: false,
    sensorStatus: 'OFFLINE'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SensorService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(SensorService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSensors', () => {
    it('should fetch sensors from the API when refresh is true', () => {
      service.getSensors(true).subscribe((sensors) => {
        expect(sensors).toEqual([mockSensor]);
      });

      const req = httpTesting.expectOne('/api/sensors');
      expect(req.request.method).toBe('GET');
      req.flush([mockSensor]);
    });

    it('should update the loading state during fetch', () => {
      const loadingStates: boolean[] = [];
      service.loading$.subscribe((loading) => loadingStates.push(loading));

      service.getSensors(true).subscribe();

      const req = httpTesting.expectOne('/api/sensors');
      req.flush([mockSensor]);

      expect(loadingStates).toContain(true);
      expect(loadingStates[loadingStates.length - 1]).toBe(false);
    });

    it('should set loading to false on error', () => {
      service.getSensors(true).subscribe({ error: () => {} });

      const req = httpTesting.expectOne('/api/sensors');
      req.error(new ProgressEvent('error'));

      service.loading$.subscribe((loading) => {
        expect(loading).toBe(false);
      });
    });

    it('should pass includeInactive query param when includeInactive is true', () => {
      service.getSensors(true, true).subscribe((sensors) => {
        expect(sensors).toEqual([mockSensor, mockInactiveSensor]);
      });

      const req = httpTesting.expectOne('/api/sensors?includeInactive=true');
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('includeInactive')).toBe('true');
      req.flush([mockSensor, mockInactiveSensor]);
    });

    it('should refetch if includeInactive changes even when refresh is false', () => {
      service.getSensors(false, false).subscribe();
      const req1 = httpTesting.expectOne('/api/sensors');
      req1.flush([mockSensor]);

      service.getSensors(false, true).subscribe((sensors) => {
        expect(sensors).toEqual([mockSensor, mockInactiveSensor]);
      });
      const req2 = httpTesting.expectOne('/api/sensors?includeInactive=true');
      expect(req2.request.method).toBe('GET');
      req2.flush([mockSensor, mockInactiveSensor]);
    });
  });

  describe('getSensorById', () => {
    it('should fetch a single sensor by ID', () => {
      service.getSensorById(1).subscribe((sensor) => {
        expect(sensor).toEqual(mockSensor);
      });

      const req = httpTesting.expectOne('/api/sensors/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockSensor);
    });
  });

  describe('createSensor', () => {
    it('should send POST request and update local state', () => {
      const createPayload: CreateSensorRequest = {
        uidSensor: 'NEW123',
        name: 'New Sensor',
        latitude: -12.0,
        longitude: -77.0
      };

      service.createSensor(createPayload).subscribe((sensor) => {
        expect(sensor).toEqual(mockSensor);
      });

      const req = httpTesting.expectOne('/api/sensors');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createPayload);
      req.flush(mockSensor);
    });
  });

  describe('updateSensor', () => {
    it('should send PUT request and update local state', () => {
      // First load sensors so the subject has data
      service.getSensors(true).subscribe();
      httpTesting.expectOne('/api/sensors').flush([mockSensor]);

      const updatePayload: UpdateSensorRequest = { name: 'Updated Name' };
      const updatedSensor = { ...mockSensor, name: 'Updated Name' };

      service.updateSensor(1, updatePayload).subscribe((sensor) => {
        expect(sensor.name).toBe('Updated Name');
      });

      const req = httpTesting.expectOne('/api/sensors/1');
      expect(req.request.method).toBe('PUT');
      req.flush(updatedSensor);
    });
  });

  describe('deleteSensor', () => {
    it('should send DELETE request and remove sensor from local state', () => {
      // First load sensors
      service.getSensors(true).subscribe();
      httpTesting.expectOne('/api/sensors').flush([mockSensor]);

      service.deleteSensor(1).subscribe();

      const req = httpTesting.expectOne('/api/sensors/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      // Verify sensor was removed from local state
      service.sensors$.subscribe((sensors) => {
        expect(sensors.find(s => s.id === 1)).toBeUndefined();
      });
    });

    it('should mark sensor as inactive in local state when includeInactive was true', () => {
      service.getSensors(true, true).subscribe();
      httpTesting.expectOne('/api/sensors?includeInactive=true').flush([mockSensor]);

      service.deleteSensor(1).subscribe();

      const req = httpTesting.expectOne('/api/sensors/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      service.sensors$.subscribe((sensors) => {
        const found = sensors.find(s => s.id === 1);
        expect(found).toBeDefined();
        expect(found?.active).toBe(false);
      });
    });
  });

  describe('reactivateSensor', () => {
    it('should send PUT request to /api/sensors/{id}/reactivate', () => {
      const reactivatedSensor: Sensor = {
        ...mockInactiveSensor,
        active: true,
        sensorStatus: 'OFFLINE'
      };

      service.reactivateSensor(2).subscribe((sensor) => {
        expect(sensor).toEqual(reactivatedSensor);
        expect(sensor.active).toBe(true);
        expect(sensor.sensorStatus).toBe('OFFLINE');
      });

      const req = httpTesting.expectOne('/api/sensors/2/reactivate');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({});
      req.flush(reactivatedSensor);
    });

    it('should update the sensor in local state if it already exists', () => {
      // Load sensors with inactive sensor
      service.getSensors(true).subscribe();
      httpTesting.expectOne('/api/sensors').flush([mockSensor, mockInactiveSensor]);

      const reactivatedSensor: Sensor = {
        ...mockInactiveSensor,
        active: true,
        sensorStatus: 'OFFLINE'
      };

      service.reactivateSensor(2).subscribe();

      const req = httpTesting.expectOne('/api/sensors/2/reactivate');
      req.flush(reactivatedSensor);

      // Verify local state was updated
      service.sensors$.subscribe((sensors) => {
        const updated = sensors.find(s => s.id === 2);
        expect(updated).toBeTruthy();
        expect(updated!.active).toBe(true);
        expect(updated!.sensorStatus).toBe('OFFLINE');
      });
    });

    it('should add the sensor to local state if it does not already exist', () => {
      // Load only the first sensor
      service.getSensors(true).subscribe();
      httpTesting.expectOne('/api/sensors').flush([mockSensor]);

      const reactivatedSensor: Sensor = {
        ...mockInactiveSensor,
        active: true,
        sensorStatus: 'OFFLINE'
      };

      service.reactivateSensor(2).subscribe();

      const req = httpTesting.expectOne('/api/sensors/2/reactivate');
      req.flush(reactivatedSensor);

      // Verify sensor was appended to local state
      service.sensors$.subscribe((sensors) => {
        expect(sensors.length).toBe(2);
        const added = sensors.find(s => s.id === 2);
        expect(added).toBeTruthy();
        expect(added!.active).toBe(true);
      });
    });
  });
});
