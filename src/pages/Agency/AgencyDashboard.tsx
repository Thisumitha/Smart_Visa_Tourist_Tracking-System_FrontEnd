import React, { useEffect, useState } from 'react';
import { PartnerAPI } from '../../api/partner.api';
import { Compass, Map, LogOut, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AgencyDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [tourists, setTourists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTourists = async () => {
            try {
                const data = await PartnerAPI.getAgencyTourists();
                setTourists(data as any[]);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchTourists();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
            <header className="h-16 glass-panel border-x-0 border-t-0 rounded-none flex items-center justify-between px-8 z-10 sticky top-0">
                <div className="flex items-center gap-3">
                    <Compass className="text-indigo-500" size={24} />
                    <h2 className="text-xl font-bold text-white tracking-wide">Agency Portal</h2>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 font-medium transition-colors">
                    <LogOut size={18} /> Sign Out
                </button>
            </header>

            <main className="flex-1 p-8 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 relative">
                <div className="max-w-6xl mx-auto mt-4">
                    <div className="mb-8 flex justify-between items-end">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                <Map className="text-indigo-400" /> Itinerary Navigation
                            </h1>
                            <p className="text-slate-400">Manage and track tourists assigned to your agency.</p>
                        </div>
                    </div>

                    <div className="glass-panel rounded-2xl overflow-hidden border border-indigo-500/20">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/60 border-b border-glassborder text-slate-400 text-sm tracking-wider uppercase">
                                    <th className="p-4 font-medium">Tourist Name</th>
                                    <th className="p-4 font-medium">Passport</th>
                                    <th className="p-4 font-medium">Itinerary / Route</th>
                                    <th className="p-4 font-medium">Tour Status</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500">Loading assigned tourists...</td>
                                    </tr>
                                ) : (
                                    tourists.map(t => (
                                        <tr key={t.id} className="border-b border-glassborder hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 font-medium text-white">{t.name}</td>
                                            <td className="p-4 text-slate-400">{t.passport}</td>
                                            <td className="p-4 text-slate-300">
                                                <div className="flex items-center gap-2">
                                                    <Map size={14} className="text-indigo-400" /> {t.itinerary}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                                                    t.status === 'On Tour' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                                                    t.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                }`}>
                                                    {t.status === 'Completed' && <CheckCircle2 size={12} />}
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">Update Route</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AgencyDashboard;
