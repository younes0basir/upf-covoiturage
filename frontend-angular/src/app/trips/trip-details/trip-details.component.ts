import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TripService } from '../../services/trip.service';
import { ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-trip-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="max-w-4xl mx-auto px-4">
        <div *ngIf="isLoading" class="text-center py-8">
          <div class="text-gray-600">Chargement...</div>
        </div>
        
        <div *ngIf="!isLoading && trip" class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Détails du trajet</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 class="font-bold text-lg text-gray-700 mb-2">Informations du trajet</h3>
              <p><strong>Départ:</strong> {{ trip.origin }}</p>
              <p><strong>Destination:</strong> {{ trip.destination }}</p>
              <p><strong>Date:</strong> {{ trip.date }}</p>
              <p><strong>Heure:</strong> {{ trip.time }}</p>
            </div>
            
            <div>
              <h3 class="font-bold text-lg text-gray-700 mb-2">Détails</h3>
              <p><strong>Places disponibles:</strong> {{ trip.seats }}</p>
              <p><strong>Prix par place:</strong> {{ trip.price }}€</p>
              <p><strong>Statut:</strong> {{ trip.status }}</p>
            </div>
          </div>
          
          <div class="border-t pt-6">
            <button
              (click)="makeReservation()"
              [disabled]="isReserving"
              class="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <span *ngIf="!isReserving">Réserver une place</span>
              <span *ngIf="isReserving">Réservation...</span>
            </button>
            
            <div *ngIf="message" [class]="messageType === 'success' ? 'mt-4 text-green-600' : 'mt-4 text-red-600'" class="text-sm">
              {{ message }}
            </div>
          </div>
        </div>
        
        <div class="mt-6">
          <button
            routerLink="/trips/search"
            class="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700"
          >
            Retour à la recherche
          </button>
        </div>
      </div>
    </div>
  `
})
export class TripDetailsComponent implements OnInit {
  trip: any = {};
  isLoading = true;
  isReserving = false;
  message = '';
  messageType = 'success';

  constructor(
    private route: ActivatedRoute,
    private tripService: TripService,
    private reservationService: ReservationService,
    private router: Router
  ) {}

  ngOnInit() {
    const tripId = this.route.snapshot.paramMap.get('id');
    if (tripId) {
      this.loadTripDetails(tripId);
    }
  }

  loadTripDetails(id: string) {
    this.tripService.getById(id).subscribe({
      next: (data) => {
        this.trip = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.message = 'Erreur lors du chargement du trajet';
        this.messageType = 'error';
      }
    });
  }

  makeReservation() {
    this.isReserving = true;
    this.message = '';

    const reservationData = {
      tripId: this.trip.id,
      seats: 1
    };

    this.reservationService.create(reservationData).subscribe({
      next: () => {
        this.message = 'Réservation effectuée avec succès';
        this.messageType = 'success';
        this.isReserving = false;
        setTimeout(() => {
          this.router.navigate(['/reservations']);
        }, 1500);
      },
      error: () => {
        this.message = 'Erreur lors de la réservation';
        this.messageType = 'error';
        this.isReserving = false;
      }
    });
  }
}
