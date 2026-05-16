# UPF-Ride 🚗🎓

**The Smart University Carpooling Platform for UPF Fès.**

UPF-Ride is a modern, full-stack carpooling solution designed specifically for the student community of the Private University of Fès. It combines cutting-edge AI, real-time communication, and premium design to make student mobility safer, cheaper, and smarter.

---

## ✨ Key Innovations

### 🧠 OmniAssistant (AI Search)
Powered by **Nvidia NIM & Llama 3.1 8B**, our intelligent assistant allows students to find rides using natural language. Just type *"I need a ride to Casa tomorrow morning"* and Omni handles the complex search logic for you.

### 💬 Real-time Messaging
Direct, instantaneous communication between drivers and passengers. Coordinate pickup points and times without leaving the platform.

### 🗺️ Morocco Explorer
A dedicated experience for discovering inter-city trips across Morocco, helping students travel home or explore the country during weekends.

### 💎 Premium Design System
A state-of-the-art UI featuring:
- **Glassmorphism** aesthetics.
- **University Portal** design language.
- **Dynamic Micro-animations** for a smooth user experience.
- **Google Maps Integration** for precise location and route tracking.

---

## 🛠️ Technology Stack

### 🚀 Production Stack

| Layer | Technology | Provider |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS | **Vercel** |
| **Backend** | Spring Boot 3, Java 21, Security, JWT | **Render (Docker)** |
| **Database** | PostgreSQL | **Neon Serverless** |
| **AI** | Llama 3.1 8B (Nvidia NIM API) | **Nvidia** |
| **Email** | REST API Verification | **Resend** |

### 💻 Development Tools

**Frontend**
- **React 18 & Vite**: Fast development and optimized builds.
- **Tailwind CSS**: Modern, utility-first styling.
- **Google Maps API**: Advanced geolocation and routing.
- **Axios**: Secure API communication.
- **Lucide React**: Premium iconography.

**Backend**
- **Spring Boot 3.2**: Robust enterprise-grade framework.
- **Spring Security & JWT**: Industry-standard authentication.
- **Spring Data JPA**: Efficient database management.
- **Docker**: Containerized deployment for environment parity.
- **Lombok**: Clean, concise Java code.

**Database**
- **PostgreSQL**: Reliable relational data storage.
- **Hibernate**: Powerful Object-Relational Mapping (ORM).

---

## 🚀 Key Features

### 🛡️ Security & Trust
- **Email Verification**: Secure registration via Resend.
- **Academic Restriction**: Exclusive access for `@upf.ac.ma` domains.
- **Verified Profiles**: Student card validation and driver license checks.
- **Female-Only Rides**: Enhanced safety options for female students.

### 🚗 Trip Management
- **Smart Routing**: Distance and duration calculation via Google Maps.
- **Reservation Workflow**: Interactive status management (Pending → Accepted → Completed).
- **Seat Tracking**: Automatic seat decrementing upon booking.
- **History & Ratings**: Comprehensive feedback system to build trust.

---

## 📦 Deployment & Setup

### Environment Variables Required

**Backend (.env)**
```env
DB_URL=jdbc:postgresql://your-neon-url
DB_USERNAME=your-username
DB_PASSWORD=your-password
JWT_SECRET=your-secure-secret
NVIDIA_API_KEY=your-nvidia-key
RESEND_API_KEY=your-resend-key
ALLOWED_ORIGINS=your-vercel-url
```

**Frontend (.env)**
```env
VITE_API_BASE_URL=https://your-render-url.com
VITE_GOOGLE_MAPS_API_KEY=your-maps-key
```

### Local Development
1. **Backend**: `.\mvnw spring-boot:run`
2. **Frontend**: `npm run dev`
3. **Docker**: `docker build -t upf-ride .`

---

## 📊 Database Architecture
The system uses a robust schema with 10+ tables including `users`, `trips`, `messages`, `ratings`, and `vehicles`, with complex business logic enforced via application-level validation and database constraints.

---

© 2025 UPF-Ride - Université Privée de Fès. All rights reserved.
