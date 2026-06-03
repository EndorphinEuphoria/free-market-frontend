import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface LocationRequest {
  street: string;
  streetNumber: string;
  comuna: string;
  region: string;
  addressType: string;
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

export interface LocationResponseForId {
  streetAddress: string;
  comunaNombre: string;
  regionNombre: string;
  addressType: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly http = inject(HttpClient);
  private readonly API = 'http://localhost:8086/api-v1/location';

  getLocation(userId: number): Observable<LocationResponseForId> {
    return this.http.get<LocationResponseForId>(`${this.API}/getLocation/${userId}`);
  }

  getAllLocations(userId: number): Observable<LocationResponseForId[]> {
    return this.http.get<LocationResponseForId[]>(`${this.API}/getLocations/${userId}`);
  }

  createLocation(request: LocationRequest): Observable<LocationResponse> {
    return this.http.post<LocationResponse>(`${this.API}/createLocation`, request);
  }

  updateLocation(request: LocationRequest): Observable<LocationResponse> {
    return this.http.put<LocationResponse>(`${this.API}/updateLocation`, request);
  }

  deleteLocation(addressType: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/deleteLocation`, {
      params: { addressType }
    });
  }

  setActiveLocation(addressType: string): Observable<void> {
    return this.http.patch<void>(`${this.API}/setActive`, null, {
      params: { addressType }
    });
  }
}