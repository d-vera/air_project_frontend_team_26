import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Sensor, CreateSensorRequest, UpdateSensorRequest } from '../../models/sensor.model';

@Injectable({
  providedIn: 'root'
})
export class SensorService {
  private http = inject(HttpClient);
  private baseUrl = '/api/sensors';

  private sensorsSubject = new BehaviorSubject<Sensor[]>([]);
  public sensors$ = this.sensorsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private lastIncludeInactive = false;

  getSensors(refresh = false, includeInactive = false): Observable<Sensor[]> {
    if (refresh || this.sensorsSubject.value.length === 0 || this.lastIncludeInactive !== includeInactive) {
      this.loadingSubject.next(true);
      const options = includeInactive ? { params: { includeInactive: true } } : {};
      return this.http.get<Sensor[]>(this.baseUrl, options).pipe(
        tap({
          next: (sensors) => {
            this.lastIncludeInactive = includeInactive;
            this.sensorsSubject.next(sensors);
            this.loadingSubject.next(false);
          },
          error: () => this.loadingSubject.next(false)
        })
      );
    }
    return this.sensors$;
  }

  getSensorById(id: number): Observable<Sensor> {
    return this.http.get<Sensor>(`${this.baseUrl}/${id}`);
  }

  createSensor(sensor: CreateSensorRequest): Observable<Sensor> {
    return this.http.post<Sensor>(this.baseUrl, sensor).pipe(
      tap((newSensor) => {
        const current = this.sensorsSubject.value;
        this.sensorsSubject.next([...current, newSensor]);
      })
    );
  }

  updateSensor(id: number, sensor: UpdateSensorRequest): Observable<Sensor> {
    return this.http.put<Sensor>(`${this.baseUrl}/${id}`, sensor).pipe(
      tap((updated) => {
        const current = this.sensorsSubject.value;
        const index = current.findIndex(s => s.id === id);
        if (index !== -1) {
          const updatedList = [...current];
          updatedList[index] = updated;
          this.sensorsSubject.next(updatedList);
        }
      })
    );
  }

  deleteSensor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        const current = this.sensorsSubject.value;
        if (this.lastIncludeInactive) {
          this.sensorsSubject.next(
            current.map(s => (s.id === id ? { ...s, active: false } : s))
          );
        } else {
          this.sensorsSubject.next(current.filter(s => s.id !== id));
        }
      })
    );
  }

  reactivateSensor(id: number): Observable<Sensor> {
    return this.http.put<Sensor>(`${this.baseUrl}/${id}/reactivate`, {}).pipe(
      tap((reactivated) => {
        const current = this.sensorsSubject.value;
        const index = current.findIndex(s => s.id === id);
        if (index !== -1) {
          const updatedList = [...current];
          updatedList[index] = reactivated;
          this.sensorsSubject.next(updatedList);
        } else {
          this.sensorsSubject.next([...current, reactivated]);
        }
      })
    );
  }
}
