import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DriverService } from '../../services/driver.service';

@Component({
  selector: 'app-driver-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="max-w-4xl mx-auto px-4">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Profil Conducteur</h2>
          
          <div *ngIf="isLoading" class="text-center py-8">
            <div class="text-gray-600">Chargement...</div>
          </div>
          
          <form *ngIf="!isLoading" (ngSubmit)="onSubmit()" #profileForm="ngForm">
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2">Nom complet</label>
              <input
                type="text"
                [(ngModel)]="profile.name"
                name="name"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2">Numéro de permis</label>
              <input
                type="text"
                [(ngModel)]="profile.licenseNumber"
                name="licenseNumber"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2">Téléphone</label>
              <input
                type="tel"
                [(ngModel)]="profile.phone"
                name="phone"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              type="submit"
              [disabled]="isSaving"
              class="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <span *ngIf="!isSaving">Enregistrer</span>
              <span *ngIf="isSaving">Enregistrement...</span>
            </button>
            
            <div *ngIf="message" [class]="messageType === 'success' ? 'mt-4 text-green-600' : 'mt-4 text-red-600'" class="text-sm">
              {{ message }}
            </div>
          </form>
        </div>
        
        <div class="mt-6">
          <button
            routerLink="/driver/vehicles"
            class="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700"
          >
            Gérer mes véhicules
          </button>
        </div>
      </div>
    </div>
  `
})
export class DriverProfileComponent implements OnInit {
  profile: any = {};
  isLoading = true;
  isSaving = false;
  message = '';
  messageType = 'success';

  constructor(private driverService: DriverService) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.driverService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.message = 'Erreur lors du chargement du profil';
        this.messageType = 'error';
      }
    });
  }

  onSubmit() {
    this.isSaving = true;
    this.message = '';

    this.driverService.createProfile(this.profile).subscribe({
      next: () => {
        this.message = 'Profil enregistré avec succès';
        this.messageType = 'success';
        this.isSaving = false;
      },
      error: () => {
        this.message = 'Erreur lors de l\'enregistrement';
        this.messageType = 'error';
        this.isSaving = false;
      }
    });
  }
}
