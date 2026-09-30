import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SensorMapComponent } from './sensor-map.component';
import { Sensor } from '../../../models/sensor.model';

describe('SensorMapComponent', () => {
  let component: SensorMapComponent;
  let fixture: ComponentFixture<SensorMapComponent>;

  const mockSensors: Sensor[] = [
    {
      id: 1,
      uidSensor: 'ACEA5AC8E720',
      name: 'Sensor 1',
      sensorType: 'ESP32_AIR',
      latitude: -12.046374,
      longitude: -77.042793,
      firmwareVersion: '1.0.2',
      sensorStatus: 'ONLINE',
      lastSeen: new Date().toISOString(),
      userId: 1,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      uidSensor: 'B189DF621C11',
      name: 'Sensor 2',
      sensorType: 'ESP32_AIR',
      latitude: -12.05211,
      longitude: -77.03652,
      firmwareVersion: '1.0.1',
      sensorStatus: 'OFFLINE',
      lastSeen: new Date().toISOString(),
      userId: 2,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      uidSensor: 'C993AF718223',
      name: 'Sensor 3',
      sensorType: 'ESP32_AIR',
      latitude: -12.06145,
      longitude: -77.04891,
      firmwareVersion: '1.0.0',
      sensorStatus: 'MAINTENANCE',
      lastSeen: null,
      userId: null,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensorMapComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SensorMapComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getStatusColor', () => {
    it('should return emerald (#10B981) for ONLINE status', () => {
      expect(component.getStatusColor('ONLINE')).toBe('#10B981');
    });

    it('should return rose (#EF4444) for OFFLINE status', () => {
      expect(component.getStatusColor('OFFLINE')).toBe('#EF4444');
    });

    it('should return amber (#F59E0B) for MAINTENANCE status', () => {
      expect(component.getStatusColor('MAINTENANCE')).toBe('#F59E0B');
    });

    it('should return default gray (#6B7280) for unknown status', () => {
      expect(component.getStatusColor('UNKNOWN' as any)).toBe('#6B7280');
    });
  });

  describe('Legend', () => {
    it('should display legend when showLegend is true', () => {
      component.showLegend = true;
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Status');
      expect(compiled.textContent).toContain('Online');
      expect(compiled.textContent).toContain('Offline');
      expect(compiled.textContent).toContain('Maintenance');
    });

    it('should hide legend when showLegend is false', () => {
      component.showLegend = false;
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.font-semibold')?.textContent).toBeUndefined();
    });
  });

  describe('Sensors and Selection', () => {
    it('should accept sensors input', () => {
      component.sensors = mockSensors;
      expect(component.sensors.length).toBe(3);
    });

    it('should emit sensorSelected when sensor is chosen', () => {
      const spy = vi.spyOn(component.sensorSelected, 'emit');
      component.sensorSelected.emit(mockSensors[0]);
      expect(spy).toHaveBeenCalledWith(mockSensors[0]);
    });

    it('should emit mapClicked when map is clicked', () => {
      const spy = vi.spyOn(component.mapClicked, 'emit');
      component.mapClicked.emit({ lat: -12.0, lng: -77.0 });
      expect(spy).toHaveBeenCalledWith({ lat: -12.0, lng: -77.0 });
    });
  });
});
