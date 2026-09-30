import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideTranslateService } from '@ngx-translate/core';
import { SensorDialogComponent } from './sensor-dialog.component';
import { Sensor } from '../../../../models/sensor.model';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MapCoordinatePickerComponent } from '../../../../shared/components/map-coordinate-picker/map-coordinate-picker.component';

// Stub the MapCoordinatePickerComponent to avoid Leaflet/Google Maps dependencies
@Component({
  selector: 'app-map-coordinate-picker',
  standalone: true,
  template: '<div class="mock-map-picker"></div>'
})
class MockMapCoordinatePickerComponent {
  @Input() latitude: number | null = null;
  @Input() longitude: number | null = null;
  @Output() coordinatesSelected = new EventEmitter<{ latitude: number; longitude: number }>();
}

describe('SensorDialogComponent', () => {
  let component: SensorDialogComponent;
  let fixture: ComponentFixture<SensorDialogComponent>;

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

  function createComponent(sensor: Sensor | null = null): void {
    TestBed.configureTestingModule({
      imports: [
        SensorDialogComponent,
        ReactiveFormsModule,
        MockMapCoordinatePickerComponent
      ],
      providers: [
        provideTranslateService()
      ]
    }).overrideComponent(SensorDialogComponent, {
      remove: { imports: [MapCoordinatePickerComponent] },
      add: { imports: [MockMapCoordinatePickerComponent] }
    });

    fixture = TestBed.createComponent(SensorDialogComponent);
    component = fixture.componentInstance;
    component.sensor = sensor;
    fixture.detectChanges();
  }

  describe('Create mode', () => {
    beforeEach(() => createComponent(null));

    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize the form with default values in create mode', () => {
      expect(component.isEditMode).toBe(false);
      expect(component.sensorForm.get('name')?.value).toBe('');
      expect(component.sensorForm.get('sensorType')?.value).toBe('ESP32_AIR');
      expect(component.sensorForm.get('sensorStatus')?.value).toBe('ONLINE');
    });

    it('should emit save event with CreateSensorRequest on valid form submit', () => {
      const saveSpy = vi.spyOn(component.save, 'emit');

      component.sensorForm.patchValue({
        name: 'Test Sensor',
        uidSensor: 'ABC123',
        latitude: -12.0,
        longitude: -77.0
      });

      component.onSubmit();

      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({
        uidSensor: 'ABC123',
        name: 'Test Sensor',
        latitude: -12.0,
        longitude: -77.0
      }));
    });

    it('should not emit save event when form is invalid', () => {
      const saveSpy = vi.spyOn(component.save, 'emit');
      component.sensorForm.patchValue({ name: '' });
      component.onSubmit();
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should emit cancel event when onCancel is called', () => {
      const cancelSpy = vi.spyOn(component.cancel, 'emit');
      component.onCancel();
      expect(cancelSpy).toHaveBeenCalled();
    });
  });

  describe('Edit mode', () => {
    beforeEach(() => createComponent(mockSensor));

    it('should be in edit mode when sensor is provided', () => {
      expect(component.isEditMode).toBe(true);
    });

    it('should initialize the form with sensor values', () => {
      expect(component.sensorForm.get('name')?.value).toBe('Sensor Patio Central');
      expect(component.sensorForm.get('sensorStatus')?.value).toBe('ONLINE');
      expect(component.sensorForm.get('latitude')?.value).toBe(-12.046374);
    });

    it('should emit save event with UpdateSensorRequest on valid form submit', () => {
      const saveSpy = vi.spyOn(component.save, 'emit');

      component.sensorForm.patchValue({ name: 'Updated Sensor' });
      component.onSubmit();

      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Updated Sensor',
        sensorStatus: 'ONLINE'
      }));
    });
  });

  describe('Maintenance confirmation modal', () => {
    beforeEach(() => createComponent(mockSensor));

    it('should not show maintenance confirmation modal initially', () => {
      expect(component.showMaintenanceConfirm()).toBe(false);
    });

    it('should show maintenance confirmation modal when selecting MAINTENANCE status', () => {
      component.sensorForm.patchValue({ sensorStatus: 'MAINTENANCE' });
      component.onStatusChange();

      expect(component.showMaintenanceConfirm()).toBe(true);
    });

    it('should not show confirmation modal when switching between ONLINE and OFFLINE', () => {
      component.sensorForm.patchValue({ sensorStatus: 'OFFLINE' });
      component.onStatusChange();

      expect(component.showMaintenanceConfirm()).toBe(false);
    });

    it('should confirm maintenance change and close the modal', () => {
      component.sensorForm.patchValue({ sensorStatus: 'MAINTENANCE' });
      component.onStatusChange();

      expect(component.showMaintenanceConfirm()).toBe(true);

      component.confirmMaintenanceChange();

      expect(component.showMaintenanceConfirm()).toBe(false);
      expect(component.sensorForm.get('sensorStatus')?.value).toBe('MAINTENANCE');
    });

    it('should cancel maintenance change and revert to previous status', () => {
      // Start with ONLINE
      expect(component.sensorForm.get('sensorStatus')?.value).toBe('ONLINE');

      // Try switching to MAINTENANCE
      component.sensorForm.patchValue({ sensorStatus: 'MAINTENANCE' });
      component.onStatusChange();

      // Cancel the change
      component.cancelMaintenanceChange();

      expect(component.showMaintenanceConfirm()).toBe(false);
      expect(component.sensorForm.get('sensorStatus')?.value).toBe('ONLINE');
    });

    it('should not show confirmation if sensor is already in MAINTENANCE mode', () => {
      const maintenanceSensor = { ...mockSensor, sensorStatus: 'MAINTENANCE' as const };
      component.sensor = maintenanceSensor;
      component.ngOnInit();

      // Changing from MAINTENANCE to MAINTENANCE should not trigger
      component.sensorForm.patchValue({ sensorStatus: 'MAINTENANCE' });
      component.onStatusChange();

      expect(component.showMaintenanceConfirm()).toBe(false);
    });

    it('should allow submitting the form with MAINTENANCE status after confirming', () => {
      const saveSpy = vi.spyOn(component.save, 'emit');

      component.sensorForm.patchValue({ sensorStatus: 'MAINTENANCE' });
      component.onStatusChange();
      component.confirmMaintenanceChange();

      component.onSubmit();

      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({
        sensorStatus: 'MAINTENANCE'
      }));
    });
  });

  describe('Coordinate selection', () => {
    beforeEach(() => createComponent(null));

    it('should update form coordinates when onCoordinatesSelected is called', () => {
      component.onCoordinatesSelected({ latitude: -11.5, longitude: -76.5 });

      expect(component.sensorForm.get('latitude')?.value).toBe(-11.5);
      expect(component.sensorForm.get('longitude')?.value).toBe(-76.5);
    });
  });
});
