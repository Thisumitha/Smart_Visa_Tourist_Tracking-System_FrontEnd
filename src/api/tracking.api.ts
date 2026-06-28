const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const TrackingAPI = {
    /**
     * Hotel/Agency: Log a tourist's location (Check-in)
     */
    logLocation: async (_data: { touristId: number; locationType: string; locationId: string; remarks?: string }) => {
        try {
            // const response = await trackingApiClient.post('/tracking/log', data);
            // return response.data;
            
            return new Promise(resolve => {
                setTimeout(() => resolve({ success: true, message: "Location logged successfully." }), 600);
            });
        } catch (error) {
            console.error("Failed to log location", error);
            throw error;
        }
    }
};
