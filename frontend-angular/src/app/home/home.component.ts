import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav class="bg-white shadow-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold text-blue-600">UPF Covoiturage</h1>
            </div>
            <div class="flex items-center space-x-4">
              <button
                *ngIf="!isAuthenticated"
                routerLink="/login"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Connexion
              </button>
              <button
                *ngIf="!isAuthenticated"
                routerLink="/register"
                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Inscription
              </button>
              <button
                *ngIf="isAuthenticated"
                routerLink="/trips"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Rechercher un trajet
              </button>
              <button
                *ngIf="isAuthenticated"
                routerLink="/driver"
                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Espace Conducteur
              </button>
              <button
                *ngIf="isAuthenticated"
                (click)="logout()"
                class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">
            Partagez vos trajets à l'université
          </h2>
          <p class="text-xl text-gray-600 mb-8">
            Réduisez vos coûts de transport et contribuez à l'environnement
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div class="bg-white rounded-lg shadow-lg p-6">
              <div class="text-blue-600 text-4xl mb-4">🚗</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Conducteurs</h3>
              <p class="text-gray-600">
                Publiez vos trajets et partagez les frais avec d'autres étudiants
              </p>
            </div>
            
            <div class="bg-white rounded-lg shadow-lg p-6">
              <div class="text-green-600 text-4xl mb-4">👥</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Passagers</h3>
              <p class="text-gray-600">
                Trouvez facilement des trajets vers votre destination
              </p>
            </div>
            
            <div class="bg-white rounded-lg shadow-lg p-6">
              <div class="text-purple-600 text-4xl mb-4">💰</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Économique</h3>
              <p class="text-gray-600">
                Partagez les frais et économisez sur vos déplacements
              </p>
            </div>
          </div>
          
          <div class="mt-12">
            <button
              *ngIf="!isAuthenticated"
              routerLink="/register"
              class="bg-blue-600 text-white text-lg font-bold py-3 px-8 rounded-lg hover:bg-blue-700"
            >
              Commencer maintenant
            </button>
            <button
              *ngIf="isAuthenticated"
              routerLink="/trips"
              class="bg-blue-600 text-white text-lg font-bold py-3 px-8 rounded-lg hover:bg-blue-700"
            >
              Rechercher un trajet
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent {
  isAuthenticated = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  logout() {
    this.authService.logout();
    this.isAuthenticated = false;
    this.router.navigate(['/home']);
  }
}
