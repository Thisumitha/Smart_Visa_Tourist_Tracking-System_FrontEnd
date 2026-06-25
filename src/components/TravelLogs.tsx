import React, { useEffect, useState } from 'react';
import { History, Search, PlaneLanding, PlaneTakeoff, Globe, Filter } from 'lucide-react';
import { EntryAPI, ExitAPI } from '../api/tourist.api';

interface TouristDTO {
    touristId: number;
    firstName: string;
    lastName: string;
    nationality: string;
}

interface EntryRecordDTO {
    entryId: number;
    airport: string;
    entryDate: string;
    tourist: TouristDTO;
}

interface ExitRecordDTO {
    exitId: number;
    airport: string;
    exitDate: string;
    tourist: TouristDTO;
}

interface TravelTrip {
    id: string; 
    tourist: TouristDTO;
    airport: string;
    arrivalDate: string | null;
    departureDate: string | null;
}

const TravelLogs: React.FC = () => {
    const [logs, setLogs] = useState<TravelTrip[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'All' | 'Active' | 'Completed'>('All');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const [entriesData, exitsData] = await Promise.all([
                EntryAPI.getAllEntryRecords(),
                ExitAPI.getAllExitRecords()
            ]);

            const entries: EntryRecordDTO[] = entriesData.content ? entriesData.content : entriesData;
            const exits: ExitRecordDTO[] = exitsData.content ? exitsData.content : exitsData;

            const trips: TravelTrip[] = [];
            const touristRecords: Record<number, { entries: EntryRecordDTO[], exits: ExitRecordDTO[] }> = {};
            
            entries.forEach(e => {
                if (!touristRecords[e.tourist.touristId]) touristRecords[e.tourist.touristId] = { entries: [], exits: [] };
                touristRecords[e.tourist.touristId].entries.push(e);
            });
            exits.forEach(x => {
                if (!touristRecords[x.tourist.touristId]) touristRecords[x.tourist.touristId] = { entries: [], exits: [] };
                touristRecords[x.tourist.touristId].exits.push(x);
            });

            for (const tId in touristRecords) {
                const { entries: tEntries, exits: tExits } = touristRecords[tId];
                
                tEntries.sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
                tExits.sort((a, b) => new Date(a.exitDate).getTime() - new Date(b.exitDate).getTime());

                tEntries.forEach(entry => {
                    const exitIndex = tExits.findIndex(x => x.airport === entry.airport && new Date(x.exitDate).getTime() >= new Date(entry.entryDate).getTime());
                    
                    let departureDate = null;
                    if (exitIndex !== -1) {
                        departureDate = tExits[exitIndex].exitDate;
                        tExits.splice(exitIndex, 1); // Mark as used
                    }
                    
                    trips.push({
                        id: `trip-entry-${entry.entryId}`,
                        tourist: entry.tourist,
                        airport: entry.airport,
                        arrivalDate: entry.entryDate,
                        departureDate: departureDate
                    });
                });

                // Unmatched exits (e.g. data before tracking started)
                tExits.forEach(exit => {
                    trips.push({
                        id: `trip-exit-${exit.exitId}`,
                        tourist: exit.tourist,
                        airport: exit.airport,
                        arrivalDate: null,
                        departureDate: exit.exitDate
                    });
                });
            }

            // Sort by most recent activity (either departure or arrival)
            trips.sort((a, b) => {
                const aDate = a.departureDate || a.arrivalDate || '';
                const bDate = b.departureDate || b.arrivalDate || '';
                return new Date(bDate).getTime() - new Date(aDate).getTime();
            });

            setLogs(trips);
        } catch (error) {
            console.error("Failed to fetch travel logs", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        // Filter by Status
        if (filterType === 'Active' && log.departureDate) return false; // Active means no departure yet
        if (filterType === 'Completed' && !log.departureDate) return false; // Completed means has departure

        // Search Query
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const fullName = `${log.tourist.firstName} ${log.tourist.lastName}`.toLowerCase();
            if (
                !fullName.includes(q) &&
                !log.tourist.nationality.toLowerCase().includes(q) &&
                !log.airport.toLowerCase().includes(q) &&
                !log.tourist.touristId.toString().includes(q)
            ) {
                return false;
            }
        }
        
        return true;
    });

    return (
        <div className="space-y-6 max-w-6xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <History className="text-indigo-400" /> Border Travel Logs
                    </h2>
                    <p className="text-slate-400 mt-1 text-sm">View comprehensive arrival and departure records.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search Name or Country..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500 transition-colors text-sm"
                        />
                    </div>
                    
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <select 
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className="pl-9 pr-8 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500 appearance-none text-sm cursor-pointer"
                        >
                            <option value="All">All Records</option>
                            <option value="Active">Active Trips (In Country)</option>
                            <option value="Completed">Completed Trips</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="glass-panel rounded-2xl overflow-hidden border border-slate-700/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/80 border-b border-slate-700 text-slate-400 text-sm tracking-wider uppercase">
                                <th className="p-4 font-semibold">Tourist Name</th>
                                <th className="p-4 font-semibold">Nationality</th>
                                <th className="p-4 font-semibold">Location (Country)</th>
                                <th className="p-4 font-semibold">Arrival Date</th>
                                <th className="p-4 font-semibold">Departure Date</th>
                                <th className="p-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500 animate-pulse">
                                        Loading travel records...
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-500">
                                        <History size={32} className="mx-auto mb-3 opacity-30" />
                                        No travel records found.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="border-b border-slate-700/30 hover:bg-slate-800/40 transition-colors">
                                        <td className="p-4">
                                            <div className="font-semibold text-white">
                                                {log.tourist.firstName} {log.tourist.lastName}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5">ID: #{log.tourist.touristId}</div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap text-slate-300">
                                            <span className="flex items-center gap-2">
                                                <Globe size={14} className="text-slate-500" />
                                                {log.tourist.nationality}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-indigo-400">
                                            {log.airport}
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            {log.arrivalDate ? (
                                                <span className="flex items-center gap-1.5 text-slate-300">
                                                    <PlaneLanding size={14} className="text-emerald-500" /> {log.arrivalDate}
                                                </span>
                                            ) : (
                                                <span className="text-slate-600 italic">Unknown</span>
                                            )}
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            {log.departureDate ? (
                                                <span className="flex items-center gap-1.5 text-slate-300">
                                                    <PlaneTakeoff size={14} className="text-amber-500" /> {log.departureDate}
                                                </span>
                                            ) : (
                                                <span className="text-slate-600 italic">Not Departed</span>
                                            )}
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            {!log.departureDate ? (
                                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium text-xs">
                                                    Active Trip
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-400 font-medium text-xs">
                                                    Completed
                                                </span>
                                            )}
                                        </td>
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

export default TravelLogs;
