import { trackingApiClient } from '../config/api.config';

export const VisaAPI = {
    /**
     * Get paginated visas
     */
    getAllVisas: async (page = 0, size = 10, sortBy = 'visaId') => {
        try {
            const response = await trackingApiClient.get(`/visas/all?page=${page}&size=${size}&sortBy=${sortBy}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch visas", error);
            throw error;
        }
    },

    /**
     * Create a new visa
     */
    createVisa: async (visaData: any) => {
        try {
            const response = await trackingApiClient.post('/visas', visaData);
            return response.data;
        } catch (error) {
            console.error("Failed to create visa", error);
            throw error;
        }
    },

    /**
     * Update an existing visa
     */
    updateVisa: async (id: number, visaData: any) => {
        try {
            const response = await trackingApiClient.put(`/visas/update/${id}`, visaData);
            return response.data;
        } catch (error) {
            console.error("Failed to update visa", error);
            throw error;
        }
    },

    /**
     * Partially update an existing visa (e.g. assigning a touristId)
     */
    partialUpdateVisa: async (id: number, fields: any) => {
        try {
            const response = await trackingApiClient.patch(`/visas/partialupdate/${id}`, fields);
            return response.data;
        } catch (error) {
            console.error("Failed to partially update visa", error);
            throw error;
        }
    },

    /**
     * Delete a visa
     */
    deleteVisa: async (id: number) => {
        try {
            await trackingApiClient.delete(`/visas/delete/${id}`);
        } catch (error) {
            console.error("Failed to delete visa", error);
            throw error;
        }
    },

    /**
     * Search visas by Tourist ID
     */
    searchByTouristId: async (touristId: number, page = 0, size = 10) => {
        try {
            const response = await trackingApiClient.get(`/visas/search/tourist?touristId=${touristId}&page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            console.error("Failed to search visas by tourist", error);
            throw error;
        }
    },

    /**
     * Search visas by Type
     */
    searchByVisaType: async (visaType: string, page = 0, size = 10) => {
        try {
            const response = await trackingApiClient.get(`/visas/search/type?visaType=${visaType}&page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            console.error("Failed to search visas by type", error);
            throw error;
        }
    }
};
