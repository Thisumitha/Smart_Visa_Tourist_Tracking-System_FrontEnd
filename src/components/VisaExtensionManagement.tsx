import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, Search, History } from 'lucide-react';
import { VisaExtensionAPI, VisaAPI } from '../api/visa.api';
import { TouristAPI, PassportAPI } from '../api/tourist.api';

const VisaExtensionManagement: React.FC = () => {
    const [extensions, setExtensions] = useState<any[]>([]);
    const [visas, setVisas] = useState<any[]>([]);
    const [passports, setPassports] = useState<any[]>([]);
    const [tourists, setTourists] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [extRes, visasRes, passRes, tourRes] = await Promise.all([
                VisaExtensionAPI.getAllVisaExtensions(0, 1000),
                VisaAPI.getAllVisas(0, 1000),
                PassportAPI.getAllPassports(),
                TouristAPI.getAllTourists()
            ]);
            setExtensions(extRes.content || []);
            setVisas(visasRes.content || []);
            setPassports(passRes || []);
            setTourists(tourRes || []);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    // Build Maps for efficient lookup
    const { visaMap, passportMap, touristMap } = useMemo(() => {
        const vMap: Record<number, any> = {};
        visas.forEach(v => { vMap[v.visaId] = v; });

        const pMap: Record<number, any> = {};
        passports.forEach(p => { pMap[p.passportId] = p; });

        const tMap: Record<number, any> = {};
        tourists.forEach(t => { tMap[t.touristId] = t; });

        return { visaMap: vMap, passportMap: pMap, touristMap: tMap };
    }, [visas, passports, tourists]);

    const getTouristName = (visaId: number) => {
        const visa = visaMap[visaId];
        if (!visa || !visa.passportId) return 'Unknown';
        
        const passport = passportMap[visa.passportId];
        if (!passport) return 'Unknown';
        
        // Passports either have nested .tourist or .touristId depending on API response
        let tourist = passport.tourist;
        if (!tourist && passport.touristId) {
            tourist = touristMap[passport.touristId];
        }
        
        return tourist ? `${tourist.firstName} ${tourist.lastName}` : 'Unknown';
    };

    // Filter extensions based on search
    const filteredExtensions = useMemo(() => {
        if (!searchQuery) return extensions;
        const lowerQ = searchQuery.toLowerCase();
        return extensions.filter(ext => {
            const tName = getTouristName(ext.visaId).toLowerCase();
            const vId = String(ext.visaId);
            const reason = (ext.reason || '').toLowerCase();
            return tName.includes(lowerQ) || vId.includes(lowerQ) || reason.includes(lowerQ);
        });
    }, [extensions, searchQuery, visaMap, passportMap, touristMap]);

    const formatDate = (dateVal: any) => {
        if (!dateVal) return '';
        if (Array.isArray(dateVal)) {
            const [y, m, d] = dateVal;
            return `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
        }
        return String(dateVal).split('T')[0];
    };

    return (
        <div className="space-y-8 w-full max-w-5xl mx-auto">
            {/* Header */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-700/50">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <History className="text-amber-400" /> Visa Extension Logs
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">View the history of all extended tourist visas.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input type="text" placeholder="Search by name, visa ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-amber-500" />
                    </div>
                    <div className="px-4 py-2 bg-amber-500/10 text-amber-400 rounded-lg text-sm font-medium border border-amber-500/20 whitespace-nowrap">
                        Total Extensions: {filteredExtensions.length}
                    </div>
                </div>
            </div>

            {/* List Table */}
            <div className="glass-panel rounded-2xl w-full overflow-hidden border border-slate-700/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/80 border-b border-glassborder text-slate-400 text-xs tracking-wider uppercase">
                                <th className="p-4 font-medium">Log ID</th>
                                <th className="p-4 font-medium">Visa ID</th>
                                <th className="p-4 font-medium">Tourist Name</th>
                                <th className="p-4 font-medium">New Expiry Date</th>
                                <th className="p-4 font-medium w-1/3">Reason for Extension</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading extension logs...</td></tr>
                            ) : filteredExtensions.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No visa extensions found.</td></tr>
                            ) : (
                                filteredExtensions.map(ext => (
                                    <tr key={ext.extensionId} className="border-b border-glassborder hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4 font-medium text-white">EXT-{ext.extensionId}</td>
                                        <td className="p-4 text-slate-300">#{ext.visaId}</td>
                                        <td className="p-4 text-indigo-300 font-medium">{getTouristName(ext.visaId)}</td>
                                        <td className="p-4 text-amber-400 font-medium whitespace-nowrap">
                                            <div className="flex items-center gap-2"><Calendar size={14} /> {formatDate(ext.extendedDate)}</div>
                                        </td>
                                        <td className="p-4 text-slate-400 italic">"{ext.reason}"</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VisaExtensionManagement;
