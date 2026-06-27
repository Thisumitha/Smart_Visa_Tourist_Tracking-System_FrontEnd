import React, { useEffect, useState } from 'react';
import { PartnerAPI } from '../../api/partner.api';
import { Map, CheckCircle2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AgencySidebar from '../../components/AgencySidebar';
import TouristOverview from '../../components/TouristOverview';
import AgencyTravelLog from '../../components/AgencyTravelLog';

const AgencyDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { tab } = useParams<{ tab: string }>();
    const activeTab = tab || 'dashboard';

    const [tourists, setTourists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (activeTab === 'dashboard') {
            const fetchTourists = async () => {
                setLoading(true);
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
        }
    }, [activeTab]);

    const renderContent = () => {
        if (activeTab === 'tourist-overview') {
            return <TouristOverview agencyMode={true} />;
        }
        if (activeTab === 'travel-plans') {
            return <AgencyTravelLog />;
        }

        return (
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
                                <th className="p-4 font-medium">Nationality</th>
                                <th className="p-4 font-medium">Passport Expiry</th>
                                <th className="p-4 font-medium">Visa Expiry</th>
                                <th className="p-4 font-medium">Tour Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">Loading assigned tourists...</td>
                                </tr>
                            ) : tourists.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">No tourists assigned.</td>
                                </tr>
                            ) : (
                                tourists.map(t => (
                                    <tr key={t.id} className="border-b border-glassborder hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4 font-medium text-white">{t.name}</td>
                                        <td className="p-4 text-slate-400">{t.nationality}</td>
                                        <td className="p-4">
                                            {t.passports && t.passports.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {t.passports.map((p: any) => (
                                                        <span key={p.passportId} className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                                                            new Date(p.expiryDate) < new Date(Date.now() + 30*24*60*60*1000) ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                        }`}>
                                                            {p.expiryDate}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border bg-slate-800 text-slate-400 border-slate-700">
                                                    N/A
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {t.visas && t.visas.length > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    {t.visas.map((v: any) => (
                                                        <span key={v.visaId} className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                                                            new Date(v.expiryDate) < new Date(Date.now() + 7*24*60*60*1000) ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                                            'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                                        }`} title={`${v.visaType} Visa`}>
                                                            {v.visaType} ({v.expiryDate})
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border bg-slate-800 text-slate-400 border-slate-700">
                                                    N/A
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                                                t.status === 'Registered' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                                                t.status === 'Visa Issued' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                                'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                            }`}>
                                                {t.status === 'Visa Issued' && <CheckCircle2 size={12} />}
                                                {t.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-950 flex text-slate-200">
            {/* Sidebar Component */}
            <AgencySidebar 
                activeTab={activeTab} 
                onTabChange={(newTab) => navigate(`/agency/${newTab}`)} 
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-20 glass-panel border-x-0 border-t-0 rounded-none flex items-center justify-between px-8 z-10">
                    <h2 className="text-xl font-semibold text-white capitalize">
                        {activeTab === 'tourist-overview' ? 'Tourist Overview' : activeTab === 'travel-plans' ? 'Travel Plans' : 'Agency Dashboard'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white font-bold border-2 border-slate-800 shadow-lg">
                            AG
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-slate-900 via-indigo-950/20 to-slate-950">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default AgencyDashboard;
