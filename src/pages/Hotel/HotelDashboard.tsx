import React, { useState } from 'react';
import { TouristAPI } from '../../api/tourist.api';
import { HotelCheckInAPI, HotelAPI } from '../../api/partner.api';
import { Building2, Search, UserCheck, MapPin } from 'lucide-react';
import PillNav from '../../components/PillNav';

const hotelNavItems = [
    { id: 'checkin', label: 'Guest Check-in', icon: <UserCheck size={15} /> },
];

const HotelDashboard: React.FC = () => {
    const [passport, setPassport] = useState('');
    const [tourist, setTourist] = useState<any>(null);
    const [searching, setSearching] = useState(false);
    const [checkingIn, setCheckingIn] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    const [hotelId, setHotelId] = useState<number | null>(null);

    React.useEffect(() => {
        const fetchHotelId = async () => {
            try {
                const hotelsData = await HotelAPI.getAllHotels();
                const hotels = Array.isArray(hotelsData) ? hotelsData : (hotelsData?.content || []);
                if (hotels.length > 0) {
                    setHotelId(hotels[0].hotelId);
                }
            } catch (error) {
                console.error("Failed to fetch hotel ID", error);
            }
        };
        fetchHotelId();
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passport) return;
        setSearching(true);
        setTourist(null);
        setStatusMsg('');
        try {
            const data = await TouristAPI.getHotelTouristView(passport);
            setTourist({
                touristId: data.touristId,
                fullName: `${data.firstName} ${data.lastName}`,
                visaStatus: data.visaStatus
            });
        } catch (error) {
            console.error("Error retrieving tourist data", error);
            setStatusMsg('Tourist not found or error retrieving data.');
        } finally {
            setSearching(false);
        }
    };

    const handleCheckIn = async () => {
        if (!tourist || !hotelId) return;
        setCheckingIn(true);
        try {
            await HotelCheckInAPI.checkInTourist(hotelId, tourist.touristId);
            setStatusMsg(`Successfully checked in ${tourist.fullName}.`);
            setTourist(null);
            setPassport('');
        } catch (error: any) {
            setStatusMsg(error.response?.data || 'Failed to check-in tourist.');
        } finally {
            setCheckingIn(false);
        }
    };

    return (
        <div className="min-h-screen text-slate-800">
            {/* Floating Pill Navigation */}
            <PillNav
                logoIcon={<Building2 size={18} />}
                logoLabel="Hotel Partners Hub"
                navItems={hotelNavItems}
                activeTab="checkin"
                onTabChange={() => {}}
            />

            {/* Main Content Canvas */}
            <main className="dashboard-canvas pb-8">
                <div className="max-w-2xl mx-auto mt-4">
                    <div className="glass-panel rounded-2xl p-8 shadow-card">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <UserCheck className="text-slate-500" size={22} /> Tourist Check-in Interface
                            </h1>
                            <p className="text-slate-500 text-sm">Scan or manually enter the tourist passport to log their stay.</p>
                        </div>

                        {statusMsg && (
                            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm font-medium">
                                {statusMsg}
                            </div>
                        )}

                        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Search size={16} />
                                </div>
                                <input
                                    type="text"
                                    value={passport}
                                    onChange={(e) => setPassport(e.target.value)}
                                    className="input-light pl-10 uppercase"
                                    placeholder="Enter Passport Number"
                                />
                            </div>
                            <button type="submit" disabled={searching} className="btn-primary px-6">
                                {searching ? 'Searching...' : 'Search'}
                            </button>
                        </form>

                        {tourist && (
                            <div className="bg-slate-50 border border-glassborder rounded-xl p-6">
                                <h3 className="text-base font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-3">
                                    Profile Found
                                </h3>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Full Name</div>
                                        <div className="font-medium text-slate-800">{tourist.fullName}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Visa Status</div>
                                        <div className={`font-medium ${tourist.visaStatus?.toLowerCase().includes('expire') ? 'text-red-600' : 'text-emerald-600'}`}>
                                            {tourist.visaStatus}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckIn}
                                    disabled={checkingIn}
                                    className="btn-primary w-full py-3"
                                >
                                    <MapPin size={16} />
                                    {checkingIn ? 'Logging Location...' : 'Confirm Check-in & Track Location'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HotelDashboard;
