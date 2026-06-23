import axios from 'axios';

// ==========================================
// Microservice Base URLs
// ==========================================
// In production, these should come from environment variables (e.g. import.meta.env.VITE_AUTH_API_URL)
export const AUTH_API_URL = 'http://localhost:8080/api';
export const TOURIST_API_URL = 'http://localhost:8081/api';
export const TRACKING_API_URL = 'http://localhost:8082/api';
export const ALERT_API_URL = 'http://localhost:8083/api';
export const PARTNER_API_URL = 'http://localhost:8084/api';

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
