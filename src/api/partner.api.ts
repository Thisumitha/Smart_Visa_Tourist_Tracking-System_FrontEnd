import { partnerApiClient } from '../config/api.config';

export const PartnerAPI = {
    /**
     * Create a new Travel Agency
     */
    createAgency: async (agencyData: any) => {
        try {
            const response = await partnerApiClient.post('/agency', agencyData);
            return response.data;
        } catch (error) {
            console.error("Failed to create agency", error);
            throw error;
        }
    },

    /**
     * Get all Travel Agencies
     */
    getAllAgencies: async () => {
        try {
            const response = await partnerApiClient.get('/agency');
            return response.data;
        } catch (error) {
            console.error("Failed to get all agencies", error);
            throw error;
        }
    },

    /**
     * Assign a tourist to an agency
     */
    assignTouristToAgency: async (agencyId: number, touristId: number) => {
        try {
            const response = await partnerApiClient.post(`/agency/${agencyId}/assign-tourist/${touristId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to assign tourist to agency", error);
            throw error;
        }
    },

    /**
     * Reassign a tourist to a different agency
     */
    reassignTouristToAgency: async (agencyId: number, touristId: number) => {
        try {
            const response = await partnerApiClient.put(`/agency/${agencyId}/reassign-tourist/${touristId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to reassign tourist to agency", error);
            throw error;
        }
    },

    /**
     * Update an existing Travel Agency
     */
    updateAgency: async (id: number, agencyData: any) => {
        try {
            const response = await partnerApiClient.put(`/agency/${id}`, agencyData);
            return response.data;
        } catch (error) {
            console.error("Failed to update agency", error);
            throw error;
        }
    },

    /**
     * Delete a Travel Agency
     */
    deleteAgency: async (id: number) => {
        try {
            await partnerApiClient.delete(`/agency/${id}`);
        } catch (error) {
            console.error("Failed to delete agency", error);
            throw error;
        }
    },

    /**
     * Get tourists assigned to an agency
     */
    getAssignedTourists: async (agencyId: number) => {
        try {
            const response = await partnerApiClient.get(`/agency/${agencyId}/tourists`);
            return response.data; // List<Long> of tourist IDs
        } catch (error) {
            console.error("Failed to get assigned tourists", error);
            throw error;
        }
    },

    /**
     * Agency: Get assigned tourists and itineraries
     */
    getAgencyTourists: async () => {
        try {
            // const response = await partnerApiClient.get('/agencies/my-tourists');
            // return response.data;
            
            return new Promise(resolve => {
                setTimeout(() => resolve([
                    { id: 1, name: "Alexander Pierce", passport: "GB123456", itinerary: "Colombo -> Kandy -> Ella", status: "On Tour" },
                    { id: 2, name: "Maria Garcia", passport: "ES987654", itinerary: "Galle -> Mirissa", status: "Pending Arrival" },
                    { id: 3, name: "Yuki Tanaka", passport: "JP555666", itinerary: "Sigiriya -> Polonnaruwa", status: "Completed" }
                ]), 800);
            });
        } catch (error) {
            console.error("Failed to get agency tourists", error);
            throw error;
        }
    }
};
