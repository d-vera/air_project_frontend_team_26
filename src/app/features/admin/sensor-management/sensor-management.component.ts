import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { SensorService } from '../../../core/services/sensor.service';
import { Sensor, SensorStatus, CreateSensorRequest, UpdateSensorRequest } from '../../../models/sensor.model';
import { SensorMapComponent } from '../../../shared/components/sensor-map/sensor-map.component';
import { SensorDialogComponent } from './sensor-dialog/sensor-dialog.component';

@Component({
  selector: 'app-sensor-management',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, SensorMapComponent, SensorDialogComponent],
  template: `
    <div class="space-y-6">
      <!-- Header Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <span>{{ 'SENSOR.TITLE' | translate }}</span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              Google Maps Active
            </span>
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {{ 'SENSOR.SUBTITLE' | translate }}
          </p>
        </div>

        <div class="flex items-center gap-3 self-start sm:self-auto">
          <!-- Total counter badge -->
          <div class="inline-flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {{ 'SENSOR.TOTAL_SENSORS' | translate }}:
            </span>
            <span class="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
              {{ filteredSensors().length }}
            </span>
          </div>

          <!-- Register Station Button -->
          <button
            (click)="openCreateModal()"
            type="button"
            class="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>{{ 'SENSOR.NEW_SENSOR' | translate }}</span>
          </button>
        </div>
      </div>

      <!-- Toast Feedback Message -->
      @if (toastMessage()) {
        <div class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{{ toastMessage()! | translate }}</span>
          </div>
          <button (click)="toastMessage.set(null)" type="button" class="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 cursor-pointer">
            &times;
          </button>
        </div>
      }

      <!-- Control Bar: Search + Status Filter + View Tabs -->
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <!-- Search Input -->
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            [ngModel]="searchTerm()"
            (ngModelChange)="searchTerm.set($event)"
            [placeholder]="'SENSOR.SEARCH_PLACEHOLDER' | translate"
            class="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition shadow-xs"
          />
        </div>

        <div class="flex items-center gap-3">
          <!-- Status Filter Dropdown -->
          <select
            [ngModel]="selectedStatus()"
            (ngModelChange)="selectedStatus.set($event)"
            class="px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
          >
            <option value="ALL">{{ 'SENSOR.ALL_STATUS' | translate }}</option>
            <option value="ONLINE">{{ 'SENSOR.STATUS_ONLINE' | translate }}</option>
            <option value="OFFLINE">{{ 'SENSOR.STATUS_OFFLINE' | translate }}</option>
            <option value="MAINTENANCE">{{ 'SENSOR.STATUS_MAINTENANCE' | translate }}</option>
          </select>

          <!-- View Tabs (Table vs Map) -->
          <div class="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              (click)="activeTab.set('table')"
              type="button"
              class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              [ngClass]="activeTab() === 'table' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>{{ 'SENSOR.TAB_TABLE' | translate }}</span>
            </button>
            <button
              (click)="activeTab.set('map')"
              type="button"
              class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              [ngClass]="activeTab() === 'map' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span>{{ 'SENSOR.TAB_MAP' | translate }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading Spinner -->
      @if (loading()) {
        <div class="p-12 text-center text-slate-400">
          <svg class="animate-spin h-8 w-8 mx-auto mb-2 text-emerald-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-sm font-medium">{{ 'COMMON.LOADING' | translate }}</p>
        </div>
      }

      <!-- Empty State -->
      @if (!loading() && filteredSensors().length === 0) {
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">
            {{ 'SENSOR.NO_SENSORS' | translate }}
          </h3>
        </div>
      }

      <!-- Main Content Views -->
      @if (!loading() && filteredSensors().length > 0) {
        
        <!-- MAP TAB VIEW -->
        @if (activeTab() === 'map') {
          <div class="h-[550px] w-full rounded-3xl overflow-hidden shadow-md">
            <app-sensor-map
              [sensors]="filteredSensors()"
              [showSelectButton]="true"
              (sensorSelected)="openEditModal($event)"
            ></app-sensor-map>
          </div>
        }

        <!-- TABLE TAB VIEW -->
        @if (activeTab() === 'table') {
          <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th class="py-3.5 px-4 sm:px-6">{{ 'SENSOR.NAME' | translate }}</th>
                    <th class="py-3.5 px-4">{{ 'SENSOR.UID' | translate }}</th>
                    <th class="py-3.5 px-4">{{ 'SENSOR.STATUS' | translate }}</th>
                    <th class="py-3.5 px-4">{{ 'SENSOR.LATITUDE' | translate }} / {{ 'SENSOR.LONGITUDE' | translate }}</th>
                    <th class="py-3.5 px-4">{{ 'SENSOR.FIRMWARE' | translate }}</th>
                    <th class="py-3.5 px-4">{{ 'SENSOR.LAST_SEEN' | translate }}</th>
                    <th class="py-3.5 px-4 text-right sm:pr-6">{{ 'SENSOR.ACTIONS' | translate }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                  @for (s of filteredSensors(); track s.id) {
                    <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <!-- Name & Type -->
                      <td class="py-3.5 px-4 sm:px-6">
                        <div class="font-bold text-slate-900 dark:text-slate-100">{{ s.name }}</div>
                        <div class="text-[11px] text-slate-500 font-mono">{{ s.sensorType }}</div>
                      </td>

                      <!-- UID -->
                      <td class="py-3.5 px-4">
                        <span class="font-mono text-slate-700 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {{ s.uidSensor }}
                        </span>
                      </td>

                      <!-- Status -->
                      <td class="py-3.5 px-4">
                        <span
                          class="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
                          [ngClass]="{
                            'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300': s.sensorStatus === 'ONLINE',
                            'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300': s.sensorStatus === 'OFFLINE',
                            'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300': s.sensorStatus === 'MAINTENANCE'
                          }"
                        >
                          <span class="w-1.5 h-1.5 rounded-full" [ngClass]="{
                            'bg-emerald-500': s.sensorStatus === 'ONLINE',
                            'bg-rose-500': s.sensorStatus === 'OFFLINE',
                            'bg-amber-500': s.sensorStatus === 'MAINTENANCE'
                          }"></span>
                          <span>{{ s.sensorStatus }}</span>
                        </span>
                      </td>

                      <!-- Coordinates -->
                      <td class="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {{ s.latitude | number:'1.4-4' }}, {{ s.longitude | number:'1.4-4' }}
                      </td>

                      <!-- Firmware -->
                      <td class="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono">
                        v{{ s.firmwareVersion || '1.0.0' }}
                      </td>

                      <!-- Last Seen -->
                      <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {{ s.lastSeen ? (s.lastSeen | date:'short') : '--' }}
                      </td>

                      <!-- Actions -->
                      <td class="py-3.5 px-4 text-right sm:pr-6 space-x-2">
                        <button
                          (click)="openEditModal(s)"
                          type="button"
                          class="px-2.5 py-1 rounded-lg font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                        >
                          {{ 'PROFILE.EDIT_PROFILE' | translate }}
                        </button>
                        <button
                          (click)="openDeleteModal(s)"
                          type="button"
                          class="px-2.5 py-1 rounded-lg font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 transition cursor-pointer"
                        >
                          {{ 'ADMIN.DEACTIVATE' | translate }}
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      }

      <!-- Sensor Form Dialog (Create / Edit) -->
      @if (isDialogOpen()) {
        <app-sensor-dialog
          [sensor]="selectedSensorForEdit()"
          (save)="onSaveSensor($event)"
          (cancel)="closeDialog()"
        ></app-sensor-dialog>
      }

      <!-- Delete Confirmation Modal -->
      @if (deleteModalSensor()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-scale-in">
            <div class="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">
                {{ 'SENSOR.CONFIRM_DELETE_TITLE' | translate }}
              </h3>
              <p class="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {{ 'SENSOR.CONFIRM_DELETE_MSG' | translate:{ name: deleteModalSensor()?.name, uid: deleteModalSensor()?.uidSensor } }}
              </p>
            </div>

            <div class="flex items-center justify-end space-x-3 pt-2">
              <button
                (click)="deleteModalSensor.set(null)"
                type="button"
                class="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {{ 'SENSOR.CANCEL_BTN' | translate }}
              </button>
              <button
                (click)="confirmDelete()"
                type="button"
                class="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-rose-600 hover:bg-rose-700 transition shadow-md shadow-rose-600/20 cursor-pointer"
              >
                {{ 'SENSOR.DELETE_BTN' | translate }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class SensorManagementComponent implements OnInit {
  private sensorService = inject(SensorService);

  sensors = signal<Sensor[]>([]);
  loading = signal<boolean>(true);
  searchTerm = signal<string>('');
  selectedStatus = signal<string>('ALL');
  activeTab = signal<'table' | 'map'>('table');
  toastMessage = signal<string | null>(null);

  isDialogOpen = signal<boolean>(false);
  selectedSensorForEdit = signal<Sensor | null>(null);
  deleteModalSensor = signal<Sensor | null>(null);

  filteredSensors = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.selectedStatus();

    return this.sensors().filter((s) => {
      const matchesTerm = !term ||
        s.name.toLowerCase().includes(term) ||
        s.uidSensor.toLowerCase().includes(term) ||
        s.sensorType.toLowerCase().includes(term);

      const matchesStatus = status === 'ALL' || s.sensorStatus === status;

      return matchesTerm && matchesStatus;
    });
  });

  ngOnInit(): void {
    this.loadSensors();
  }

  loadSensors(): void {
    this.loading.set(true);
    this.sensorService.getSensors(true).subscribe({
      next: (data) => {
        this.sensors.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.selectedSensorForEdit.set(null);
    this.isDialogOpen.set(true);
  }

  openEditModal(sensor: Sensor): void {
    this.selectedSensorForEdit.set(sensor);
    this.isDialogOpen.set(true);
  }

  closeDialog(): void {
    this.isDialogOpen.set(false);
    this.selectedSensorForEdit.set(null);
  }

  onSaveSensor(payload: CreateSensorRequest | UpdateSensorRequest): void {
    const current = this.selectedSensorForEdit();
    if (current) {
      this.sensorService.updateSensor(current.id, payload as UpdateSensorRequest).subscribe({
        next: () => {
          this.toastMessage.set('SENSOR.SAVE_SUCCESS');
          this.closeDialog();
          this.loadSensors();
        }
      });
    } else {
      this.sensorService.createSensor(payload as CreateSensorRequest).subscribe({
        next: () => {
          this.toastMessage.set('SENSOR.SAVE_SUCCESS');
          this.closeDialog();
          this.loadSensors();
        }
      });
    }
  }

  openDeleteModal(sensor: Sensor): void {
    this.deleteModalSensor.set(sensor);
  }

  confirmDelete(): void {
    const s = this.deleteModalSensor();
    if (!s) return;

    this.sensorService.deleteSensor(s.id).subscribe({
      next: () => {
        this.toastMessage.set('SENSOR.DELETE_SUCCESS');
        this.deleteModalSensor.set(null);
        this.loadSensors();
      },
      error: () => {
        this.deleteModalSensor.set(null);
      }
    });
  }
}
