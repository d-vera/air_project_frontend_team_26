import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { provideTranslateService } from '@ngx-translate/core';
import { ReportDataTableComponent } from './report-data-table.component';
import { AirQualityThresholdService } from '../../../../core/services/air-quality-threshold.service';
import { AirQualityReading } from '../../../../models/air-quality.model';

describe('ReportDataTableComponent', () => {
  let component: ReportDataTableComponent;
  let fixture: ComponentFixture<ReportDataTableComponent>;

  const mockReadings: AirQualityReading[] = [
    {
      deviceId: 'SENSOR-001',
      time: '2026-09-08T10:00:00Z',
      pm2_5: 12.0, // green
      pm10: 20.0,
      pm1_0: 5.0,
      co2: 500,
      temperature: 22.0,
      humidity: 50.0
    },
    {
      deviceId: 'SENSOR-001',
      time: '2026-09-08T11:00:00Z',
      pm2_5: 85.0, // red
      pm10: 160.0,
      pm1_0: 55.0,
      co2: 1600,
      temperature: 35.0,
      humidity: 85.0
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportDataTableComponent],
      providers: [AirQualityThresholdService, provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportDataTableComponent);
    component = fixture.componentInstance;
    component.readings = mockReadings;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter readings by severity', () => {
    expect(component.filteredReadings.length).toBe(2);

    component.selectedStatusFilter = 'green';
    expect(component.filteredReadings.length).toBe(1);
    expect(component.filteredReadings[0].pm2_5).toBe(12.0);

    component.selectedStatusFilter = 'red';
    expect(component.filteredReadings.length).toBe(1);
    expect(component.filteredReadings[0].pm2_5).toBe(85.0);
  });

  it('should paginate correctly', () => {
    component.pageSize = 1;
    expect(component.totalPages).toBe(2);

    component.goToPage(2);
    expect(component.currentPage).toBe(2);
    expect(component.paginatedReadings.length).toBe(1);
  });
});
