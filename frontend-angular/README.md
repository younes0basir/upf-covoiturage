# UPF Covoiturage - Angular Frontend

Frontend Angular 18 avec Tailwind CSS pour l'application de covoiturage UPF.

## Technologies

- **Angular 18** - Framework JavaScript
- **Tailwind CSS 3.4** - Framework CSS utilitaire
- **TypeScript 5.4** - Superset typé de JavaScript
- **RxJS 7.8** - Programmation réactive

## Fonctionnalités Implémentées

### Services API (18 endpoints)

1. **AuthService** (4 endpoints)
   - `login()` - Authentification utilisateur
   - `register()` - Inscription utilisateur
   - `logout()` - Déconnexion
   - `getMe()` - Récupérer les infos utilisateur

2. **DriverService** (4 endpoints)
   - `getProfile()` - Récupérer le profil conducteur
   - `createProfile()` - Créer un profil conducteur
   - `getVehicles()` - Récupérer les véhicules
   - `addVehicle()` - Ajouter un véhicule

3. **LocationService** (4 endpoints)
   - `getAll()` - Récupérer tous les lieux
   - `getUniversity()` - Récupérer les lieux universitaires
   - `search()` - Rechercher des lieux
   - `create()` - Créer un lieu

4. **ReservationService** (4 endpoints)
   - `create()` - Créer une réservation
   - `getMyReservations()` - Récupérer mes réservations
   - `getTripReservations()` - Récupérer les réservations d'un trajet
   - `updateStatus()` - Mettre à jour le statut

5. **TripService** (5 endpoints)
   - `searchTrips()` - Rechercher des trajets
   - `getById()` - Récupérer un trajet par ID
   - `createTrip()` - Créer un trajet
   - `getMyTrips()` - Récupérer mes trajets
   - `updateTripStatus()` - Mettre à jour le statut du trajet

### Composants

- **Authentification**
  - LoginComponent - Page de connexion
  - RegisterComponent - Page d'inscription

- **Home**
  - HomeComponent - Page d'accueil

- **Driver**
  - DriverProfileComponent - Gestion du profil conducteur
  - DriverVehiclesComponent - Gestion des véhicules

- **Trips**
  - TripSearchComponent - Recherche de trajets
  - TripCreateComponent - Création de trajet
  - TripDetailsComponent - Détails d'un trajet
  - MyTripsComponent - Mes trajets publiés

- **Reservations**
  - MyReservationsComponent - Mes réservations

### Configuration

- **JWT Interceptor** - Injection automatique du token JWT dans les requêtes HTTP
- **Auth Guard** - Protection des routes nécessitant une authentification
- **Routing** - Configuration des routes avec chargement lazy

## Installation

### Prérequis

- Node.js 18+ 
- npm 9+

### Étapes d'installation

1. **Installer les dépendances**
```bash
cd frontend-angular
npm install
```

2. **Configurer l'URL de l'API**
   
   Modifier le fichier `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:8080/api' // Modifier selon votre configuration
   };
   ```

3. **Lancer le serveur de développement**
```bash
npm start
```

   L'application sera accessible sur `http://localhost:4200`

4. **Construire pour la production**
```bash
npm run build
```

   Les fichiers construits seront dans le dossier `dist/`

## Structure du Projet

```
frontend-angular/
├── src/
│   ├── app/
│   │   ├── auth/              # Composants d'authentification
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── driver/            # Composants conducteur
│   │   │   ├── driver-profile/
│   │   │   └── driver-vehicles/
│   │   ├── trips/             # Composants trajets
│   │   │   ├── trip-search/
│   │   │   ├── trip-create/
│   │   │   ├── trip-details/
│   │   │   └── my-trips/
│   │   ├── reservations/      # Composants réservations
│   │   │   └── my-reservations/
│   │   ├── home/              # Page d'accueil
│   │   ├── services/          # Services API
│   │   │   ├── auth.service.ts
│   │   │   ├── driver.service.ts
│   │   │   ├── location.service.ts
│   │   │   ├── reservation.service.ts
│   │   │   └── trip.service.ts
│   │   ├── guards/            # Guards de route
│   │   │   └── auth.guard.ts
│   │   ├── interceptors/      # Interceptors HTTP
│   │   │   └── jwt.interceptor.ts
│   │   ├── app.config.ts      # Configuration de l'application
│   │   ├── app.routes.ts      # Configuration des routes
│   │   └── app.component.ts   # Composant racine
│   ├── environments/          # Configuration environnement
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── angular.json
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── tsconfig.json
```

## Utilisation

### Workflow Passager

1. Créer un compte via la page d'inscription
2. Se connecter
3. Rechercher des trajets (origine, destination, date, places)
4. Voir les détails d'un trajet
5. Réserver une place
6. Gérer ses réservations (annuler)

### Workflow Conducteur

1. Créer un compte et se connecter
2. Créer un profil conducteur
3. Ajouter un véhicule
4. Publier un trajet (origine, destination, date, heure, places, prix)
5. Gérer ses trajets (terminer, annuler)
6. Voir les réservations pour ses trajets

## Configuration de Tailwind CSS

Tailwind CSS est configuré dans `tailwind.config.js`:

```javascript
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Les directives Tailwind sont incluses dans `src/styles.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Scripts Disponibles

- `npm start` - Lance le serveur de développement
- `npm run build` - Construit pour la production
- `npm run watch` - Mode watch pour le développement
- `npm test` - Lance les tests

## Notes

- Les erreurs TypeScript/linter sont normales avant d'exécuter `npm install`
- Assurez-vous que le backend API est accessible à l'URL configurée
- Le token JWT est stocké dans localStorage
- L'interceptor JWT ajoute automatiquement le token aux requêtes authentifiées

## Support

Pour plus d'informations sur les API, consultez le fichier `API_DOCUMENTATION.md` dans le dossier `frontend/`.
