import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-report-export-menu',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="flex items-center gap-2">
      <!-- PDF Print Button -->
      <button
        (click)="exportPdf.emit()"
        [disabled]="disabled"
        type="button"
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
        [title]="'REPORTS.EXPORT_PDF_TITLE' | translate"
      >
        <svg class="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <span>{{ 'REPORTS.EXPORT_PDF' | translate }}</span>
      </button>

      <!-- Excel Export Button -->
      <button
        (click)="exportExcel.emit()"
        [disabled]="disabled"
        type="button"
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
        [title]="'REPORTS.EXPORT_EXCEL_TITLE' | translate"
      >
        <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>{{ 'REPORTS.EXPORT_EXCEL' | translate }}</span>
      </button>

    </div>
  `
})
export class ReportExportMenuComponent {
  @Input() disabled = false;
  @Output() exportPdf = new EventEmitter<void>();
  @Output() exportExcel = new EventEmitter<void>();
}
