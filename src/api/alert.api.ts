import axios from 'axios';
import { ALERT_API_URL } from '../config/api.config';

export const AlertAPI = {
    getAllAlerts: async (page = 0, size = 20) => {
        const response = await axios.get(`${ALERT_API_URL}/v1/alerts/get-all`, {
            params: {
                page,
                size
            }
        });
        return response.data;
    },

    deleteAlert: async (id: number) => {
        const response = await axios.delete(`${ALERT_API_URL}/v1/alerts/delete/${id}`);
        return response.data;
    }
};
