import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HomeComponent } from './home/home.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'driver', 
    loadChildren: () => import('./driver/driver.routes').then(m => m.driverRoutes),
    canActivate: [authGuard]
  },
  { 
    path: 'trips', 
    loadChildren: () => import('./trips/trips.routes').then(m => m.tripsRoutes)
  },
  { 
    path: 'reservations', 
    loadChildren: () => import('./reservations/reservations.routes').then(m => m.reservationsRoutes),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/home' }
];
