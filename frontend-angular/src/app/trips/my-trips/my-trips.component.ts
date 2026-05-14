import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TripService } from '../../services/trip.service';

@Component({
  selector: 'app-my-trips',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="max-w-4xl mx-auto px-4">
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Mes Trajets</h2>
            <button
              routerLink="/trips/create"
              class="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700"
            >
              + Nouveau trajet
            </button>
          </div>
          
          <div *ngIf="isLoading" class="text-center py-8">
            <div class="text-gray-600">Chargement...</div>
          </div>
          
          <div *ngIf="!isLoading && trips.length === 0" class="text-center py-8">
            <p class="text-gray-600">Vous n'avez pas encore publié de trajets</p>
          </div>
          
          <div *ngIf="!isLoading && trips.length > 0" class="space-y-4">
            <div *ngFor="let trip of trips" class="border rounded-lg p-4">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-bold text-lg">{{ trip.origin }} → {{ trip.destination }}</h3>
                  <p class="text-gray-600">Date: {{ trip.date }} à {{ trip.time }}</p>
                  <p class="text-gray-600">Places: {{ trip.seats }} | Prix: {{ trip.price }}€</p>
                  <p class="text-gray-600">Statut: <span [class]="'font-bold ' + getStatusClass(trip.status)">{{ trip.status }}</span></p>
                </div>
                <div class="flex space-x-2">
                  <button
                    (click)="updateStatus(trip.id, 'completed')"
                    *ngIf="trip.status === 'active'"
                    class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                  >
                    Terminer
                  </button>
                  <button
                    (click)="updateStatus(trip.id, 'cancelled')"
                    *ngIf="trip.status === 'active'"
                    class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                  >
                    Annuler
                  </button>
                </div>
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
export class MyTripsComponent implements OnInit {
  trips: any[] = [];
  isLoading = true;

  constructor(
    private tripService: TripService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMyTrips();
  }

  loadMyTrips() {
    this.tripService.getMyTrips().subscribe({
      next: (data) => {
        this.trips = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  updateStatus(id: string, status: string) {
    this.tripService.updateTripStatus(id, status).subscribe({
      next: () => {
        this.loadMyTrips();
      },
      error: () => {
        alert('Erreur lors de la mise à jour du statut');
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'completed': return 'text-blue-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }
}
