import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AirQualityReading } from '../../../../models/air-quality.model';

@Component({
  selector: 'app-real-time-cards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- Header & Device Filter -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Real-Time Air Quality
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Live telemetry readings from active monitoring nodes
          </p>
        </div>

        <!-- Device Filter Dropdown -->
        <div class="flex items-center space-x-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <label for="deviceSelect" class="text-xs font-semibold text-slate-500 dark:text-slate-400 pl-2">
            Device:
          </label>
          <select
            id="deviceSelect"
            [ngModel]="selectedDeviceId"
            (ngModelChange)="selectedDeviceIdChange.emit($event)"
            class="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 pr-3 py-1 focus:outline-hidden cursor-pointer"
          >
            <option value="" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Devices</option>
            @for (device of deviceList; track device) {
              <option [value]="device" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {{ device }}
              </option>
            }
          </select>
        </div>
      </div>

      <!-- Metric Cards Grid -->
      @if (readings.length > 0) {
        @for (reading of filteredReadings; track reading.deviceId + reading.time) {
          <div class="space-y-3">
            @if (!selectedDeviceId) {
              <div class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">
                Node: {{ reading.deviceName || reading.deviceId }} ({{ reading.deviceId }})
              </div>
            }

            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <!-- Temperature -->
              <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
                <div class="flex items-center justify-between text-amber-500 mb-2">
                  <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Temp</span>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div class="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {{ reading.temperature | number:'1.1-1' }}<span class="text-sm font-semibold text-slate-500">°C</span>
                </div>
              </div>

              <!-- Humidity -->
              <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
                <div class="flex items-center justify-between text-sky-500 mb-2">
                  <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Humidity</span>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.6 15.12a2 2 0 00-1.18.06l-.427.171A2 2 0 003 17.202v2.396A2.402 2.402 0 005.402 22h13.196A2.402 2.402 0 0021 19.598v-2.396a2 2 0 00-1.572-1.774z" />
                  </svg>
                </div>
                <div class="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {{ reading.humidity | number:'1.1-1' }}<span class="text-sm font-semibold text-slate-500">%</span>
                </div>
              </div>

              <!-- CO2 -->
              <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
                <div class="flex items-center justify-between text-emerald-500 mb-2">
                  <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">CO₂</span>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 001.09-.124M16 13a4 4 0 00-4-4 4 4 0 00-4 4" />
                  </svg>
                </div>
                <div class="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {{ reading.co2 | number:'1.0-1' }}<span class="text-xs font-semibold text-slate-500 ml-0.5">ppm</span>
                </div>
              </div>

              <!-- PM1.0 -->
              <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
                <div class="flex items-center justify-between text-teal-500 mb-2">
                  <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">PM 1.0</span>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div class="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {{ reading.pm1_0 | number:'1.1-1' }}<span class="text-xs font-semibold text-slate-500 ml-0.5">µg/m³</span>
                </div>
              </div>

              <!-- PM2.5 -->
              <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
                <div class="flex items-center justify-between text-indigo-500 mb-2">
                  <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">PM 2.5</span>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div class="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {{ reading.pm2_5 | number:'1.1-1' }}<span class="text-xs font-semibold text-slate-500 ml-0.5">µg/m³</span>
                </div>
              </div>

              <!-- PM10 -->
              <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
                <div class="flex items-center justify-between text-violet-500 mb-2">
                  <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">PM 10</span>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div class="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {{ reading.pm10 | number:'1.1-1' }}<span class="text-xs font-semibold text-slate-500 ml-0.5">µg/m³</span>
                </div>
              </div>
            </div>
          </div>
        }
      } @else {
        <!-- Empty / Loading State -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center">
          <p class="text-sm text-slate-500 dark:text-slate-400">No real-time sensor readings available.</p>
        </div>
      }
    </div>
  `
})
export class RealTimeCardsComponent {
  @Input() readings: AirQualityReading[] = [];
  @Input() deviceList: string[] = [];
  @Input() selectedDeviceId: string = '';
  @Output() selectedDeviceIdChange = new EventEmitter<string>();

  get filteredReadings(): AirQualityReading[] {
    if (!this.selectedDeviceId) {
      return this.readings;
    }
    return this.readings.filter(r => r.deviceId === this.selectedDeviceId);
  }
}
