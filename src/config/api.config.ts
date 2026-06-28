import axios from 'axios';

// ==========================================
// Environment Toggle (Local vs Production)
// ==========================================
const IS_PRODUCTION = true; // Change to true when deploying to your VPS

const LOCAL_IP = 'http://localhost';
const PROD_IP = 'http://207.180.253.221';
const BASE_IP = IS_PRODUCTION ? PROD_IP : LOCAL_IP;

// ==========================================
// Microservice Base URLs
// ==========================================
export const AUTH_API_URL = `${BASE_IP}:8082/api`;
export const TOURIST_API_URL = `${BASE_IP}:8084/api`;
export const TRACKING_API_URL = `${BASE_IP}:8085/api`;
export const ALERT_API_URL = `${BASE_IP}:8081/api`;
export const PARTNER_API_URL = `${BASE_IP}:8083/api`;




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
