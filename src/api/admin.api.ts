import { TouristAPI } from './tourist.api';

// Dummy API for Admin Dashboard functionality using multiple microservices
export const AdminAPI = {
    /**
     * Fetches all registered tourists from the Tourist Service
     */
    getAllTourists: async () => {
        try {
            const tourists = await TouristAPI.getAllTourists();
            // Map the real backend data to the UI format expected by the overview
            return tourists.map((t: any) => ({
                id: t.touristId,
                name: `${t.firstName} ${t.lastName}`,
                passport: t.nationality, // Backend doesn't have passport, so we show nationality
                status: 'Registered'
            }));
        } catch (error) {
            console.error("Failed to fetch real tourists for admin dashboard", error);
            return [];
        }
    },

    /**
     * Fetches tracking locations from the Tracking Service
     */
    getRecentLocations: async () => {
        // const response = await trackingApiClient.get('/locations/recent');
        // return response.data;
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    { id: 101, touristId: 1, location: 'Grand Palace Hotel', timestamp: new Date().toISOString() },
                    { id: 102, touristId: 3, location: 'International Airport', timestamp: new Date().toISOString() },
                ]);
            }, 600);
        });
    }
};
