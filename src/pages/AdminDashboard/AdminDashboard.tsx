import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, MapPin, Activity, ShieldCheck, ChevronRight } from 'lucide-react';
import { AdminAPI } from '../../api/admin.api';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [tourists, setTourists] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [touristsData, locationsData] = await Promise.all([
                    AdminAPI.getAllTourists(),
                    AdminAPI.getRecentLocations()
                ]);
                setTourists(touristsData as any[]);
                setLocations(locationsData as any[]);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-950 flex text-slate-200">
            {/* Sidebar */}
            <aside className="w-64 glass-panel border-y-0 border-l-0 rounded-none flex flex-col hidden md:flex">
                <div className="p-6 border-b border-glassborder flex items-center gap-3">
                    <ShieldCheck className="text-blue-500" size={28} />
                    <span className="font-bold text-lg tracking-wide text-white">SmartVisa Admin</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30 transition-all">
                        <Activity size={20} />
                        <span className="font-medium">Dashboard</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 text-slate-400 hover:text-white rounded-xl transition-all">
                        <Users size={20} />
                        <span className="font-medium">Tourists</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 text-slate-400 hover:text-white rounded-xl transition-all">
                        <MapPin size={20} />
                        <span className="font-medium">Live Tracking</span>
                    </a>
                </nav>
                <div className="p-4 border-t border-glassborder">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-20 glass-panel border-x-0 border-t-0 rounded-none flex items-center justify-between px-8 z-10">
                    <h2 className="text-xl font-semibold text-white">System Overview</h2>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold border-2 border-slate-800 shadow-lg">
                            A
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gradient-to-b from-slate-900 to-slate-950">
                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-panel p-6 rounded-2xl">
                            <div className="text-slate-400 text-sm font-medium mb-2 flex justify-between items-center">
                                Total Registered
                                <Users size={16} className="text-blue-400"/>
                            </div>
                            <div className="text-3xl font-bold text-white">{loading ? '...' : tourists.length}</div>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl">
                            <div className="text-slate-400 text-sm font-medium mb-2 flex justify-between items-center">
                                Active Trackers
                                <MapPin size={16} className="text-emerald-400"/>
                            </div>
                            <div className="text-3xl font-bold text-white">{loading ? '...' : locations.length}</div>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl">
                            <div className="text-slate-400 text-sm font-medium mb-2 flex justify-between items-center">
                                System Status
                                <Activity size={16} className="text-indigo-400"/>
                            </div>
                            <div className="text-xl font-bold text-emerald-400 mt-2 flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Healthy
                            </div>
                        </div>
                    </div>

                    {/* Tables Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="glass-panel rounded-2xl flex flex-col">
                            <div className="p-6 border-b border-glassborder flex justify-between items-center">
                                <h3 className="text-lg font-medium text-white">Recent Tourists</h3>
                                <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center">View All <ChevronRight size={16}/></button>
                            </div>
                            <div className="p-6">
                                {loading ? (
                                    <div className="text-center text-slate-500 py-8">Loading data...</div>
                                ) : (
                                    <div className="space-y-4">
                                        {tourists.map(t => (
                                            <div key={t.id} className="flex justify-between items-center p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
                                                <div>
                                                    <div className="font-medium text-white">{t.name}</div>
                                                    <div className="text-sm text-slate-400">Passport: {t.passport}</div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${t.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                                                    {t.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="glass-panel rounded-2xl flex flex-col">
                            <div className="p-6 border-b border-glassborder flex justify-between items-center">
                                <h3 className="text-lg font-medium text-white">Live Location Pings</h3>
                            </div>
                            <div className="p-6">
                                {loading ? (
                                    <div className="text-center text-slate-500 py-8">Loading data...</div>
                                ) : (
                                    <div className="space-y-4">
                                        {locations.map(loc => (
                                            <div key={loc.id} className="flex gap-4 items-start p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                                                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                                                    <MapPin size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{loc.location}</div>
                                                    <div className="text-sm text-slate-400">Tourist #{loc.touristId} • {new Date(loc.timestamp).toLocaleTimeString()}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
