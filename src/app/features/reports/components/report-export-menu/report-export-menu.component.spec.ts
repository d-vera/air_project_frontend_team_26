import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideTranslateService } from '@ngx-translate/core';
import { ReportExportMenuComponent } from './report-export-menu.component';

describe('ReportExportMenuComponent', () => {
  let component: ReportExportMenuComponent;
  let fixture: ComponentFixture<ReportExportMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportExportMenuComponent],
      providers: [provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportExportMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit exportPdf when PDF button is clicked', () => {
    const spy = vi.spyOn(component.exportPdf, 'emit');
    component.exportPdf.emit();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit exportExcel when Excel button is clicked', () => {
    const spy = vi.spyOn(component.exportExcel, 'emit');
    component.exportExcel.emit();
    expect(spy).toHaveBeenCalled();
  });

  it('should render only PDF and Excel export buttons', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(2);
  });
});
