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

  describe('Merged Comparison Mode', () => {
    const comparisonReadings: AirQualityReading[] = [
      {
        deviceId: 'SENSOR-001',
        time: '2026-09-09T10:00:00Z',
        pm2_5: 14.0, // green
        pm10: 22.0,
        pm1_0: 6.0,
        co2: 520,
        temperature: 23.0,
        humidity: 52.0
      },
      {
        deviceId: 'SENSOR-001',
        time: '2026-09-09T12:00:00Z',
        pm2_5: 90.0, // red
        pm10: 170.0,
        pm1_0: 60.0,
        co2: 1700,
        temperature: 36.0,
        humidity: 88.0
      }
    ];

    beforeEach(() => {
      fixture.componentRef.setInput('primaryReadings', mockReadings);
      fixture.componentRef.setInput('comparisonReadings', comparisonReadings);
      fixture.componentRef.setInput('primaryLabel', '2026-09-08');
      fixture.componentRef.setInput('comparisonLabel', '2026-09-09');
      fixture.detectChanges();
    });

    it('should detect comparison data and combine primary and comparison rows', () => {
      expect(component.hasComparison).toBe(true);
      expect(component.allMergedRows.length).toBe(4);
      expect(component.filteredRows.length).toBe(4);
    });

    it('should filter rows by period', () => {
      component.selectedPeriodFilter = 'primary';
      expect(component.filteredRows.length).toBe(2);
      expect(component.filteredRows.every(r => r.period === 'primary')).toBe(true);

      component.selectedPeriodFilter = 'comparison';
      expect(component.filteredRows.length).toBe(2);
      expect(component.filteredRows.every(r => r.period === 'comparison')).toBe(true);

      component.selectedPeriodFilter = 'ALL';
      expect(component.filteredRows.length).toBe(4);
    });

    it('should combine period filtering with severity filtering', () => {
      component.selectedPeriodFilter = 'comparison';
      component.selectedStatusFilter = 'green';
      expect(component.filteredRows.length).toBe(1);
      expect(component.filteredRows[0].reading.pm2_5).toBe(14.0);

      component.selectedStatusFilter = 'red';
      expect(component.filteredRows.length).toBe(1);
      expect(component.filteredRows[0].reading.pm2_5).toBe(90.0);
    });

    it('should render period column and badges in template', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const headers = compiled.querySelectorAll('th');
      const headerTexts = Array.from(headers).map(h => h.textContent?.trim());
      expect(component.hasComparison).toBe(true);
      expect(headers.length).toBe(9);
      expect(headerTexts).toContain('REPORTS.TABLE_PERIOD');

      const primaryBadges = compiled.querySelectorAll('.text-sky-700, .dark\\:text-sky-300');
      expect(primaryBadges.length).toBeGreaterThan(0);
    });
  });
});
