import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  searchTrips(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/trips`, { params });
  }

  getById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/trips/${id}`);
  }

  createTrip(tripData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/trips`, tripData);
  }

  getMyTrips(): Observable<any> {
    return this.http.get(`${this.apiUrl}/trips/mine`);
  }

  updateTripStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/trips/${id}/status`, null, { params: { status } });
  }
}
