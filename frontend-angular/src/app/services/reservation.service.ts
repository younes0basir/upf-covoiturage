import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  create(reservationData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservations`, reservationData);
  }

  getMyReservations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservations/mine`);
  }

  getTripReservations(tripId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservations/trip/${tripId}`);
  }

  updateStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/reservations/${id}/status`, null, { params: { status } });
  }
}
