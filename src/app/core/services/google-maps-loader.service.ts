import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsLoaderService {
  private loaded = false;
  private loadPromise: Promise<boolean> | null = null;

  load(): Promise<boolean> {
    if (this.loaded || (typeof window !== 'undefined' && (window as any).google?.maps)) {
      this.loaded = true;
      return Promise.resolve(true);
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve) => {
      if (typeof document === 'undefined') {
        resolve(false);
        return;
      }

      const scriptId = 'google-maps-api-script';
      if (document.getElementById(scriptId)) {
        this.loaded = true;
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      const key = environment.googleMapsApiKey;
      const keyParam = key ? `&key=${key}` : '';
      script.src = `https://maps.googleapis.com/maps/api/js?loading=async${keyParam}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.loaded = true;
        resolve(true);
      };

      script.onerror = () => {
        console.warn('Google Maps API failed to load. Check API key or network connection.');
        resolve(false);
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }
}
