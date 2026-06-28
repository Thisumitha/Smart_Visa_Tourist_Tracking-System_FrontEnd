import { authApiClient } from '../config/api.config';

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const AuthAPI = {
    /**
     * Authenticates a user and returns a JWT token.
     */
    login: async (credentials: { email: string; password: string }) => {
        const response = await authApiClient.post('/auth/login', credentials);
        return response.data;
    },

    /**
     * Registers a new user. (Secured Endpoint - Requires Admin Token)
     */
    registerUser: async (userData: { email: string; password: string; roles: string[] }) => {
        const response = await authApiClient.post('/users', userData, getAuthHeaders());
        return response.data;
    }
};
