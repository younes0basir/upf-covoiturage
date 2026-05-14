import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Connexion</h2>
        
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="mb-4">
            <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="credentials.email"
              required
              email
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="votre@email.com"
            />
          </div>
          
          <div class="mb-6">
            <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="credentials.password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            [disabled]="isLoading"
            class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <span *ngIf="!isLoading">Se connecter</span>
            <span *ngIf="isLoading">Connexion...</span>
          </button>
          
          <div *ngIf="errorMessage" class="mt-4 text-red-600 text-center text-sm">
            {{ errorMessage }}
          </div>
        </form>
        
        <p class="mt-6 text-center text-gray-600 text-sm">
          Pas encore de compte?
          <a routerLink="/register" class="text-blue-600 hover:text-blue-800 font-semibold">S'inscrire</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.router.navigate(['/home']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Email ou mot de passe incorrect';
        this.isLoading = false;
      }
    });
  }
}
