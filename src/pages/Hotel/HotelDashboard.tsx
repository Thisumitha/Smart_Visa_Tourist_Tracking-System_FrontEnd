import React, { useState } from 'react';
import { TouristAPI } from '../../api/tourist.api';
import { TrackingAPI } from '../../api/tracking.api';
import { Building2, Search, UserCheck, MapPin, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HotelDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [passport, setPassport] = useState('');
    const [tourist, setTourist] = useState<any>(null);
    const [searching, setSearching] = useState(false);
    const [checkingIn, setCheckingIn] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passport) return;
        setSearching(true);
        setTourist(null);
        setStatusMsg('');
        try {
            const data = await TouristAPI.getTouristByPassport(passport);
            setTourist(data);
        } catch (error) {
            setStatusMsg('Tourist not found. Please check the passport number.');
        } finally {
            setSearching(false);
        }
    };

    const handleCheckIn = async () => {
        if (!tourist) return;
        setCheckingIn(true);
        try {
            await TrackingAPI.logLocation({ touristId: tourist.id, locationType: 'HOTEL', locationId: 'HOTEL_A1' });
            setStatusMsg(`Successfully checked in ${tourist.fullName}. Location tracked.`);
            setTourist(null);
            setPassport('');
        } catch (error) {
            setStatusMsg('Failed to log check-in.');
        } finally {
            setCheckingIn(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
            <header className="h-16 glass-panel border-x-0 border-t-0 rounded-none flex items-center justify-between px-8 z-10 sticky top-0">
                <div className="flex items-center gap-3">
                    <Building2 className="text-amber-500" size={24} />
                    <h2 className="text-xl font-bold text-white tracking-wide">Hotel Partners Hub</h2>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 font-medium transition-colors">
                    <LogOut size={18} /> Sign Out
                </button>
            </header>

            <main className="flex-1 p-8 bg-[url('https://images.unsplash.com/photo-1542314831-c6a4d27ce6a2?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-fixed relative">
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-0"></div>
                
                <div className="relative z-10 max-w-2xl mx-auto mt-8">
                    <div className="glass-panel rounded-2xl p-8 shadow-2xl border border-amber-500/20">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                <UserCheck className="text-amber-400" /> Tourist Check-in Interface
                            </h1>
                            <p className="text-slate-400">Scan or manually enter the tourist passport to log their stay.</p>
                        </div>

                        {statusMsg && (
                            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/50 rounded-xl text-amber-400 text-sm font-medium">
                                {statusMsg}
                            </div>
                        )}

                        <form onSubmit={handleSearch} className="flex gap-4 mb-8">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <Search size={18} />
                                </div>
                                <input type="text" value={passport} onChange={(e) => setPassport(e.target.value)} className="block w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all uppercase" placeholder="Enter Passport Number" />
                            </div>
                            <button type="submit" disabled={searching} className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition-all disabled:opacity-50">
                                {searching ? 'Searching...' : 'Search'}
                            </button>
                        </form>

                        {tourist && (
                            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-700 pb-2">Profile Found</h3>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Full Name</div>
                                        <div className="font-medium text-slate-200">{tourist.fullName}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Nationality</div>
                                        <div className="font-medium text-slate-200">{tourist.nationality}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Visa Status</div>
                                        <div className="font-medium text-emerald-400">{tourist.visaStatus}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Behavior Score</div>
                                        <div className="font-medium text-blue-400">{tourist.behaviorScore}/100</div>
                                    </div>
                                </div>
                                
                                <button onClick={handleCheckIn} disabled={checkingIn} className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all disabled:opacity-50">
                                    <MapPin size={18} />
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
