import { alertApiClient } from '../config/api.config';

export const AlertAPI = {
    getAllAlerts: async (page = 0, size = 20) => {
        const response = await alertApiClient.get(`/v1/alerts/get-all`, {
            params: {
                page,
                size
            }
        });
        return response.data;
    },

    deleteAlert: async (id: number) => {
        const response = await alertApiClient.delete(`/v1/alerts/delete/${id}`);
        return response.data;
    }
};
