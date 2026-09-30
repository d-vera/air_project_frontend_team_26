import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Sensor, SensorStatus, CreateSensorRequest, UpdateSensorRequest } from '../../../../models/sensor.model';
import { MapCoordinatePickerComponent } from '../../../../shared/components/map-coordinate-picker/map-coordinate-picker.component';

@Component({
  selector: 'app-sensor-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, MapCoordinatePickerComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">
                {{ (isEditMode ? 'SENSOR.EDIT_SENSOR' : 'SENSOR.NEW_SENSOR') | translate }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ isEditMode ? sensor?.uidSensor : 'Configure station parameters & location' }}
              </p>
            </div>
          </div>

          <button
            (click)="onCancel()"
            type="button"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl font-semibold leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        <!-- Form -->
        <form [formGroup]="sensorForm" (ngSubmit)="onSubmit()" class="space-y-4">
          
          <!-- Station Name -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {{ 'SENSOR.NAME' | translate }} *
            </label>
            <input
              type="text"
              formControlName="name"
              placeholder="e.g. Patio Central Station"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div *ngIf="sensorForm.get('name')?.touched && sensorForm.get('name')?.invalid" class="text-xs text-rose-500 mt-1">
              Name is required.
            </div>
          </div>

          <!-- UID (Disabled in edit mode) & Type -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {{ 'SENSOR.UID' | translate }} *
              </label>
              <input
                type="text"
                formControlName="uidSensor"
                [readonly]="isEditMode"
                placeholder="e.g. ACEA5AC8E720"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-mono disabled:opacity-60"
              />
              <div *ngIf="sensorForm.get('uidSensor')?.touched && sensorForm.get('uidSensor')?.invalid" class="text-xs text-rose-500 mt-1">
                Hardware UID is required.
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {{ 'SENSOR.TYPE' | translate }}
              </label>
              <input
                type="text"
                formControlName="sensorType"
                placeholder="e.g. ESP32_AIR"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <!-- Status (Only in Edit Mode) & Firmware Version -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div *ngIf="isEditMode">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {{ 'SENSOR.STATUS' | translate }}
              </label>
              <select
                formControlName="sensorStatus"
                (change)="onStatusChange()"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ONLINE">{{ 'SENSOR.STATUS_ONLINE' | translate }}</option>
                <option value="OFFLINE">{{ 'SENSOR.STATUS_OFFLINE' | translate }}</option>
                <option value="MAINTENANCE">{{ 'SENSOR.STATUS_MAINTENANCE' | translate }}</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {{ 'SENSOR.FIRMWARE' | translate }}
              </label>
              <input
                type="text"
                formControlName="firmwareVersion"
                placeholder="e.g. 1.0.2"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <!-- Coordinates & Interactive Map Picker -->
          <div class="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {{ 'SENSOR.LATITUDE' | translate }} *
                </label>
                <input
                  type="number"
                  step="any"
                  formControlName="latitude"
                  placeholder="-12.046374"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {{ 'SENSOR.LONGITUDE' | translate }} *
                </label>
                <input
                  type="number"
                  step="any"
                  formControlName="longitude"
                  placeholder="-77.042793"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <!-- Map Coordinate Picker Widget -->
            <app-map-coordinate-picker
              [latitude]="sensorForm.get('latitude')?.value"
              [longitude]="sensorForm.get('longitude')?.value"
              (coordinatesChange)="onCoordinatesSelected($event)"
            ></app-map-coordinate-picker>
          </div>

          <!-- Form Action Buttons -->
          <div class="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              (click)="onCancel()"
              type="button"
              class="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {{ 'SENSOR.CANCEL_BTN' | translate }}
            </button>
            <button
              type="submit"
              [disabled]="sensorForm.invalid || isSubmitting"
              class="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              {{ (isEditMode ? 'SENSOR.SAVE_BTN' : 'SENSOR.CREATE_BTN') | translate }}
            </button>
          </div>
        </form>

      </div>
    </div>

    <!-- Maintenance Confirmation Modal -->
    @if (showMaintenanceConfirm()) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-scale-in">
          <div class="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">
              {{ 'SENSOR.MAINTENANCE_CONFIRM_TITLE' | translate }}
            </h3>
            <p class="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {{ 'SENSOR.MAINTENANCE_CONFIRM_MSG' | translate }}
            </p>
          </div>

          <div class="flex items-center justify-end space-x-3 pt-2">
            <button
              (click)="cancelMaintenanceChange()"
              type="button"
              class="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {{ 'SENSOR.CANCEL_BTN' | translate }}
            </button>
            <button
              (click)="confirmMaintenanceChange()"
              type="button"
              class="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-amber-600 hover:bg-amber-700 transition shadow-md shadow-amber-600/20 cursor-pointer"
            >
              {{ 'SENSOR.MAINTENANCE_CONFIRM_BTN' | translate }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class SensorDialogComponent implements OnInit {
  @Input() sensor: Sensor | null = null;
  @Output() save = new EventEmitter<CreateSensorRequest | UpdateSensorRequest>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  sensorForm!: FormGroup;
  isSubmitting = false;

  showMaintenanceConfirm = signal<boolean>(false);
  private previousStatus: SensorStatus = 'ONLINE';

  get isEditMode(): boolean {
    return !!this.sensor;
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.previousStatus = this.sensor?.sensorStatus || 'ONLINE';
    this.sensorForm = this.fb.group({
      name: [this.sensor?.name || '', [Validators.required]],
      uidSensor: [{ value: this.sensor?.uidSensor || '', disabled: this.isEditMode }, [Validators.required]],
      sensorType: [this.sensor?.sensorType || 'ESP32_AIR'],
      firmwareVersion: [this.sensor?.firmwareVersion || '1.0.0'],
      sensorStatus: [this.sensor?.sensorStatus || 'ONLINE'],
      latitude: [this.sensor?.latitude ?? -12.046374, [Validators.required]],
      longitude: [this.sensor?.longitude ?? -77.042793, [Validators.required]]
    });
  }

  onStatusChange(): void {
    const newStatus = this.sensorForm.get('sensorStatus')?.value as SensorStatus;
    if (newStatus === 'MAINTENANCE' && this.previousStatus !== 'MAINTENANCE') {
      this.showMaintenanceConfirm.set(true);
    } else {
      this.previousStatus = newStatus;
    }
  }

  confirmMaintenanceChange(): void {
    this.previousStatus = 'MAINTENANCE';
    this.showMaintenanceConfirm.set(false);
  }

  cancelMaintenanceChange(): void {
    this.sensorForm.patchValue({ sensorStatus: this.previousStatus });
    this.showMaintenanceConfirm.set(false);
  }

  onCoordinatesSelected(coords: { latitude: number; longitude: number }): void {
    this.sensorForm.patchValue({
      latitude: coords.latitude,
      longitude: coords.longitude
    });
  }

  onSubmit(): void {
    if (this.sensorForm.invalid) return;

    const rawValues = this.sensorForm.getRawValue();

    if (this.isEditMode) {
      const updatePayload: UpdateSensorRequest = {
        name: rawValues.name,
        sensorType: rawValues.sensorType,
        latitude: Number(rawValues.latitude),
        longitude: Number(rawValues.longitude),
        firmwareVersion: rawValues.firmwareVersion,
        sensorStatus: rawValues.sensorStatus
      };
      this.save.emit(updatePayload);
    } else {
      const createPayload: CreateSensorRequest = {
        uidSensor: rawValues.uidSensor.trim(),
        name: rawValues.name,
        sensorType: rawValues.sensorType,
        latitude: Number(rawValues.latitude),
        longitude: Number(rawValues.longitude),
        firmwareVersion: rawValues.firmwareVersion
      };
      this.save.emit(createPayload);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}

