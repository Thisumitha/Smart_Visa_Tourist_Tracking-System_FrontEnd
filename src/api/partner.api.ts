// import { partnerApiClient } from '../config/api.config';

export const PartnerAPI = {
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
