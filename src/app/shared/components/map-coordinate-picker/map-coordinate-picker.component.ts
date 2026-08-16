import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-coordinate-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-2">
      <div class="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <span>Click on the map or drag the marker to adjust coordinates</span>
        <span class="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
          {{ latitude | number:'1.4-4' }}, {{ longitude | number:'1.4-4' }}
        </span>
      </div>

      <div class="relative w-full h-[240px] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
        <div #mapContainer class="w-full h-full z-0"></div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    :host ::ng-deep .custom-picker-marker {
      background: transparent;
      border: none;
    }
  `]
})
export class MapCoordinatePickerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() latitude = -12.046374;
  @Input() longitude = -77.042793;
  @Input() zoom = 14;

  @Output() coordinatesChange = new EventEmitter<{ latitude: number; longitude: number }>();

  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  ngOnInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map && (changes['latitude'] || changes['longitude'])) {
      this.syncPosition();
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

    const lat = typeof this.latitude === 'number' && !isNaN(this.latitude) ? this.latitude : -12.046374;
    const lng = typeof this.longitude === 'number' && !isNaN(this.longitude) ? this.longitude : -77.042793;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [lat, lng],
      zoom: this.zoom,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map);

    const markerHtml = `
      <div style="width: 32px; height: 32px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4)); cursor: grab;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
          <path fill="#10B981" stroke="#ffffff" stroke-width="1.5" d="M12 0C7.58 0 4 3.58 4 8c0 5.25 7 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
        </svg>
      </div>
    `;

    const icon = L.divIcon({
      html: markerHtml,
      className: 'custom-picker-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    this.marker = L.marker([lat, lng], { icon, draggable: true }).addTo(this.map);

    this.marker.on('dragend', () => {
      if (this.marker) {
        const pos = this.marker.getLatLng();
        this.latitude = pos.lat;
        this.longitude = pos.lng;
        this.coordinatesChange.emit({ latitude: pos.lat, longitude: pos.lng });
      }
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (this.marker) {
        this.marker.setLatLng(e.latlng);
        this.latitude = e.latlng.lat;
        this.longitude = e.latlng.lng;
        this.coordinatesChange.emit({ latitude: e.latlng.lat, longitude: e.latlng.lng });
      }
    });

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 150);
  }

  private syncPosition(): void {
    if (this.map && this.marker && typeof this.latitude === 'number' && typeof this.longitude === 'number') {
      const pos: [number, number] = [this.latitude, this.longitude];
      this.marker.setLatLng(pos);
      this.map.panTo(pos);
    }
  }
}
