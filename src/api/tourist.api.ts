import { touristApiClient } from '../config/api.config';

export const TouristAPI = {
    /**
     * Admin/Immigration: Register a new tourist via the real backend
     */
    registerTourist: async (touristData: any) => {
        try {
            const response = await touristApiClient.post('/tourists', touristData);
            return response.data;
        } catch (error) {
            console.error("Failed to register tourist", error);
            throw error;
        }
    },

    /**
     * Admin: Get all tourists from the real backend
     */
    getAllTourists: async () => {
        try {
            const response = await touristApiClient.get('/tourists');
            return response.data;
        } catch (error) {
            console.error("Failed to fetch tourists", error);
            throw error;
        }
    },

    /**
     * Admin: Update a tourist
     */
    updateTourist: async (id: number, touristData: any) => {
        try {
            const response = await touristApiClient.put(`/tourists/${id}`, touristData);
            return response.data;
        } catch (error) {
            console.error("Failed to update tourist", error);
            throw error;
        }
    },

    /**
     * Admin: Delete a tourist
     */
    deleteTourist: async (id: number) => {
        try {
            await touristApiClient.delete(`/tourists/${id}`);
        } catch (error) {
            console.error("Failed to delete tourist", error);
            throw error;
        }
    },

    /**
     * Hotel: Lookup tourist profile by passport
     */
    getTouristByPassport: async (passportNumber: string) => {
        try {
            // Note: Currently tourist-service doesn't have a direct "search by passport" endpoint.
            // When backend implements GET /tourists/search?passport=X, uncomment this:
            // const response = await touristApiClient.get(`/tourists/search?passport=${passportNumber}`);
            // return response.data;
            
            return new Promise(resolve => {
                setTimeout(() => resolve({ 
                    id: 1234, 
                    fullName: "Alexander Pierce", 
                    passportNumber, 
                    nationality: "United Kingdom",
                    behaviorScore: 100,
                    visaStatus: "Active" 
                }), 500);
            });
        } catch (error) {
            console.error("Failed to find tourist", error);
            throw error;
        }
    }
};

export const PassportAPI = {
    /**
     * Create a new passport for a tourist
     */
    createPassport: async (touristId: number, passportData: any) => {
        try {
            const response = await touristApiClient.post(`/passports/tourist/${touristId}`, passportData);
            return response.data;
        } catch (error) {
            console.error("Failed to create passport", error);
            throw error;
        }
    },

    /**
     * Get all passports
     */
    getAllPassports: async () => {
        try {
            const response = await touristApiClient.get(`/passports`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch all passports", error);
            throw error;
        }
    },

    /**
     * Get passports for a specific tourist
     */
    getPassportsByTouristId: async (touristId: number) => {
        try {
            const response = await touristApiClient.get(`/passports/tourist/${touristId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch passports", error);
            throw error;
        }
    },

    /**
     * Update an existing passport
     */
    updatePassport: async (id: number, touristId: number, passportData: any) => {
        try {
            const response = await touristApiClient.put(`/passports/${id}/tourist/${touristId}`, passportData);
            return response.data;
        } catch (error) {
            console.error("Failed to update passport", error);
            throw error;
        }
    },

    /**
     * Delete a passport
     */
    deletePassport: async (id: number) => {
        try {
            await touristApiClient.delete(`/passports/${id}`);
        } catch (error) {
            console.error("Failed to delete passport", error);
            throw error;
        }
    }
};
