# UPF-Ride API Documentation

This document provides a comprehensive overview of the UPF-Ride Backend API endpoints, request/response structures, and authentication mechanisms.

## Base URL
All API requests are prefixed with: `/api`

## Authentication
The API uses **JWT (JSON Web Token)** for authentication.
1.  **Login**: Send credentials to `POST /api/auth/login`.
2.  **Token**: Receive a `token` in the response.
3.  **Usage**: Include the token in the `Authorization` header of subsequent requests:
    `Authorization: Bearer <your_token>`

---

## 1. Authentication & Users

### Auth Controller (`/api/auth`)
| Method | Endpoint | Description | Public |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register a new user | Yes |
| `POST` | `/login` | Authenticate and get JWT | Yes |

### User Controller (`/api/users`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `GET` | `/me` | Get current logged-in user profile | Yes |
| `GET` | `/{id}` | Get user details by ID | Yes |

---

## 2. Trips & Reservations

### Trip Controller (`/api/trips`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Search/List all scheduled trips | No |
| `GET` | `/{id}` | Get trip details by ID | No |
| `POST` | `/` | Publish a new trip (Driver only) | Yes |
| `GET` | `/mine` | List trips published by the current user | Yes |
| `PATCH` | `/{id}/status` | Update trip status (e.g., IN_PROGRESS) | Yes |

### Reservation Controller (`/api/reservations`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Book a seat on a trip | Yes |
| `GET` | `/mine` | List my reservations as a passenger | Yes |
| `GET` | `/trip/{tripId}` | List reservations for a specific trip | Yes |
| `PATCH` | `/{id}/status` | Accept/Reject a reservation (Driver) | Yes |
| `DELETE` | `/{id}` | Cancel a reservation | Yes |

---

## 3. Drivers & Vehicles

### Driver Controller (`/api/driver`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `POST` | `/profile` | Create/Update driver profile | Yes |
| `GET` | `/profile/me` | Get my driver profile | Yes |
| `GET` | `/profile/{id}` | Get a driver's public profile | No |
| `POST` | `/vehicles` | Add a new vehicle | Yes |
| `GET` | `/vehicles` | List my vehicles | Yes |
| `DELETE` | `/vehicles/{id}` | Remove a vehicle | Yes |

---

## 4. Locations, Ratings & Reports

### Location Controller (`/api/locations`)
| Method | Endpoint | Description | Public |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List all locations | Yes |
| `GET` | `/university` | List university-specific locations | Yes |
| `GET` | `/search` | Search locations by name (`?q=...`) | Yes |

### Rating Controller (`/api/ratings`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Rate a user after a completed trip | Yes |
| `GET` | `/user/{userId}` | List ratings for a user | No |

---

## 5. Administration (`/api/admin`)
*Access restricted to users with `ROLE_ADMIN`*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/users` | List all registered users |
| `GET` | `/reports` | List all user reports/flags |
| `PATCH` | `/reports/{id}/status` | Update report status (RESOLVED, etc) |

---

## Data Schemas (DTOs)

### Common Enums
- **Gender**: `MALE`, `FEMALE`
- **TripStatus**: `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- **ReservationStatus**: `PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`, `COMPLETED`
- **PassengerPreference**: `ANY`, `FEMALE_ONLY`

### Example: Publish a Trip (`POST /api/trips`)
**Request Body:**
```json
{
  "vehicleId": "uuid",
  "departureLocationId": "uuid",
  "destinationLocationId": "uuid",
  "departureTime": "2024-05-20T10:00:00Z",
  "availableSeats": 3,
  "driverPrice": 25.00,
  "passengerGenderPreference": "ANY",
  "notes": "Non-smoking please"
}
```
