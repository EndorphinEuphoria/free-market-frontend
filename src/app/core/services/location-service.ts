import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface LocationRequest {
  street: string;
  streetNumber: string;
  comuna: string;
  region: string;
}

export interface LocationResponse {
  locationId: number;
  userId: number;
  street: string;
  streetAddress: string;
  latitude: number;
  longitude: number;
  comunaNombre: string;
  regionNombre: string;
}

export interface LocationresponseForId {
  streetAddress: string;
  comunaNombre: string;
  regionNombre: string;
}

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private readonly http = inject(HttpClient);
  private readonly API = 'http://localhost:8086/api-v1/location';

  getLocation(userId: number): Observable<LocationresponseForId> {
    return this.http.get<LocationresponseForId>(`${this.API}/getLocation/${userId}`);
  }

  createLocation(request: LocationRequest): Observable<LocationResponse> {
    return this.http.post<LocationResponse>(`${this.API}/createLocation`, request);
  }

  updateLocation(request: LocationRequest): Observable<LocationResponse> {
    return this.http.put<LocationResponse>(`${this.API}/updateLocation`, request)
  }
}
