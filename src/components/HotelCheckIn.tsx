import React, { useState, useEffect } from 'react';
import { Search, MapPin, User, CheckCircle2, Building2 } from 'lucide-react';
import { PassportAPI, TouristAPI } from '../api/tourist.api';
import { HotelCheckInAPI, HotelAPI } from '../api/partner.api';
import Swal from 'sweetalert2';

const HotelCheckIn: React.FC = () => {
    const [passportNumber, setPassportNumber] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [touristData, setTouristData] = useState<any>(null);
    const [hotelId, setHotelId] = useState<number | null>(null);

    useEffect(() => {
        // Since we don't have a real login system with hotel ID, we fetch hotels and use the first one
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
        if (!passportNumber.trim()) return;

        setIsSearching(true);
        setTouristData(null);

        try {
            // 1. Fetch all passports to find the matching one
            const allPassports = await PassportAPI.getAllPassports();
            
            const match = allPassports.find((p: any) => 
                p.passportNumber.toLowerCase() === passportNumber.toLowerCase()
            );

            if (!match) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Not Found',
                    text: 'No tourist found with that passport number.',
                    background: '#0f172a',
                    color: '#fff'
                });
                return;
            }

            // 2. Fetch Tourist Details using touristId from passport
            const tourist = await TouristAPI.getTouristById(match.touristId);
            
            setTouristData({
                ...tourist,
                passport: match
            });

        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to search tourist. Please try again.',
                background: '#0f172a',
                color: '#fff'
            });
        } finally {
            setIsSearching(false);
        }
    };

    const handleCheckIn = async () => {
        if (!touristData || !hotelId) return;

        try {
            await HotelCheckInAPI.checkInTourist(hotelId, touristData.touristId);
            
            Swal.fire({
                icon: 'success',
                title: 'Checked In!',
                text: `${touristData.firstName} has been successfully checked in.`,
                background: '#0f172a',
                color: '#fff',
                confirmButtonColor: '#10b981'
            });

            // Reset after check-in
            setTouristData(null);
            setPassportNumber('');

        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Check-In Failed',
                text: error.response?.data || 'Could not complete check-in.',
                background: '#0f172a',
                color: '#fff',
                confirmButtonColor: '#ef4444'
            });
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <div className="glass-panel p-8 rounded-2xl border border-slate-700/50">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Building2 className="text-amber-400" /> Tourist Check-In
                </h2>
                
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            required
                            value={passportNumber}
                            onChange={(e) => setPassportNumber(e.target.value)}
                            placeholder="Enter Passport Number (e.g. N23232)"
                            className="w-full pl-12 pr-4 py-4 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500 outline-none text-lg"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={isSearching}
                        className="px-8 py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl font-medium transition-all shadow-lg shadow-amber-600/20"
                    >
                        {isSearching ? 'Searching...' : 'Search'}
                    </button>
                </form>
            </div>

            {touristData && (
                <div className="glass-panel p-8 rounded-2xl border border-slate-700/50 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                <User className="text-amber-400" />
                                {touristData.firstName} {touristData.lastName}
                            </h3>
                            <div className="mt-4 space-y-2">
                                <p className="text-slate-300 flex items-center gap-2">
                                    <span className="font-medium text-slate-400 w-32">Passport No:</span> 
                                    <span className="text-white bg-slate-800 px-2 py-1 rounded-md">{touristData.passport.passportNumber}</span>
                                </p>
                                <p className="text-slate-300 flex items-center gap-2">
                                    <span className="font-medium text-slate-400 w-32">Nationality:</span> 
                                    {touristData.nationality}
                                </p>
                                <p className="text-slate-300 flex items-center gap-2">
                                    <span className="font-medium text-slate-400 w-32">Date of Birth:</span> 
                                    {touristData.dateOfBirth}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full font-medium text-sm mb-6">
                                <CheckCircle2 size={16} /> Verified Profile
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-700/50 flex justify-end">
                        <button 
                            onClick={handleCheckIn}
                            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                        >
                            <MapPin size={20} />
                            Confirm Hotel Check-In
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HotelCheckIn;
