import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(`${this.apiUrl}/locations`);
  }

  getUniversity(): Observable<any> {
    return this.http.get(`${this.apiUrl}/locations/university`);
  }

  search(q: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/locations/search`, { params: { q } });
  }

  create(locationData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/locations`, locationData);
  }
}
