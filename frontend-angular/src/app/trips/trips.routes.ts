import { Routes } from '@angular/router';
import { TripSearchComponent } from './trip-search/trip-search.component';
import { TripCreateComponent } from './trip-create/trip-create.component';
import { TripDetailsComponent } from './trip-details/trip-details.component';
import { MyTripsComponent } from './my-trips/my-trips.component';

export const tripsRoutes: Routes = [
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  { path: 'search', component: TripSearchComponent },
  { path: 'create', component: TripCreateComponent, canActivate: [] },
  { path: ':id', component: TripDetailsComponent },
  { path: 'my-trips', component: MyTripsComponent, canActivate: [] }
];
