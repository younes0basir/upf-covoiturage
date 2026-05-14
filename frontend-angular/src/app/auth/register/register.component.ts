import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 py-12">
      <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Inscription</h2>
        
        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div class="mb-4">
            <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="userData.email"
              required
              email
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="votre@email.com"
            />
          </div>
          
          <div class="mb-4">
            <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="userData.password"
              required
              minlength="6"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          
          <div class="mb-4">
            <label for="name" class="block text-gray-700 text-sm font-bold mb-2">Nom complet</label>
            <input
              type="text"
              id="name"
              name="name"
              [(ngModel)]="userData.name"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Jean Dupont"
            />
          </div>
          
          <div class="mb-6">
            <label for="phone" class="block text-gray-700 text-sm font-bold mb-2">Téléphone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              [(ngModel)]="userData.phone"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="06 12 34 56 78"
            />
          </div>
          
          <button
            type="submit"
            [disabled]="isLoading"
            class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <span *ngIf="!isLoading">S'inscrire</span>
            <span *ngIf="isLoading">Inscription...</span>
          </button>
          
          <div *ngIf="errorMessage" class="mt-4 text-red-600 text-center text-sm">
            {{ errorMessage }}
          </div>
          
          <div *ngIf="successMessage" class="mt-4 text-green-600 text-center text-sm">
            {{ successMessage }}
          </div>
        </form>
        
        <p class="mt-6 text-center text-gray-600 text-sm">
          Déjà inscrit?
          <a routerLink="/login" class="text-blue-600 hover:text-blue-800 font-semibold">Se connecter</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  userData = {
    email: '',
    password: '',
    name: '',
    phone: ''
  };
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.userData).subscribe({
      next: (response) => {
        this.successMessage = 'Compte créé avec succès! Vous pouvez maintenant vous connecter.';
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de l\'inscription. Veuillez réessayer.';
        this.isLoading = false;
      }
    });
  }
}
