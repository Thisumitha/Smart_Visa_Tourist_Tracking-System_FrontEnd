// Dummy API for Admin Dashboard functionality using multiple microservices
export const AdminAPI = {
    /**
     * Fetches all registered tourists from the Tourist Service
     */
    getAllTourists: async () => {
        // const response = await touristApiClient.get('/tourists');
        // return response.data;
        
        // Returning dummy data for UI display since TouristService might not be fully built
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    { id: 1, name: 'John Doe', passport: 'AB123456', status: 'Approved' },
                    { id: 2, name: 'Jane Smith', passport: 'CD789012', status: 'Pending Verification' },
                    { id: 3, name: 'Carlos Ray', passport: 'XY987654', status: 'Approved' },
                ]);
            }, 500);
        });
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
