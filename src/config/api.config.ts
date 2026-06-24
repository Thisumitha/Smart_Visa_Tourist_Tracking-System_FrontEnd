import axios from 'axios';

// ==========================================
// Environment Toggle (Local vs Production)
// ==========================================
const IS_PRODUCTION = false; // Change to true when deploying to your VPS

const LOCAL_IP = 'http://localhost';
const PROD_IP = 'http://207.180.253.221';
const BASE_IP = IS_PRODUCTION ? PROD_IP : LOCAL_IP;

// ==========================================
// Microservice Base URLs
// ==========================================
export const AUTH_API_URL = `${BASE_IP}:8080/api`;
export const TOURIST_API_URL = `${BASE_IP}:8081/api`;
export const TRACKING_API_URL = `${BASE_IP}:8082/api`;
export const ALERT_API_URL = `${BASE_IP}:8083/api`;
export const PARTNER_API_URL = `${BASE_IP}:8084/api`;



// ==========================================
// Interceptor to inject JWT Token
// ==========================================
const setupInterceptors = (instance: any) => {
    instance.interceptors.request.use(
        (config: any) => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        },
        (error: any) => {
            return Promise.reject(error);
        }
    );
};

// ==========================================
// Axios Instances for each Microservice
// ==========================================

export const authApiClient = axios.create({
    baseURL: AUTH_API_URL,
    headers: { 'Content-Type': 'application/json' }
});
// Attach interceptor so secured auth endpoints work
setupInterceptors(authApiClient);

export const touristApiClient = axios.create({
    baseURL: TOURIST_API_URL,
    headers: { 'Content-Type': 'application/json' }
});
setupInterceptors(touristApiClient);

export const trackingApiClient = axios.create({
    baseURL: TRACKING_API_URL,
    headers: { 'Content-Type': 'application/json' }
});
setupInterceptors(trackingApiClient);

export const alertApiClient = axios.create({
    baseURL: ALERT_API_URL,
    headers: { 'Content-Type': 'application/json' }
});
setupInterceptors(alertApiClient);

export const partnerApiClient = axios.create({
    baseURL: PARTNER_API_URL,
    headers: { 'Content-Type': 'application/json' }
});
setupInterceptors(partnerApiClient);
