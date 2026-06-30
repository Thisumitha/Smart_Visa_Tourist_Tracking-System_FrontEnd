import axios from 'axios';

// ==========================================
// Environment Toggle (Local vs Production)
// ==========================================
const IS_PRODUCTION = true; // Change to true when deploying to your VPS

// Remove old PROD_IP and BASE_IP completely.

// ==========================================
// Microservice Base URLs
// ==========================================
export const AUTH_API_URL = IS_PRODUCTION ? 'https://authentication-service.panthiya.edu.lk/api' : 'http://localhost:8082/api';
export const TOURIST_API_URL = IS_PRODUCTION ? 'https://tourist-service.panthiya.edu.lk/api' : 'http://localhost:8084/api';
export const TRACKING_API_URL = IS_PRODUCTION ? 'https://visa-tracking-service.panthiya.edu.lk/api' : 'http://localhost:8085/api';
export const ALERT_API_URL = IS_PRODUCTION ? 'https://alert-audit-service.panthiya.edu.lk/api' : 'http://localhost:8081/api';
export const PARTNER_API_URL = IS_PRODUCTION ? 'https://partner-service.panthiya.edu.lk/api' : 'http://localhost:8083/api';




// ==========================================
// Axios Instances for each Microservice
// ==========================================

export const authApiClient = axios.create({
    baseURL: AUTH_API_URL,
    headers: { 'Content-Type': 'application/json' }
});

export const touristApiClient = axios.create({
    baseURL: TOURIST_API_URL,
    headers: { 'Content-Type': 'application/json' }
});

export const trackingApiClient = axios.create({
    baseURL: TRACKING_API_URL,
    headers: { 'Content-Type': 'application/json' }
});

export const alertApiClient = axios.create({
    baseURL: ALERT_API_URL,
    headers: { 'Content-Type': 'application/json' }
});

export const partnerApiClient = axios.create({
    baseURL: PARTNER_API_URL,
    headers: { 'Content-Type': 'application/json' }
});
