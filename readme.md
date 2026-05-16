# UPF Fès Student Carpooling App

A university carpooling platform for students of UPF Fès.  
The application allows students to publish rides, search available trips, reserve seats, share transport costs, and rate each other after completed trips.

---

## Project Objective

The goal of this project is to create a secure and smart carpooling system for university students.

The platform mainly focuses on rides:

- From home to UPF Fès
- From UPF Fès back home
- To other destinations when needed

This solution helps  students reduce transportation costs, improve mobility, and create a trusted student ride-sharing community.

---

## Technologies Used

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- Google Maps API

### Backend

- Spring Boot
- Spring Security
- JWT Authentication
- Spring Data JPA
- REST API

### Database

- PostgreSQL

---

## Main Features

### Authentication

- Student registration
- Student login
- JWT authentication
- Secure password storage
- Role-based access

### User Profiles

- Student profile
- Gender: MALE or FEMALE
- Phone number
- Student card number
- Verified account status

### Driver Features

Drivers can:

- Create a driver profile
- Add vehicle information
- Publish trips
- Manage reservations
- Accept or reject passengers
- Complete or cancel trips

### Passenger Features

Passengers can:

- Search available trips
- View trip details
- Reserve seats
- Cancel reservations
- Rate drivers after completed rides

### Trip Management

Each trip contains:

- Departure location
- Destination location
- Departure time
- Available seats
- Driver contribution price
- Optional service fee
- Total price
- Trip status
- Google Maps route data

### Safety Features

- Female-only ride option
- Verified student accounts
- Driver and vehicle information
- Ratings and reviews
- Reservation history

### Google Maps Integration

The app will use Google Maps API for:

- Address autocomplete
- Route display
- Distance calculation
- Estimated duration
- Latitude and longitude storage
- Google Place ID storage

---

## User Roles

### Student

A student can:

- Register and login
- Search rides
- Reserve seats
- Become a driver
- Rate other users

### Driver

A driver is also a student who can:

- Add vehicle information
- Publish trips
- Manage ride reservations

### Admin

An admin can:

- Manage users
- Monitor trips
- Moderate ratings or reports
- Verify student accounts

---

## Database Overview

Main tables:

- `users`
- `driver_profiles`
- `vehicles`
- `locations`
- `trips`
- `reservations`
- `ratings`

---

## Smart Database Rules

The system should enforce these rules:

- A passenger cannot reserve their own trip
- A reservation cannot exceed available seats
- A driver must have a vehicle before creating a trip
- A user can reserve only once per trip
- Female-only trips can only be reserved by female students
- Ratings are allowed only after the trip is completed
- A trip departure and destination cannot be the same

---

## Trip Status Values

```txt
SCHEDULED
IN_PROGRESS
COMPLETED
CANCELLED
```

---

## Reservation Status Values

```txt
PENDING
ACCEPTED
REJECTED
CANCELLED
COMPLETED
```

---

## Driver Role

A student becomes a driver by creating a `driver_profile` linked to their account.
Their `user_role` stays `STUDENT` — the driver capability is determined by the existence of a `driver_profile`, not by the role field.

---

## Business Rule Enforcement

| Rule | Enforced At |
|---|---|
| Passenger cannot reserve their own trip | Database (trigger) |
| Reservation cannot exceed available seats | Database (trigger) |
| Ratings only after a completed trip | Database (trigger) |
| `available_seats` decremented on acceptance | Database (trigger) |
| `average_rating` recalculated on new rating | Database (trigger) |
| `total_rides` incremented on trip completion | Database (trigger) |
| `updated_at` auto-refreshed on row update | Database (trigger) |
| Female-only trips for female passengers only | Application layer |
| Driver must have a vehicle before creating a trip | Application layer |
| Unique reservation per passenger per trip | Database (UNIQUE constraint) |
| Trip departure ≠ destination | Database (CHECK constraint) |

---

## Setup & Installation

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL 13+
- Google Maps API key

### 1. Database

```bash
psql -U <user> -d <database> -f database.sql
```

### 2. Backend

Configure `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/<database>
spring.datasource.username=<user>
spring.datasource.password=<password>
jwt.secret=<your-jwt-secret>
google.maps.api.key=<your-google-maps-key>
```

Run:

```bash
mvn spring-boot:run
```

### 3. Frontend

Create `.env` in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_MAPS_API_KEY=<your-google-maps-key>
```

Install and run:

```bash
npm install
npm run dev
```
