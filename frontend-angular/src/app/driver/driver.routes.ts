import { Routes } from '@angular/router';
import { DriverProfileComponent } from './driver-profile/driver-profile.component';
import { DriverVehiclesComponent } from './driver-vehicles/driver-vehicles.component';

export const driverRoutes: Routes = [
  { path: '', redirectTo: 'profile', pathMatch: 'full' },
  { path: 'profile', component: DriverProfileComponent },
  { path: 'vehicles', component: DriverVehiclesComponent }
];
