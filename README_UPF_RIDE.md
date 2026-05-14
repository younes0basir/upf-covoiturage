# 🚀 UPF-Ride : Bilan de Développement & Architecture

Ce document récapitule l'ensemble du travail effectué sur la plateforme de covoiturage **UPF-Ride** (Backend Spring Boot & Frontend React). Il sert de référence technique pour comprendre la structure du projet, les problèmes résolus et les APIs disponibles.

---

## 🛠️ 1. Défis Techniques & Solutions Apportées

### A. Boucles de Dépendance et Erreurs de Sérialisation (Backend)
* **Le Problème** : Lors du renvoi d'un trajet (Trip), Spring essayait de sérialiser les réservations (Reservations), qui elles-mêmes pointaient vers le trajet, créant une boucle infinie (`StackOverflowError` ou JSON infini).
* **La Solution** : Nous avons créé des objets de transfert (DTOs) stricts : `TripResponse` et `ReservationResponse`. Pour éviter la boucle, `TripResponse` contient un objet allégé `ReservationSummary` (sans le trajet à l'intérieur). 
* **Injection Circulaire** : `TripService` et `ReservationService` avaient besoin l'un de l'autre. Nous avons résolu cela en utilisant l'injection paresseuse via `ApplicationContext` pour briser la boucle d'instanciation Spring.

### B. Plantage du Frontend (`TypeError: Cannot read properties of undefined`)
* **Le Problème** : L'écran du passager plantait (Écran Blanc) car `res.trip.departureTime` était nul. L'API renvoyait uniquement l'ID du trajet, pas ses détails.
* **La Solution** : Nous avons mis à jour le mapper du Backend pour que `ReservationResponse` inclut le sous-objet `TripResponse` au complet.

### C. Erreurs d'API Externes (Mapbox 401)
* **Le Problème** : L'API Mapbox de complétion d'adresses renvoyait des erreurs d'authentification (401).
* **La Solution** : Implémentation d'un système de *Fallback* intelligent dans `LocationInput.jsx` : si Mapbox échoue, le frontend bascule automatiquement sur l'API gratuite et open-source **Photon (OSM)** pour ne jamais bloquer l'utilisateur.

### D. Synchronisation en Temps Réel
* **Le Problème** : Un passager devait rafraîchir manuellement la page pour voir si le conducteur avait accepté sa demande.
* **La Solution** : Sans avoir à déployer une lourde infrastructure WebSockets, nous avons implémenté un système de **Polling silencieux** dans le Frontend (appel API toutes les 10 secondes) qui met à jour l'UI de manière transparente.

---

## 🌐 2. Architecture API (Backend Spring Boot)

Le backend est structuré autour de contrôleurs REST sécurisés par JWT. Voici les Endpoints principaux développés :

### 🔐 Authentification (`AuthController`)
* `POST /api/auth/register` : Créer un compte étudiant.
* `POST /api/auth/login` : Obtenir un token JWT.

### 🚗 Trajets (`TripController`)
* `GET /api/trips` : Rechercher des trajets (avec filtres de date, lieu, places).
* `GET /api/trips/{id}` : Récupérer les détails d'un trajet précis.
* `POST /api/trips` : Publier un nouveau trajet (nécessite un profil conducteur).
* `GET /api/trips/mine` : Récupérer les trajets publiés par le conducteur connecté (Renvoie `409 Conflict` si l'utilisateur n'est pas conducteur, ce qui est géré proprement par le front).
* `PATCH /api/trips/{id}/status` : Modifier le statut du trajet (Ex: Passer de `SCHEDULED` à `COMPLETED` ou `CANCELLED`).

### 🎟️ Réservations (`ReservationController`)
* `POST /api/reservations/trip/{tripId}` : Réserver des places dans un trajet.
* `GET /api/reservations/me` : Obtenir l'historique des réservations du passager connecté.
* `PATCH /api/reservations/{id}/status` : Le conducteur accepte (`ACCEPTED`) ou refuse (`REJECTED`) une demande.

---

## 💻 3. Architecture Frontend (React / Vite)

Le Frontend a été conçu pour offrir une expérience utilisateur "Premium", digne d'une vraie application mobile.

### Technologies Clés
* **Framework** : React + Vite.
* **Routage** : React Router (avec routes protégées `<ProtectedRoute>`).
* **Style** : Tailwind CSS (Gradients, Glassmorphism, Ring borders).
* **Requêtes** : Axios (avec intercepteurs pour injecter automatiquement le token JWT).

### Composants Majeurs
* **`Dashboard.jsx`** : Le cœur de l'application. 
  * Gère deux vues via un système d'onglets premium : "Passager" et "Conducteur".
  * Synchronisation asynchrone (`setInterval` toutes les 10s).
  * Affichage conditionnel des boutons d'actions (Accepter, Refuser, Annuler, Contacter, Terminer) basé sur la machine à états de la base de données.
* **`LocationInput.jsx`** : Autocomplétion intelligente des adresses avec gestion de double API (Mapbox -> Photon).
* **Icônes SVG Inlines** : Au lieu de dépendre de lourdes bibliothèques externes, les icônes (Lucide) ont été intégrées directement en SVG, assurant un temps de chargement ultra-rapide.

---

## 📈 4. Cycle de Vie Fonctionnel (State Machine)

La base de données gère les statuts de manière stricte (via des Triggers PostgreSQL) que le Frontend respecte :

1. **Création** : Trajet `SCHEDULED`.
2. **Demande** : Réservation `PENDING`.
3. **Validation** : Conducteur clique sur *Accepter*. Réservation devient `ACCEPTED`. Les places disponibles du trajet diminuent.
4. **Conclusion** : Le conducteur clique sur *Terminer*. Le trajet passe en `COMPLETED`. Le total des courses du conducteur s'incrémente dans la BDD. Les notes peuvent maintenant être données !
