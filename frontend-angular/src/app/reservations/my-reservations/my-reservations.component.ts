import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="max-w-4xl mx-auto px-4">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Mes Réservations</h2>
          
          <div *ngIf="isLoading" class="text-center py-8">
            <div class="text-gray-600">Chargement...</div>
          </div>
          
          <div *ngIf="!isLoading && reservations.length === 0" class="text-center py-8">
            <p class="text-gray-600">Vous n'avez pas encore de réservations</p>
            <button
              routerLink="/trips/search"
              class="mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Rechercher un trajet
            </button>
          </div>
          
          <div *ngIf="!isLoading && reservations.length > 0" class="space-y-4">
            <div *ngFor="let reservation of reservations" class="border rounded-lg p-4">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-bold text-lg">{{ reservation.trip?.origin || 'Trajet' }} → {{ reservation.trip?.destination || '' }}</h3>
                  <p class="text-gray-600">Date: {{ reservation.trip?.date || 'N/A' }}</p>
                  <p class="text-gray-600">Places: {{ reservation.seats || 1 }}</p>
                  <p class="text-gray-600">Statut: <span [class]="'font-bold ' + getStatusClass(reservation.status)">{{ reservation.status }}</span></p>
                </div>
                <div class="flex space-x-2">
                  <button
                    (click)="updateStatus(reservation.id, 'cancelled')"
                    *ngIf="reservation.status === 'pending' || reservation.status === 'confirmed'"
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
export class MyReservationsComponent implements OnInit {
  reservations: any[] = [];
  isLoading = true;

  constructor(
    private reservationService: ReservationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMyReservations();
  }

  loadMyReservations() {
    this.reservationService.getMyReservations().subscribe({
      next: (data) => {
        this.reservations = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  updateStatus(id: string, status: string) {
    this.reservationService.updateStatus(id, status).subscribe({
      next: () => {
        this.loadMyReservations();
      },
      error: () => {
        alert('Erreur lors de la mise à jour du statut');
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'completed': return 'text-blue-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }
}
