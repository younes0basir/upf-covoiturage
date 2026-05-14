import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DriverService } from '../../services/driver.service';

@Component({
  selector: 'app-driver-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="max-w-4xl mx-auto px-4">
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Mes Véhicules</h2>
          
          <div *ngIf="isLoading" class="text-center py-8">
            <div class="text-gray-600">Chargement...</div>
          </div>
          
          <div *ngIf="!isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div *ngFor="let vehicle of vehicles" class="border rounded-lg p-4">
              <h3 class="font-bold text-lg">{{ vehicle.make }} {{ vehicle.model }}</h3>
              <p class="text-gray-600">Année: {{ vehicle.year }}</p>
              <p class="text-gray-600">Plaque: {{ vehicle.licensePlate }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-4">Ajouter un véhicule</h3>
          
          <form (ngSubmit)="onSubmit()" #vehicleForm="ngForm">
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2">Marque</label>
              <input
                type="text"
                [(ngModel)]="newVehicle.make"
                name="make"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2">Modèle</label>
              <input
                type="text"
                [(ngModel)]="newVehicle.model"
                name="model"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2">Année</label>
              <input
                type="number"
                [(ngModel)]="newVehicle.year"
                name="year"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div class="mb-6">
              <label class="block text-gray-700 text-sm font-bold mb-2">Plaque d'immatriculation</label>
              <input
                type="text"
                [(ngModel)]="newVehicle.licensePlate"
                name="licensePlate"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              [disabled]="isSaving"
              class="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <span *ngIf="!isSaving">Ajouter</span>
              <span *ngIf="isSaving">Ajout...</span>
            </button>
            
            <div *ngIf="message" [class]="messageType === 'success' ? 'mt-4 text-green-600' : 'mt-4 text-red-600'" class="text-sm">
              {{ message }}
            </div>
          </form>
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
export class DriverVehiclesComponent implements OnInit {
  vehicles: any[] = [];
  newVehicle: any = {};
  isLoading = true;
  isSaving = false;
  message = '';
  messageType = 'success';

  constructor(private driverService: DriverService) {}

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.driverService.getVehicles().subscribe({
      next: (data) => {
        this.vehicles = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.message = 'Erreur lors du chargement des véhicules';
        this.messageType = 'error';
      }
    });
  }

  onSubmit() {
    this.isSaving = true;
    this.message = '';

    this.driverService.addVehicle(this.newVehicle).subscribe({
      next: () => {
        this.message = 'Véhicule ajouté avec succès';
        this.messageType = 'success';
        this.newVehicle = {};
        this.isSaving = false;
        this.loadVehicles();
      },
      error: () => {
        this.message = 'Erreur lors de l\'ajout du véhicule';
        this.messageType = 'error';
        this.isSaving = false;
      }
    });
  }
}
