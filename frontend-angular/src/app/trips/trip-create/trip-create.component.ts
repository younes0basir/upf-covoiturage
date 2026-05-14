import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TripService } from '../../services/trip.service';
import { GoogleMapsLocationInputComponent } from '../../components/google-maps-location-input/google-maps-location-input.component';

@Component({
  selector: 'app-trip-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, GoogleMapsLocationInputComponent],
  template: `
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="max-w-4xl mx-auto px-4">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Publier un trajet</h2>
          
          <form (ngSubmit)="onSubmit()" #tripForm="ngForm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <app-google-maps-location-input
                label="Départ"
                placeholder="Ex: UPF, Gare de Fès..."
                (onChange)="onOriginChange($event)"
              />
              
              <app-google-maps-location-input
                label="Destination"
                placeholder="Ex: Route d'Imouzzer, Narjiss..."
                (onChange)="onDestinationChange($event)"
              />
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Date</label>
                <input
                  type="date"
                  [(ngModel)]="tripData.date"
                  name="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Heure</label>
                <input
                  type="time"
                  [(ngModel)]="tripData.time"
                  name="time"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Nombre de places</label>
                <input
                  type="number"
                  [(ngModel)]="tripData.seats"
                  name="seats"
                  min="1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Prix par place (€)</label>
                <input
                  type="number"
                  [(ngModel)]="tripData.price"
                  name="price"
                  min="0"
                  step="0.01"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              [disabled]="isSaving"
              class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <span *ngIf="!isSaving">Publier le trajet</span>
              <span *ngIf="isSaving">Publication...</span>
            </button>
            
            <div *ngIf="message" [class]="messageType === 'success' ? 'mt-4 text-green-600' : 'mt-4 text-red-600'" class="text-sm">
              {{ message }}
            </div>
          </form>
        </div>
        
        <div class="mt-6">
          <button
            routerLink="/trips/my-trips"
            class="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700"
          >
            Retour
          </button>
        </div>
      </div>
    </div>
  `
})
export class TripCreateComponent {
  tripData: any = {
    departureLocationId: '',
    destinationLocationId: '',
    date: '',
    time: '',
    seats: 1,
    price: 0
  };
  isSaving = false;
  message = '';
  messageType = 'success';

  constructor(
    private tripService: TripService,
    private router: Router
  ) {}

  onOriginChange(event: { id: string; name: string }) {
    this.tripData.departureLocationId = event.id;
  }

  onDestinationChange(event: { id: string; name: string }) {
    this.tripData.destinationLocationId = event.id;
  }

  onSubmit() {
    this.isSaving = true;
    this.message = '';

    this.tripService.createTrip(this.tripData).subscribe({
      next: () => {
        this.message = 'Trajet publié avec succès';
        this.messageType = 'success';
        this.isSaving = false;
        setTimeout(() => {
          this.router.navigate(['/trips/my-trips']);
        }, 1500);
      },
      error: () => {
        this.message = 'Erreur lors de la publication du trajet';
        this.messageType = 'error';
        this.isSaving = false;
      }
    });
  }
}
