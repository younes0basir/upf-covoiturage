import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TripService } from '../../services/trip.service';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-trip-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="max-w-4xl mx-auto px-4">
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Rechercher un trajet</h2>
          
          <form (ngSubmit)="onSearch()" #searchForm="ngForm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Départ</label>
                <input
                  type="text"
                  [(ngModel)]="searchParams.origin"
                  name="origin"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Lieu de départ"
                  required
                />
              </div>
              
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Destination</label>
                <input
                  type="text"
                  [(ngModel)]="searchParams.destination"
                  name="destination"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Lieu d'arrivée"
                  required
                />
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Date</label>
                <input
                  type="date"
                  [(ngModel)]="searchParams.date"
                  name="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Nombre de places</label>
                <input
                  type="number"
                  [(ngModel)]="searchParams.seats"
                  name="seats"
                  min="1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              [disabled]="isSearching"
              class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <span *ngIf="!isSearching">Rechercher</span>
              <span *ngIf="isSearching">Recherche...</span>
            </button>
          </form>
        </div>
        
        <div *ngIf="trips.length > 0" class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-4">Résultats</h3>
          
          <div class="space-y-4">
            <div *ngFor="let trip of trips" class="border rounded-lg p-4 hover:bg-gray-50">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-bold text-lg">{{ trip.origin }} → {{ trip.destination }}</h4>
                  <p class="text-gray-600">Date: {{ trip.date }} à {{ trip.time }}</p>
                  <p class="text-gray-600">Places disponibles: {{ trip.seats }}</p>
                  <p class="text-gray-600">Prix: {{ trip.price }}€ / place</p>
                </div>
                <button
                  routerLink="/trips/{{ trip.id }}"
                  class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Voir détails
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-6">
          <button
            routerLink="/home"
            class="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700"
          >
            Retour
          </button>
        </div>
      </div>
    </div>
  `
})
export class TripSearchComponent {
  searchParams: any = {
    fromId: '',
    toId: '',
    date: '',
    seats: 1
  };
  trips: any[] = [];
  isSearching = false;

  constructor(
    private tripService: TripService,
    private locationService: LocationService
  ) {}

  onOriginChange(event: { id: string; name: string }) {
    this.searchParams.fromId = event.id;
  }

  onDestinationChange(event: { id: string; name: string }) {
    this.searchParams.toId = event.id;
  }

  onSearch() {
    this.isSearching = true;
    
    this.tripService.searchTrips(this.searchParams).subscribe({
      next: (data) => {
        this.trips = data;
        this.isSearching = false;
      },
      error: () => {
        this.isSearching = false;
        alert('Erreur lors de la recherche');
      }
    });
  }
}
