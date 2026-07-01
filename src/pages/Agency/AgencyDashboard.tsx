import React, { useEffect, useState } from 'react';
import { PartnerAPI } from '../../api/partner.api';
import { Map, CheckCircle2, Compass, Globe, LayoutDashboard, Search } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import PillNav from '../../components/PillNav';
import TouristOverview from '../../components/TouristOverview';
import AgencyTravelLog from '../../components/AgencyTravelLog';

const agencyNavItems = [
    { id: 'dashboard',        label: 'Dashboard',       icon: <LayoutDashboard size={15} /> },
    { id: 'tourist-overview', label: 'Tourist Overview', icon: <Globe size={15} /> },
    { id: 'travel-plans',     label: 'Travel Plans',     icon: <Map size={15} /> },
];

const AgencyDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { tab } = useParams<{ tab: string }>();
    const activeTab = tab || 'dashboard';

    const [tourists, setTourists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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
        if (activeTab === 'tourist-overview') return <TouristOverview agencyMode={true} />;
        if (activeTab === 'travel-plans') return <AgencyTravelLog />;

        const filteredTourists = tourists.filter(t => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                t.name?.toLowerCase().includes(q) ||
                t.nationality?.toLowerCase().includes(q) ||
                t.status?.toLowerCase().includes(q)
            );
        });

        return (
            <div className="max-w-6xl mx-auto mt-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-1 flex items-center gap-2">
                            <Map className="text-slate-500" size={22} /> Itinerary Navigation
                        </h1>
                        <p className="text-slate-500 text-sm">Manage and track tourists assigned to your agency.</p>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search tourists..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div className="glass-panel rounded-2xl overflow-hidden shadow-card">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-glassborder text-slate-500 text-xs tracking-wider uppercase">
                                <th className="px-5 py-4 font-medium">Tourist Name</th>
                                <th className="px-5 py-4 font-medium">Nationality</th>
                                <th className="px-5 py-4 font-medium">Passport Expiry</th>
                                <th className="px-5 py-4 font-medium">Visa Expiry</th>
                                <th className="px-5 py-4 font-medium">Tour Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-10 text-center text-slate-400 text-sm">Loading assigned tourists...</td>
                                </tr>
                            ) : filteredTourists.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-10 text-center text-slate-400 text-sm">No tourists found.</td>
                                </tr>
                            ) : (
                                filteredTourists.map(t => (
                                    <tr key={t.id} className="border-b border-glassborder hover:bg-slate-50/60 transition-colors">
                                        <td className="px-5 py-4 font-medium text-slate-800">{t.name}</td>
                                        <td className="px-5 py-4 text-slate-500 text-sm">{t.nationality}</td>
                                        <td className="px-5 py-4">
                                            {t.passports && t.passports.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {t.passports.map((p: any) => (
                                                        <span key={p.passportId} className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                                                            new Date(p.expiryDate) < new Date(Date.now() + 30*24*60*60*1000)
                                                                ? 'bg-red-50 text-red-600 border-red-200'
                                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        }`}>
                                                            {p.expiryDate}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border bg-slate-100 text-slate-500 border-slate-200">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            {t.visas && t.visas.length > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    {t.visas.map((v: any) => (
                                                        <span key={v.visaId} className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                                                            new Date(v.expiryDate) < new Date(Date.now() + 7*24*60*60*1000)
                                                                ? 'bg-red-50 text-red-600 border-red-200'
                                                                : 'bg-slate-100 text-slate-600 border-slate-200'
                                                        }`} title={`${v.visaType} Visa`}>
                                                            {v.visaType} ({v.expiryDate})
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border bg-slate-100 text-slate-500 border-slate-200">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                                                t.status === 'Registered'
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                    : t.status === 'Visa Issued'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}>
                                                {t.status === 'Visa Issued' && <CheckCircle2 size={11} />}
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
        <div className="min-h-screen text-slate-800">
            {/* Floating Pill Navigation */}
            <PillNav
                logoIcon={<Compass size={18} />}
                logoLabel="Agency Portal"
                navItems={agencyNavItems}
                activeTab={activeTab}
                onTabChange={(newTab) => navigate(`/agency/${newTab}`)}
            />

            {/* Main Content Canvas */}
            <main className="dashboard-canvas pb-8">
                {renderContent()}
            </main>
        </div>
    );
};

export default AgencyDashboard;
