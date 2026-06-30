# Smart Visa Tourist Tracking System - Frontend

## Project Purpose
This repository serves as the **Frontend Application** for the Smart Visa Tourist Tracking System. It provides the user interface for tourists, admins, agencies, and border control officers to interact with the underlying microservices. It visualizes travel logs, manages visa tracking, handles alerts, and facilitates check-ins.

## Core Components
### Architecture & State Management
- **React Components**: The application is built using React functional components, handling modular UI elements like dashboards, forms, and navigation.
- **Routing**: Uses `React Router DOM` to manage navigation between different views (e.g., login, dashboard, tourist profiles).
- **API Integration**: Utilizes `Axios` to communicate securely with backend Spring Boot microservices.

### UI & Visualization
- **TailwindCSS**: Handles responsive, modern styling across the application.
- **Chart.js**: Provides graphical representations of data (e.g., visa statistics, tracking metrics).
- **SweetAlert2**: Used for modern, interactive popups and notifications.

## Security Overview
- **Authentication Handling**: The frontend collects user credentials, passes them to the Auth Service, and securely stores the returned **JWT (JSON Web Token)** (typically in localStorage/sessionStorage).
- **Protected Routes**: Implements client-side route guards so that only authenticated users with specific roles can access sensitive pages.
- **Secure API Calls**: Attaches the JWT as a Bearer token in the `Authorization` header of all outbound `Axios` requests.

## Technologies Used
- React 19
- Vite
- TailwindCSS
- Chart.js & React Chartjs 2
- Axios
- React Router DOM
- SweetAlert2

## Getting Started

1. Clone the repository.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Access the application at the URL provided by Vite.

## Build for Production
To build the application for production, run: `npm run build`
