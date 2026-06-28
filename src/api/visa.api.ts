import { trackingApiClient } from '../config/api.config';

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const VisaAPI = {
    /**
     * Get paginated visas
     */
    getAllVisas: async (page = 0, size = 10, sortBy = 'visaId') => {
        try {
            const response = await trackingApiClient.get(`/visas/all?page=${page}&size=${size}&sortBy=${sortBy}`, getAuthHeaders());
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
            const response = await trackingApiClient.post('/visas', visaData, getAuthHeaders());
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
            const response = await trackingApiClient.put(`/visas/update/${id}`, visaData, getAuthHeaders());
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
            const response = await trackingApiClient.patch(`/visas/partialupdate/${id}`, fields, getAuthHeaders());
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
            await trackingApiClient.delete(`/visas/delete/${id}`, getAuthHeaders());
        } catch (error) {
            console.error("Failed to delete visa", error);
            throw error;
        }
    },

    /**
     * Search visas by Passport ID
     */
    searchByPassportId: async (passportId: number, page = 0, size = 10) => {
        try {
            const response = await trackingApiClient.get(`/visas/search/passport?passportId=${passportId}&page=${page}&size=${size}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Failed to search visas by passport", error);
            throw error;
        }
    },

    searchByVisaType: async (visaType: string, page = 0, size = 10) => {
        try {
            const response = await trackingApiClient.get(`/visas/search/type?visaType=${visaType}&page=${page}&size=${size}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Failed to search visas by type", error);
            throw error;
        }
    }
};

export const VisaExtensionAPI = {
    getAllVisaExtensions: async (page = 0, size = 10, sortBy = 'extensionId') => {
        try {
            const response = await trackingApiClient.get(`/visaextensions/all?page=${page}&size=${size}&sortBy=${sortBy}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Failed to fetch visa extensions", error);
            throw error;
        }
    },
    createVisaExtension: async (data: { visaId: number, extendedDate: string, reason: string }) => {
        try {
            const response = await trackingApiClient.post('/visaextensions', data, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Failed to create visa extension", error);
            throw error;
        }
    }
};

export const TravelLogAPI = {
    getAllTravelLogs: async (page = 0, size = 1000, sortBy = 'logId') => {
        try {
            const response = await trackingApiClient.get(`/travellogs/all?page=${page}&size=${size}&sortBy=${sortBy}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Failed to fetch travel logs", error);
            throw error;
        }
    },
    getLogsByTouristId: async (touristId: number, page = 0, size = 1000) => {
        try {
            const response = await trackingApiClient.get(`/travellogs/search/tourist?touristId=${touristId}&page=${page}&size=${size}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Failed to fetch travel logs for tourist", error);
            throw error;
        }
    },
    createTravelLog: async (data: { touristId: number, location: string, checkInDate: string, checkOutDate: string }) => {
        try {
            const response = await trackingApiClient.post('/travellogs', data, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Failed to create travel log", error);
            throw error;
        }
    },
    updateTravelLog: async (id: number, data: { location: string, checkInDate: string, checkOutDate: string }) => {
        try {
            // Using partial update for flexibility
            const response = await trackingApiClient.patch(`/travellogs/partialupdate/${id}`, data, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Failed to update travel log", error);
            throw error;
        }
    },
    deleteTravelLog: async (id: number) => {
        try {
            await trackingApiClient.delete(`/travellogs/delete/${id}`, getAuthHeaders());
        } catch (error) {
            console.error("Failed to delete travel log", error);
            throw error;
        }
    }
};
