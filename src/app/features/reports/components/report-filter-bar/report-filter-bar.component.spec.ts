import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideTranslateService } from '@ngx-translate/core';
import { ReportFilterBarComponent } from './report-filter-bar.component';
import { Sensor } from '../../../../models/sensor.model';

describe('ReportFilterBarComponent', () => {
  let component: ReportFilterBarComponent;
  let fixture: ComponentFixture<ReportFilterBarComponent>;

  const mockSensors: Sensor[] = [
    {
      id: 1,
      uidSensor: 'SENSOR-001',
      name: 'Station Alpha',
      sensorType: 'ESP32_AIR',
      latitude: -12.0,
      longitude: -77.0,
      firmwareVersion: '1.0.0',
      sensorStatus: 'ONLINE',
      lastSeen: null,
      userId: null,
      active: true,
      createdAt: '',
      updatedAt: ''
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportFilterBarComponent],
      providers: [provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportFilterBarComponent);
    component = fixture.componentInstance;
    component.sensors = mockSensors;
    component.selectedSensorUid = 'SENSOR-001';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit sensorChange when sensor is changed', () => {
    const spy = vi.spyOn(component.sensorChange, 'emit');
    component.onSensorChange('SENSOR-002');
    expect(spy).toHaveBeenCalledWith('SENSOR-002');
  });

  it('should emit shortcutChange when timeframe shortcut is clicked', () => {
    const spy = vi.spyOn(component.shortcutChange, 'emit');
    component.onShortcutSelect('7d');
    expect(spy).toHaveBeenCalledWith('7d');
  });

  it('should emit comparisonToggle when toggle is changed', () => {
    const spy = vi.spyOn(component.comparisonToggle, 'emit');
    const event = { target: { checked: true } } as unknown as Event;
    component.onToggleComparison(event);
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should emit generateReport when generate button is clicked', () => {
    const spy = vi.spyOn(component.generateReport, 'emit');
    component.onGenerate();
    expect(spy).toHaveBeenCalled();
  });

  it('should display GENERATE_COMPARISON and light purple style when comparisonEnabled is false', () => {
    component.comparisonEnabled = false;
    fixture.detectChanges();

    const buttonEl = fixture.nativeElement.querySelector('button[type="button"]');
    expect(buttonEl.textContent).toContain('REPORTS.GENERATE_COMPARISON');
    expect(buttonEl.classList.contains('bg-violet-400')).toBe(true);
    expect(buttonEl.classList.contains('bg-violet-600')).toBe(false);
  });

  it('should display GENERATE_COMPARISON and strong purple style when comparisonEnabled is true', () => {
    component.comparisonEnabled = true;
    fixture.detectChanges();

    const buttonEl = fixture.nativeElement.querySelector('button[type="button"]');
    expect(buttonEl.textContent).toContain('REPORTS.GENERATE_COMPARISON');
    expect(buttonEl.classList.contains('bg-violet-600')).toBe(true);
    expect(buttonEl.classList.contains('bg-violet-400')).toBe(false);
  });

  it('should show only custom date inputs and no shortcut buttons in compare periods when activated', () => {
    component.comparisonEnabled = true;
    fixture.detectChanges();

    const compareSection = fixture.nativeElement.querySelector('.bg-violet-50\\/60');
    expect(compareSection).toBeTruthy();

    // Custom date inputs should exist
    const dateInputs = compareSection.querySelectorAll('input[type="date"]');
    expect(dateInputs.length).toBe(2);

    // No shortcut buttons should be rendered inside compare section
    const shortcutButtons = compareSection.querySelectorAll('button');
    expect(shortcutButtons.length).toBe(0);
  });

  it('should emit comparisonCustomFromChange and comparisonCustomToChange', () => {
    const fromSpy = vi.spyOn(component.comparisonCustomFromChange, 'emit');
    const toSpy = vi.spyOn(component.comparisonCustomToChange, 'emit');

    component.onComparisonFromChange('2026-08-01');
    expect(fromSpy).toHaveBeenCalledWith('2026-08-01');

    component.onComparisonToChange('2026-08-31');
    expect(toSpy).toHaveBeenCalledWith('2026-08-31');
  });
});
