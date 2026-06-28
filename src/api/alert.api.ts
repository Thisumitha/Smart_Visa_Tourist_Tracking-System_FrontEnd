import { alertApiClient } from '../config/api.config';

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const AlertAPI = {
    getAllAlerts: async (page = 0, size = 20) => {
        const response = await alertApiClient.get(`/v1/alerts/get-all`, {
            ...getAuthHeaders(),
            params: {
                page,
                size
            }
        });
        return response.data;
    },

    deleteAlert: async (id: number) => {
        const response = await alertApiClient.delete(`/v1/alerts/delete/${id}`, getAuthHeaders());
        return response.data;
    }
};
