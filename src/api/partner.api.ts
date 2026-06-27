import { partnerApiClient } from '../config/api.config';
import { TouristAPI, PassportAPI } from './tourist.api';
import { VisaAPI } from './visa.api';

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
            // Since we don't have the exact agencyId from the JWT yet, we pick the first agency to demonstrate
            const agenciesData = await PartnerAPI.getAllAgencies();
            const agencies = Array.isArray(agenciesData) ? agenciesData : (agenciesData?.content || []);
            if (agencies.length === 0) return [];
            
            const myAgencyId = agencies[0].agencyId; 

            // Get assigned tourist IDs
            const assignedIdsData = await PartnerAPI.getAssignedTourists(myAgencyId);
            const assignedIds = Array.isArray(assignedIdsData) ? assignedIdsData : (assignedIdsData?.content || []);
            if (assignedIds.length === 0) return [];

            // Fetch all tourists and filter
            const allTouristsData = await TouristAPI.getAllTourists();
            const allTourists = Array.isArray(allTouristsData) ? allTouristsData : (allTouristsData?.content || []);
            
            const myTourists = allTourists.filter((t: any) => assignedIds.includes(t.touristId));

            // Map full details
            const detailedTourists = await Promise.all(myTourists.map(async (t: any) => {
                // Fetch passports
                let passportsList: any[] = [];
                try {
                    const passports = await PassportAPI.getPassportsByTouristId(t.touristId);
                    if (passports && passports.length > 0) {
                        passportsList = passports;
                    }
                } catch(e) {}

                // Fetch visas
                let visasList: any[] = [];
                let status = 'Registered';
                try {
                    const visasData = await VisaAPI.getAllVisas(0, 100);
                    const allVisas = Array.isArray(visasData) ? visasData : (visasData?.content || []);
                    visasList = allVisas.filter((v: any) => {
                        return v.touristId === t.touristId || passportsList.some(p => p.passportId === v.passportId);
                    });
                    if (visasList.length > 0) {
                        status = 'Visa Issued';
                    }
                } catch(e) {}

                return {
                    id: t.touristId,
                    name: `${t.firstName} ${t.lastName}`,
                    nationality: t.nationality,
                    passports: passportsList,
                    visas: visasList,
                    status
                };
            }));

            return detailedTourists;
            
        } catch (error) {
            console.error("Failed to get agency tourists", error);
            throw error;
        }
    }
};

export const HotelAPI = {
    /**
     * Create a new Hotel
     */
    createHotel: async (hotelData: any) => {
        try {
            const response = await partnerApiClient.post('/hotel', hotelData);
            return response.data;
        } catch (error) {
            console.error("Failed to create hotel", error);
            throw error;
        }
    },

    /**
     * Get all Hotels
     */
    getAllHotels: async () => {
        try {
            const response = await partnerApiClient.get('/hotel');
            return response.data;
        } catch (error) {
            console.error("Failed to get all hotels", error);
            throw error;
        }
    },

    /**
     * Update an existing Hotel
     */
    updateHotel: async (id: number, hotelData: any) => {
        try {
            const response = await partnerApiClient.put(`/hotel/${id}`, hotelData);
            return response.data;
        } catch (error) {
            console.error("Failed to update hotel", error);
            throw error;
        }
    },

    /**
     * Delete a Hotel
     */
    deleteHotel: async (id: number) => {
        try {
            await partnerApiClient.delete(`/hotel/${id}`);
        } catch (error) {
            console.error("Failed to delete hotel", error);
            throw error;
        }
    }
};
