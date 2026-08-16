import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ElementRef, ViewChild, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Sensor, SensorStatus } from '../../../models/sensor.model';

@Component({
  selector: 'app-sensor-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-full min-h-[350px] rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex flex-col">
      <!-- Leaflet Map Container -->
      <div #mapContainer class="w-full h-full flex-1 min-h-[350px] z-0"></div>

      <!-- Map Legend Overlay -->
      <div *ngIf="showLegend" class="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg shadow border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1.5 z-[1000] pointer-events-none">
        <div class="font-semibold text-[11px] uppercase tracking-wider text-slate-500">Status</div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-xs"></span>
          <span>Online</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-xs"></span>
          <span>Offline</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-xs"></span>
          <span>Maintenance</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    :host ::ng-deep .leaflet-popup-content-wrapper {
      background-color: #0f172a;
      color: #f8fafc;
      border: 1px solid #334155;
      border-radius: 0.75rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
    }
    :host ::ng-deep .leaflet-popup-tip {
      background-color: #0f172a;
    }
    :host ::ng-deep .custom-sensor-marker {
      background: transparent;
      border: none;
    }
  `]
})
export class SensorMapComponent implements OnInit, OnChanges, OnDestroy {
  @Input() sensors: Sensor[] = [];
  @Input() selectedSensorId: number | null = null;
  @Input() center: { lat: number; lng: number } = { lat: -12.046374, lng: -77.042793 };
  @Input() zoom = 12;
  @Input() showLegend = true;
  @Input() showSelectButton = false;
  @Input() allowMapClick = false;

  @Output() sensorSelected = new EventEmitter<Sensor>();
  @Output() mapClicked = new EventEmitter<{ lat: number; lng: number }>();

  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  private map: L.Map | null = null;
  private markersLayer: L.LayerGroup = L.layerGroup();

  ngOnInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map && (changes['sensors'] || changes['selectedSensorId'])) {
      this.updateMarkers();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private initMap(): void {
    if (this.map || !this.mapContainer?.nativeElement) return;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [this.center.lat, this.center.lng],
      zoom: this.zoom,
      zoomControl: true
    });

    // Dark-themed tiles matching the UI aesthetics (CartoDB Dark Matter with OSM fallback)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);

    if (this.allowMapClick) {
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.mapClicked.emit({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
    }

    // Leaflet needs an invalidateSize once rendered in DOM
    setTimeout(() => {
      this.map?.invalidateSize();
      this.updateMarkers();
    }, 150);
  }

  private updateMarkers(): void {
    if (!this.map) return;
    this.markersLayer.clearLayers();

    if (!this.sensors || this.sensors.length === 0) {
      return;
    }

    const bounds: L.LatLngExpression[] = [];

    this.sensors.forEach((sensor) => {
      const lat = sensor.latitude;
      const lng = sensor.longitude;
      if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) return;

      bounds.push([lat, lng]);
      const color = this.getStatusColor(sensor.sensorStatus);
      const isSelected = this.selectedSensorId === sensor.id;

      const markerHtml = `
        <div style="
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          ${isSelected ? 'filter: drop-shadow(0 0 8px #38bdf8); transform: scale(1.15);' : 'filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));'}
          transition: transform 0.2s;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
            <path fill="${color}" stroke="#ffffff" stroke-width="1.5" d="M12 0C7.58 0 4 3.58 4 8c0 5.25 7 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
          </svg>
        </div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: 'custom-sensor-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([lat, lng], { icon, title: sensor.name });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 min-w-[200px] text-slate-100';
      popupContent.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 8px;">
          <strong style="font-size: 13px; color: #fff;">${sensor.name}</strong>
          <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; padding: 2px 6px; border-radius: 9999px; background: ${color}25; color: ${color}; border: 1px solid ${color}60;">
            ${sensor.sensorStatus}
          </span>
        </div>
        <div style="font-size: 11px; line-height: 1.5; color: #cbd5e1;">
          <div><strong style="color:#94a3b8;">UID:</strong> ${sensor.uidSensor}</div>
          <div><strong style="color:#94a3b8;">Type:</strong> ${sensor.sensorType}</div>
          <div><strong style="color:#94a3b8;">Coords:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
          ${sensor.firmwareVersion ? `<div><strong style="color:#94a3b8;">FW:</strong> v${sensor.firmwareVersion}</div>` : ''}
        </div>
      `;

      if (this.showSelectButton) {
        const btnContainer = document.createElement('div');
        btnContainer.style.marginTop = '10px';
        btnContainer.style.paddingTop = '6px';
        btnContainer.style.borderTop = '1px solid #334155';

        const selectBtn = document.createElement('button');
        selectBtn.textContent = 'View Details';
        selectBtn.style.width = '100%';
        selectBtn.style.padding = '4px 8px';
        selectBtn.style.fontSize = '11px';
        selectBtn.style.fontWeight = '600';
        selectBtn.style.color = '#ffffff';
        selectBtn.style.backgroundColor = '#059669';
        selectBtn.style.border = 'none';
        selectBtn.style.borderRadius = '4px';
        selectBtn.style.cursor = 'pointer';
        selectBtn.onclick = () => this.sensorSelected.emit(sensor);

        btnContainer.appendChild(selectBtn);
        popupContent.appendChild(btnContainer);
      }

      marker.bindPopup(popupContent);
      this.markersLayer.addLayer(marker);
    });

    if (bounds.length === 1) {
      this.map.setView(bounds[0], 14);
    } else if (bounds.length > 1) {
      this.map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] });
    }
  }

  getStatusColor(status: SensorStatus): string {
    switch (status) {
      case 'ONLINE': return '#10B981'; // emerald-500
      case 'OFFLINE': return '#EF4444'; // rose-500
      case 'MAINTENANCE': return '#F59E0B'; // amber-500
      default: return '#6B7280';
    }
  }
}
