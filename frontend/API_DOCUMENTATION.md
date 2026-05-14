# API Documentation - UPF Covoiturage Frontend

## Project Overview

**UPF Covoiturage** is a carpooling platform designed for the University of Paris (UPF) community. The application enables students and staff to share rides to and from campus, reducing transportation costs and environmental impact.

### Key Features
- **Trip Creation:** Drivers can publish rides with specific routes, dates, and available seats
- **Trip Search:** Passengers can search for available trips based on origin, destination, date, and seat requirements
- **Reservations:** Passengers can book seats on published trips
- **Driver Profiles:** Drivers can create profiles and register their vehicles
- **Location Management:** University and custom locations can be managed for easier trip planning
- **User Authentication:** Secure JWT-based authentication for all users

### User Roles
1. **Passenger:** Searches for trips, makes reservations, views their reservations
2. **Driver:** Creates trips, manages their profile and vehicles, views their trips and reservations

---

## Business Process

### 1. Registration & Authentication
- New users register via email and password
- Upon registration, users can optionally create a driver profile
- Authentication uses JWT tokens stored in localStorage
- Users can view their profile information at any time

### 2. Driver Workflow
1. **Create Driver Profile:** Driver adds personal information (name, license, etc.)
2. **Add Vehicles:** Driver registers their vehicle(s) (make, model, license plate, etc.)
3. **Publish Trips:** Driver creates trips with:
   - Origin and destination locations
   - Date and time
   - Number of available seats
   - Price per seat
4. **Manage Reservations:** Driver views reservations for their trips and updates status (confirm/cancel)
5. **Update Trip Status:** Driver can mark trips as active, completed, or cancelled

### 3. Passenger Workflow
1. **Search Trips:** Passenger searches for trips using:
   - Origin and destination
   - Date
   - Number of seats required
2. **View Trip Details:** Passenger views detailed information about available trips
3. **Make Reservation:** Passenger books seats on a selected trip
4. **View My Reservations:** Passenger can track all their reservations and their status
5. **Manage Reservations:** Passenger can cancel their reservations if needed

### 4. Location Management
- University locations are pre-defined and easily accessible
- Users can search for locations by name
- Admin users can create new locations as needed

---

## Technical Overview

### API Overview
This document provides detailed information about all API endpoints used in the UPF Covoiturage frontend application. The application uses Axios for HTTP requests with JWT token authentication.

**Base URL:** `http://localhost:8080/api` (configurable via `VITE_API_BASE_URL` environment variable)

**Authentication:** JWT token sent in the `Authorization` header as `Bearer {token}`

---

## Configuration

### Axios Configuration
- **File:** `src/api/axios.js`
- **Description:** Centralized Axios instance with request interceptor for JWT token injection
- **Base URL:** Configured via environment variable or defaults to `http://localhost:8080/api`
- **Interceptor:** Automatically adds JWT token from localStorage to all requests

---

## API Services

### 1. Authentication Service (`authService`)

**File:** `src/api/authService.js`

#### 1.1 Login
- **Endpoint:** `POST /api/auth/login`
- **Description:** Authenticates a user and returns a JWT token
- **Parameters:**
  - `credentials` (object): User login credentials
    - `email` (string): User email address
    - `password` (string): User password
- **Response:** User data with JWT token
- **Side Effect:** Stores JWT token in localStorage
- **Usage:** `authService.login(credentials)`

#### 1.2 Register
- **Endpoint:** `POST /api/auth/register`
- **Description:** Registers a new user account
- **Parameters:**
  - `userData` (object): User registration data
    - `email` (string): User email address
    - `password` (string): User password
    - Additional user fields (name, phone, etc.)
- **Response:** Created user data
- **Usage:** `authService.register(userData)`

#### 1.3 Logout
- **Endpoint:** None (client-side only)
- **Description:** Removes JWT token from localStorage
- **Parameters:** None
- **Response:** None
- **Side Effect:** Removes token from localStorage
- **Usage:** `authService.logout()`

#### 1.4 Get Current User
- **Endpoint:** `GET /api/users/me`
- **Description:** Retrieves the currently authenticated user's information
- **Parameters:** None
- **Authentication:** Required (JWT token)
- **Response:** Current user data
- **Usage:** `authService.getMe()`

