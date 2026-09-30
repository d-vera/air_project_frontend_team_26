import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SensorManagementComponent } from './sensor-management.component';
import { SensorService } from '../../../core/services/sensor.service';
import { AuthService } from '../../../core/services/auth.service';
import { Sensor, CreateSensorRequest, UpdateSensorRequest } from '../../../models/sensor.model';

// Stub child components to avoid Leaflet/Google Maps dependencies
@Component({
  selector: 'app-sensor-map',
  standalone: true,
  template: '<div class="mock-sensor-map"></div>'
})
class MockSensorMapComponent {
  @Input() sensors: Sensor[] = [];
  @Input() showSelectButton = false;
  @Input() showLegend = false;
  @Output() sensorSelected = new EventEmitter<Sensor>();
}

@Component({
  selector: 'app-sensor-dialog',
  standalone: true,
  template: '<div class="mock-sensor-dialog"></div>'
})
class MockSensorDialogComponent {
  @Input() sensor: Sensor | null = null;
  @Output() save = new EventEmitter<CreateSensorRequest | UpdateSensorRequest>();
  @Output() cancel = new EventEmitter<void>();
}

describe('SensorManagementComponent', () => {
  let component: SensorManagementComponent;
  let fixture: ComponentFixture<SensorManagementComponent>;
  let mockSensorService: {
    getSensors: ReturnType<typeof vi.fn>;
    createSensor: ReturnType<typeof vi.fn>;
    updateSensor: ReturnType<typeof vi.fn>;
    deleteSensor: ReturnType<typeof vi.fn>;
    reactivateSensor: ReturnType<typeof vi.fn>;
  };
  let mockAuthService: {
    isAdmin: ReturnType<typeof vi.fn>;
    isAuthenticated: ReturnType<typeof vi.fn>;
  };

  const activeSensor: Sensor = {
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

  const inactiveSensor: Sensor = {
    ...activeSensor,
    id: 2,
    uidSensor: 'B189DF621C11',
    name: 'Sensor Laboratorio Norte',
    active: false,
    sensorStatus: 'OFFLINE'
  };

  const maintenanceSensor: Sensor = {
    ...activeSensor,
    id: 3,
    uidSensor: 'C993AF718223',
    name: 'Sensor Estacionamiento Sur',
    sensorStatus: 'MAINTENANCE'
  };

  beforeEach(() => {
    mockSensorService = {
      getSensors: vi.fn().mockReturnValue(of([activeSensor, inactiveSensor, maintenanceSensor])),
      createSensor: vi.fn().mockReturnValue(of(activeSensor)),
      updateSensor: vi.fn().mockReturnValue(of(activeSensor)),
      deleteSensor: vi.fn().mockReturnValue(of(void 0)),
      reactivateSensor: vi.fn().mockReturnValue(of({ ...inactiveSensor, active: true, sensorStatus: 'OFFLINE' }))
    };

    mockAuthService = {
      isAdmin: vi.fn().mockReturnValue(true),
      isAuthenticated: vi.fn().mockReturnValue(true)
    };

    TestBed.configureTestingModule({
      imports: [
        SensorManagementComponent,
        FormsModule,
        MockSensorMapComponent,
        MockSensorDialogComponent
      ],
      providers: [
        provideTranslateService(),
        { provide: SensorService, useValue: mockSensorService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).overrideComponent(SensorManagementComponent, {
      remove: { imports: [] },
      add: { imports: [MockSensorMapComponent, MockSensorDialogComponent] }
    });

    fixture = TestBed.createComponent(SensorManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load sensors on init', () => {
    expect(mockSensorService.getSensors).toHaveBeenCalledWith(true, false);
    expect(component.sensors().length).toBe(3);
    expect(component.loading()).toBe(false);
  });

  describe('Inactive toggle', () => {
    it('should reload sensors with includeInactive true when toggle is turned on', () => {
      mockSensorService.getSensors.mockClear();
      component.onToggleInactive(true);

      expect(component.showInactive()).toBe(true);
      expect(mockSensorService.getSensors).toHaveBeenCalledWith(true, true);
    });

    it('should reload sensors with includeInactive false when toggle is turned off', () => {
      component.showInactive.set(true);
      mockSensorService.getSensors.mockClear();
      component.onToggleInactive(false);

      expect(component.showInactive()).toBe(false);
      expect(mockSensorService.getSensors).toHaveBeenCalledWith(true, false);
    });
  });

  describe('Filtering', () => {
    it('should filter sensors by search term', () => {
      component.searchTerm.set('patio');
      expect(component.filteredSensors().length).toBe(1);
      expect(component.filteredSensors()[0].name).toBe('Sensor Patio Central');
    });

    it('should filter sensors by status', () => {
      component.showInactive.set(true); // show all
      component.selectedStatus.set('ONLINE');
      expect(component.filteredSensors().every(s => s.sensorStatus === 'ONLINE')).toBe(true);
    });

    it('should filter out inactive sensors by default', () => {
      expect(component.showInactive()).toBe(false);
      const filtered = component.filteredSensors();
      expect(filtered.every(s => s.active)).toBe(true);
      expect(filtered.find(s => s.id === 2)).toBeUndefined();
    });

    it('should show inactive sensors when toggle is enabled', () => {
      component.showInactive.set(true);
      const filtered = component.filteredSensors();
      expect(filtered.find(s => s.id === 2)).toBeTruthy();
    });

    it('should filter by MAINTENANCE status', () => {
      component.selectedStatus.set('MAINTENANCE');
      const filtered = component.filteredSensors();
      expect(filtered.length).toBe(1);
      expect(filtered[0].sensorStatus).toBe('MAINTENANCE');
    });
  });

  describe('Delete flow', () => {
    it('should open delete modal for active sensor', () => {
      component.openDeleteModal(activeSensor);
      expect(component.deleteModalSensor()).toEqual(activeSensor);
    });

    it('should call deleteSensor and reload on confirm', () => {
      component.openDeleteModal(activeSensor);
      component.confirmDelete();

      expect(mockSensorService.deleteSensor).toHaveBeenCalledWith(1);
      expect(component.deleteModalSensor()).toBeNull();
      expect(component.toastMessage()).toBe('SENSOR.DELETE_SUCCESS');
    });

    it('should close modal on error', () => {
      mockSensorService.deleteSensor.mockReturnValue(throwError(() => new Error('fail')));
      component.openDeleteModal(activeSensor);
      component.confirmDelete();

      expect(component.deleteModalSensor()).toBeNull();
    });
  });

  describe('Reactivation flow', () => {
    it('should open reactivate modal for inactive sensor', () => {
      component.openReactivateModal(inactiveSensor);
      expect(component.reactivateModalSensor()).toEqual(inactiveSensor);
    });

    it('should call reactivateSensor and reload on confirm', () => {
      component.openReactivateModal(inactiveSensor);
      component.confirmReactivate();

      expect(mockSensorService.reactivateSensor).toHaveBeenCalledWith(2);
      expect(component.reactivateModalSensor()).toBeNull();
      expect(component.toastMessage()).toBe('SENSOR.REACTIVATE_SUCCESS');
    });

    it('should close modal on reactivation error', () => {
      mockSensorService.reactivateSensor.mockReturnValue(throwError(() => new Error('fail')));
      component.openReactivateModal(inactiveSensor);
      component.confirmReactivate();

      expect(component.reactivateModalSensor()).toBeNull();
    });
  });

  describe('Dialog flow', () => {
    it('should open create modal with no sensor selected', () => {
      component.openCreateModal();
      expect(component.isDialogOpen()).toBe(true);
      expect(component.selectedSensorForEdit()).toBeNull();
    });

    it('should open edit modal with sensor selected', () => {
      component.openEditModal(activeSensor);
      expect(component.isDialogOpen()).toBe(true);
      expect(component.selectedSensorForEdit()).toEqual(activeSensor);
    });

    it('should close dialog and clear selected sensor', () => {
      component.openEditModal(activeSensor);
      component.closeDialog();
      expect(component.isDialogOpen()).toBe(false);
      expect(component.selectedSensorForEdit()).toBeNull();
    });

    it('should call createSensor for new sensor', () => {
      component.openCreateModal();
      const payload: CreateSensorRequest = {
        uidSensor: 'NEW123',
        name: 'New Sensor',
        latitude: -12.0,
        longitude: -77.0
      };
      component.onSaveSensor(payload);

      expect(mockSensorService.createSensor).toHaveBeenCalledWith(payload);
      expect(component.toastMessage()).toBe('SENSOR.SAVE_SUCCESS');
    });

    it('should call updateSensor for existing sensor', () => {
      component.openEditModal(activeSensor);
      const payload: UpdateSensorRequest = { name: 'Updated Name' };
      component.onSaveSensor(payload);

      expect(mockSensorService.updateSensor).toHaveBeenCalledWith(1, payload);
      expect(component.toastMessage()).toBe('SENSOR.SAVE_SUCCESS');
    });
  });

  describe('View tabs', () => {
    it('should default to table view', () => {
      expect(component.activeTab()).toBe('table');
    });

    it('should switch to map view', () => {
      component.activeTab.set('map');
      expect(component.activeTab()).toBe('map');
    });
  });

  describe('Status internationalization (i18n)', () => {
    let translate: TranslateService;

    beforeEach(() => {
      translate = TestBed.inject(TranslateService);
      translate.setTranslation('en', {
        SENSOR: {
          STATUS_ONLINE: 'Online',
          STATUS_OFFLINE: 'Offline',
          STATUS_MAINTENANCE: 'Maintenance'
        }
      });
      translate.setTranslation('es', {
        SENSOR: {
          STATUS_ONLINE: 'En Línea',
          STATUS_OFFLINE: 'Desconectado',
          STATUS_MAINTENANCE: 'Mantenimiento'
        }
      });
      translate.use('en');
      component.showInactive.set(true);
      fixture.detectChanges();
    });

    it('should render sensor status in English when language is en', () => {
      translate.use('en');
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Online');
      expect(compiled.textContent).toContain('Maintenance');
    });

    it('should render sensor status in Spanish when language is es', () => {
      translate.use('es');
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('En Línea');
      expect(compiled.textContent).toContain('Desconectado');
      expect(compiled.textContent).toContain('Mantenimiento');
    });
  });
});
