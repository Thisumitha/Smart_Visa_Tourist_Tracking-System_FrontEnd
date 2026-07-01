import { partnerApiClient } from '../config/api.config';
import { TouristAPI, PassportAPI } from './tourist.api';
import { VisaAPI } from './visa.api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const PartnerAPI = {
    /**
     * Create a new Travel Agency
     */
    createAgency: async (agencyData: any) => {
        try {
            const response = await partnerApiClient.post('/agency', agencyData, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Failed to create agency", error);
            throw error;
        }
    },

    /**
     * Get all Travel Agencies with pagination
     */
    getAllAgencies: async (pageNo: number = 0, pageSize: number = 10, sortBy: string = 'agencyName', sortDir: string = 'asc') => {
        try {
            const params = new URLSearchParams({
                pageNo: pageNo.toString(),
                pageSize: pageSize.toString(),
                sortBy,
                sortDir
            });
            const response = await partnerApiClient.get(`/agency?${params.toString()}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Failed to get all agencies", error);
            throw error;
        }
    },

    /**
     * Get Travel Agency by ID
     */
    getAgencyById: async (id: number) => {
        try {
            const response = await partnerApiClient.get(`/agency/${id}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Failed to get agency by ID", error);
            throw error;
        }
    },

    /**
     * Assign a tourist to an agency
     */
    assignTouristToAgency: async (agencyId: number, touristId: number) => {
        try {
            const response = await partnerApiClient.post(`/agency/${agencyId}/assign-tourist/${touristId}`, {}, getAuthHeaders());
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
            const response = await partnerApiClient.put(`/agency/${agencyId}/reassign-tourist/${touristId}`, {}, getAuthHeaders());
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
            const response = await partnerApiClient.put(`/agency/${id}`, agencyData, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Failed to update agency", error);
            throw error;
        }
    },

    /**
     * Partially update an existing Travel Agency
     */
    partialUpdateAgency: async (id: number, agencyData: any) => {
        try {
            const response = await partnerApiClient.patch(`/agency/${id}`, agencyData, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Failed to partially update agency", error);
            throw error;
        }
    },

    /**
     * Delete a Travel Agency
     */
    deleteAgency: async (id: number) => {
        try {
            await partnerApiClient.delete(`/agency/${id}`, getAuthHeaders());
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
            const response = await partnerApiClient.get(`/agency/${agencyId}/tourists`, getAuthHeaders());
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
            const response = await partnerApiClient.post('/hotel', hotelData, getAuthHeaders());
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
            const response = await partnerApiClient.get('/hotel', getAuthHeaders());
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
            const response = await partnerApiClient.put(`/hotel/${id}`, hotelData, getAuthHeaders());
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
            await partnerApiClient.delete(`/hotel/${id}`, getAuthHeaders());
        } catch (error) {
            console.error("Failed to delete hotel", error);
            throw error;
        }
    }
};



export const HotelCheckInAPI = {
    /**
     * Mark a tourist as checked in at a hotel
     */
    checkInTourist: async (hotelId: number, touristId: number) => {
        try {
            const response = await partnerApiClient.post(`/v1/hotelCheckIn/${hotelId}/assign-tourist/${touristId}`, {}, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Failed to check in tourist", error);
            throw error;
        }
    },

    /**
     * Get list of tourist IDs checked into a hotel
     */
    getCheckedInTourists: async (hotelId: number) => {
        try {
            const response = await partnerApiClient.get(`/v1/hotelCheckIn/${hotelId}/tourists`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Failed to fetch checked-in tourists", error);
            throw error;
        }
    },

    getTouristTravelHistory: async (touristId: number) => {
        try {
            const response = await partnerApiClient.get(`/v1/hotelCheckIn/tourist/${touristId}/history`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Failed to fetch tourist travel history", error);
            throw error;
        }
    }
};
