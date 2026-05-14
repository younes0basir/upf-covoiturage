import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/driver/profile/me`);
  }

  createProfile(profileData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/driver/profile`, profileData);
  }

  getVehicles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/driver/vehicles`);
  }

  addVehicle(vehicleData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/driver/vehicles`, vehicleData);
  }
}
