import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserPreference, UpdatePreferencePayload } from '../../models/user-preference.model';

@Injectable({
  providedIn: 'root'
})
export class UserPreferenceService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/preferences/me';

  getPreferences(): Observable<UserPreference> {
    return this.http.get<UserPreference>(this.baseUrl);
  }

  updatePreferences(payload: UpdatePreferencePayload): Observable<UserPreference> {
    return this.http.patch<UserPreference>(this.baseUrl, payload);
  }
}