---

### 2. Driver Service (`driverService`)

**File:** `src/api/driverService.js`

#### 2.1 Get Driver Profile
- **Endpoint:** `GET /api/driver/profile/me`
- **Description:** Retrieves the current driver's profile information
- **Parameters:** None
- **Authentication:** Required (JWT token)
- **Response:** Driver profile data
- **Usage:** `driverService.getProfile()`

#### 2.2 Create Driver Profile
- **Endpoint:** `POST /api/driver/profile`
- **Description:** Creates a new driver profile
- **Parameters:**
  - `profileData` (object): Driver profile information
    - Driver details (name, license number, etc.)
- **Authentication:** Required (JWT token)
- **Response:** Created driver profile
- **Usage:** `driverService.createProfile(profileData)`

#### 2.3 Get Driver Vehicles
- **Endpoint:** `GET /api/driver/vehicles`
- **Description:** Retrieves all vehicles associated with the current driver
- **Parameters:** None
- **Authentication:** Required (JWT token)
- **Response:** Array of vehicle objects
- **Usage:** `driverService.getVehicles()`

#### 2.4 Add Vehicle
- **Endpoint:** `POST /api/driver/vehicles`
- **Description:** Adds a new vehicle to the driver's profile
- **Parameters:**
  - `vehicleData` (object): Vehicle information
    - Vehicle details (make, model, year, license plate, etc.)
- **Authentication:** Required (JWT token)
- **Response:** Created vehicle data
- **Usage:** `driverService.addVehicle(vehicleData)`

---

### 3. Location Service (`locationService`)

**File:** `src/api/locationService.js`

#### 3.1 Get All Locations
- **Endpoint:** `GET /api/locations`
- **Description:** Retrieves all available locations
- **Parameters:** None
- **Authentication:** Not required
- **Response:** Array of location objects
- **Usage:** `locationService.getAll()`

#### 3.2 Get University Locations
- **Endpoint:** `GET /api/locations/university`
- **Description:** Retrieves all university-related locations
- **Parameters:** None
- **Authentication:** Not required
- **Response:** Array of university location objects
- **Usage:** `locationService.getUniversity()`

#### 3.3 Search Locations
- **Endpoint:** `GET /api/locations/search`
- **Description:** Searches for locations based on a query string
- **Parameters:**
  - `q` (string): Search query (passed as query parameter)
- **Authentication:** Not required
- **Response:** Array of matching location objects
- **Usage:** `locationService.search(q)`

#### 3.4 Create Location
- **Endpoint:** `POST /api/locations`
- **Description:** Creates a new location
- **Parameters:**
  - `locationData` (object): Location information
    - Location details (name, address, coordinates, type, etc.)
- **Authentication:** Required (JWT token, likely admin)
- **Response:** Created location data
- **Usage:** `locationService.create(locationData)`

---

### 4. Reservation Service (`reservationService`)

**File:** `src/api/reservationService.js`

#### 4.1 Create Reservation
- **Endpoint:** `POST /api/reservations`
- **Description:** Creates a new reservation for a trip
- **Parameters:**
  - `reservationData` (object): Reservation details
    - `tripId` (string/number): ID of the trip to reserve
    - Additional reservation details (number of seats, etc.)
- **Authentication:** Required (JWT token)
- **Response:** Created reservation data
- **Usage:** `reservationService.create(reservationData)`

#### 4.2 Get My Reservations
- **Endpoint:** `GET /api/reservations/mine`
- **Description:** Retrieves all reservations made by the current user
- **Parameters:** None
- **Authentication:** Required (JWT token)
- **Response:** Array of reservation objects
- **Usage:** `reservationService.getMyReservations()`

#### 4.3 Get Trip Reservations
- **Endpoint:** `GET /api/reservations/trip/{tripId}`
- **Description:** Retrieves all reservations for a specific trip
- **Parameters:**
  - `tripId` (string/number): ID of the trip
- **Authentication:** Required (JWT token)
- **Response:** Array of reservation objects for the specified trip
- **Usage:** `reservationService.getTripReservations(tripId)`

#### 4.4 Update Reservation Status
- **Endpoint:** `PATCH /api/reservations/{id}/status`
- **Description:** Updates the status of a reservation
- **Parameters:**
  - `id` (string/number): ID of the reservation
  - `status` (string): New status (passed as query parameter)
    - Possible values: `pending`, `confirmed`, `cancelled`, `completed`
- **Authentication:** Required (JWT token)
- **Response:** Updated reservation data
- **Usage:** `reservationService.updateStatus(id, status)`

---

### 5. Trip Service (`tripService`)

**File:** `src/api/tripService.js`

#### 5.1 Search Trips
- **Endpoint:** `GET /api/trips`
- **Description:** Searches for trips based on various criteria
- **Parameters:**
  - `params` (object): Search parameters (passed as query parameters)
    - `origin` (string): Starting location
    - `destination` (string): Destination location
    - `date` (string): Trip date
    - `seats` (number): Number of seats required
    - Additional filters
- **Authentication:** Not required
- **Response:** Array of matching trip objects
- **Usage:** `tripService.searchTrips(params)`

#### 5.2 Get Trip by ID
- **Endpoint:** `GET /api/trips/{id}`
- **Description:** Retrieves detailed information about a specific trip
- **Parameters:**
  - `id` (string/number): ID of the trip
- **Authentication:** Not required
- **Response:** Detailed trip object
- **Usage:** `tripService.getById(id)`

#### 5.3 Create Trip
- **Endpoint:** `POST /api/trips`
- **Description:** Creates a new trip
- **Parameters:**
  - `tripData` (object): Trip details
    - `origin` (string): Starting location
    - `destination` (string): Destination location
    - `date` (string): Trip date
    - `time` (string): Trip time
    - `seats` (number): Number of available seats
    - `price` (number): Price per seat
    - Additional trip details
- **Authentication:** Required (JWT token)
- **Response:** Created trip data
- **Usage:** `tripService.createTrip(tripData)`

#### 5.4 Get My Trips
- **Endpoint:** `GET /api/trips/mine`
- **Description:** Retrieves all trips created by the current user
- **Parameters:** None
- **Authentication:** Required (JWT token)
- **Response:** Array of trip objects
- **Usage:** `tripService.getMyTrips()`

#### 5.5 Update Trip Status
- **Endpoint:** `PATCH /api/trips/{id}/status`
- **Description:** Updates the status of a trip
- **Parameters:**
  - `id` (string/number): ID of the trip
  - `status` (string): New status (passed as query parameter)
    - Possible values: `active`, `completed`, `cancelled`
- **Authentication:** Required (JWT token)
- **Response:** Updated trip data
- **Usage:** `tripService.updateTripStatus(id, status)`

---

## Authentication Flow

1. **Login:** User calls `authService.login(credentials)` → Server validates credentials → Returns JWT token → Token stored in localStorage
2. **Authenticated Requests:** All subsequent API calls automatically include the JWT token in the `Authorization` header
3. **Logout:** User calls `authService.logout()` → Token removed from localStorage

---

## Error Handling

All API services return the response data directly. Errors should be handled using try-catch blocks when calling these services:

```javascript
try {
  const result = await authService.login(credentials);
  // Handle success
} catch (error) {
  // Handle error
  console.error('Login failed:', error);
}
```

---

## Environment Variables

- `VITE_API_BASE_URL`: Base URL for the API (default: `http://localhost:8080/api`)

Configure this in the `.env` file:
```
VITE_API_BASE_URL=http://your-api-url.com/api
```

---

## Summary

**Total API Endpoints:** 18

**By Service:**
- Authentication Service: 4 endpoints
- Driver Service: 4 endpoints
- Location Service: 4 endpoints
- Reservation Service: 4 endpoints
- Trip Service: 5 endpoints

**By HTTP Method:**
- GET: 9 endpoints
- POST: 5 endpoints
- PATCH: 3 endpoints
- DELETE: 0 endpoints

**Authentication Required:** 13 endpoints
**Public Endpoints:** 5 endpoints

---

*Generated automatically from frontend API services on May 14, 2026*
