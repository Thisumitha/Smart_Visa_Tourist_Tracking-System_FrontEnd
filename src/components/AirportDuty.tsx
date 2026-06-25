import React, { useState } from 'react';
import { Search, PlaneTakeoff, PlaneLanding, ShieldCheck, ShieldAlert, CreditCard, FileText, Globe, AlertCircle } from 'lucide-react';
import { PassportAPI, EntryAPI, ExitAPI } from '../api/tourist.api';
import { VisaAPI } from '../api/visa.api';

interface Passport {
    passportId: number;
    passportNumber: string;
    issueDate: string;
    expiryDate: string;
    tourist: {
        touristId: number;
    };
}

interface Visa {
    visaId: number;
    passportId: number;
    visaType: string;
    issueDate: string;
    expiryDate: string;
    status: string;
}

const AirportDuty: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [passport, setPassport] = useState<Passport | null>(null);
    const [visas, setVisas] = useState<Visa[]>([]);
    
    const [currentStatus, setCurrentStatus] = useState<'IN_COUNTRY' | 'OUT_OF_COUNTRY' | null>(null);
    const [airportName, setAirportName] = useState('');
    const [countries, setCountries] = useState<string[]>([]);
    const [actionStatus, setActionStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

    React.useEffect(() => {
        const countryNames = [
            "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria", 
            "Bangladesh", "Belgium", "Brazil", "Canada", "China", "Colombia", "Denmark", 
            "Egypt", "Finland", "France", "Germany", "Greece", "India", "Indonesia", 
            "Iran", "Iraq", "Ireland", "Israel", "Italy", "Japan", "Kenya", "Malaysia", 
            "Mexico", "Morocco", "Netherlands", "New Zealand", "Nigeria", "Norway", 
            "Pakistan", "Philippines", "Poland", "Portugal", "Russia", "Saudi Arabia", 
            "Singapore", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sweden", 
            "Switzerland", "Thailand", "Turkey", "United Arab Emirates", "United Kingdom", 
            "United States", "Vietnam"
        ];
        setCountries(countryNames);
        if (countryNames.length > 0) {
            setAirportName(countryNames[0]);
        }
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setPassport(null);
        setVisas([]);
        setActionStatus(null);

        try {
            // Find all passports to simulate search by passport number or ID
            const data = await PassportAPI.getAllPassports();
            const allPassports: Passport[] = data.content ? data.content : data;
            
            const foundPassport = allPassports.find(p => 
                p.passportNumber.toLowerCase() === searchQuery.toLowerCase() || 
                p.passportId.toString() === searchQuery
            );

            if (foundPassport) {
                setPassport(foundPassport);
                // Fetch visas for this passport
                const visaData = await VisaAPI.searchByPassportId(foundPassport.passportId, 0, 100);
                const passportVisas: Visa[] = visaData.content ? visaData.content : visaData;
                setVisas(passportVisas);

                // Fetch entry/exit records to determine current status
                const [entries, exits] = await Promise.all([
                    EntryAPI.getEntryRecordsByTouristId(foundPassport.tourist.touristId).catch(() => []),
                    ExitAPI.getExitRecordsByTouristId(foundPassport.tourist.touristId).catch(() => [])
                ]);

                // Determine if they are in the country
                const latestEntry = entries.length > 0 ? entries.sort((a: any, b: any) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())[0] : null;
                const latestExit = exits.length > 0 ? exits.sort((a: any, b: any) => new Date(b.exitDate).getTime() - new Date(a.exitDate).getTime())[0] : null;

                if (latestEntry) {
                    if (!latestExit) {
                        setCurrentStatus('IN_COUNTRY');
                    } else {
                        const entryTime = new Date(latestEntry.entryDate).getTime();
                        const exitTime = new Date(latestExit.exitDate).getTime();
                        setCurrentStatus(entryTime > exitTime ? 'IN_COUNTRY' : 'OUT_OF_COUNTRY');
                    }
                } else {
                    setCurrentStatus('OUT_OF_COUNTRY'); // Never entered
                }

            } else {
                setActionStatus({ type: 'error', message: 'No passport found matching that ID or Number.' });
            }
        } catch (error) {
            console.error(error);
            setActionStatus({ type: 'error', message: 'Failed to search for passport. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const hasValidVisa = () => {
        if (visas.length === 0) return false;
        
        const today = new Date().toISOString().split('T')[0];
        
        // Check if any visa is active and within dates
        return visas.some(v => {
            const isStatusActive = v.status === 'Active';
            // Simple date comparison works since they are YYYY-MM-DD strings
            const isWithinDates = v.issueDate <= today && v.expiryDate >= today;
            return isStatusActive && isWithinDates;
        });
    };

    const handleMarkArrival = async () => {
        if (!passport || !airportName.trim()) return;
        setActionStatus(null);

        try {
            const today = new Date().toISOString().split('T')[0];
            await EntryAPI.markArrival(passport.tourist.touristId, {
                airport: airportName,
                entryDate: today
            });
            setActionStatus({ type: 'success', message: `Arrival recorded successfully at ${airportName} on ${today}!` });
            setCurrentStatus('IN_COUNTRY');
        } catch (error) {
            setActionStatus({ type: 'error', message: 'Failed to record arrival. Please verify the tourist ID exists.' });
        }
    };

    const handleMarkDeparture = async () => {
        if (!passport || !airportName.trim()) return;
        setActionStatus(null);

        try {
            const today = new Date().toISOString().split('T')[0];
            await ExitAPI.markDeparture(passport.tourist.touristId, {
                airport: airportName,
                exitDate: today
            });
            setActionStatus({ type: 'success', message: `Departure recorded successfully at ${airportName} on ${today}!` });
            setCurrentStatus('OUT_OF_COUNTRY');
        } catch (error) {
            setActionStatus({ type: 'error', message: 'Failed to record departure. Please verify the tourist ID exists.' });
        }
    };

    const isValid = passport ? hasValidVisa() : false;

    return (
        <div className="max-w-4xl mx-auto space-y-6 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border-l-4 border-l-blue-500">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <PlaneLanding className="text-blue-400" /> Airport Duty Interface
                    </h2>
                    <p className="text-slate-400 mt-1 text-sm">Verify Passports, check Visas, and mark Arrivals / Departures.</p>
                </div>
                
                <form onSubmit={handleSearch} className="flex-1 max-w-sm">
                    <div className="relative flex">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type="text" 
                                placeholder="Scan Passport ID or Number..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-l-xl text-white outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading || !searchQuery.trim()}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-r-xl transition-colors"
                        >
                            {loading ? 'Searching...' : 'Scan'}
                        </button>
                    </div>
                </form>
            </div>

            {actionStatus && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                    actionStatus.type === 'success' 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                    <AlertCircle size={20} className="mt-0.5 shrink-0" />
                    <p className="font-medium">{actionStatus.message}</p>
                </div>
            )}

            {passport && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Verification Panel */}
                    <div className="glass-panel rounded-2xl p-6 border border-slate-700/50 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <ShieldCheck className={isValid ? "text-emerald-400" : "text-slate-500"} /> 
                                Clearance Status
                            </h3>
                            {isValid ? (
                                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-sm tracking-wide uppercase">
                                    Cleared for Entry
                                </span>
                            ) : (
                                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-sm tracking-wide uppercase flex items-center gap-1">
                                    <ShieldAlert size={14} /> Invalid / No Visa
                                </span>
                            )}
                        </div>

                        <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-700/50 mb-6 flex-1">
                            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <CreditCard size={16} /> Passport Details
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm">Number</span>
                                    <span className="text-white font-bold">{passport.passportNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm">System ID</span>
                                    <span className="text-slate-300">#{passport.passportId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm">Tourist ID</span>
                                    <span className="text-slate-300">#{passport.tourist?.touristId}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-slate-700/50">
                                    <span className="text-slate-500 text-sm">Expires</span>
                                    <span className={`font-medium ${passport.expiryDate < new Date().toISOString().split('T')[0] ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {passport.expiryDate}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Country / Location</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <select
                                        value={airportName}
                                        onChange={(e) => setAirportName(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none appearance-none"
                                    >
                                        <option value="" disabled>Select Country</option>
                                        {countries.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={handleMarkArrival}
                                    disabled={!isValid || currentStatus === 'IN_COUNTRY'}
                                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
                                        !isValid || currentStatus === 'IN_COUNTRY'
                                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                                        : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/50'
                                    }`}
                                >
                                    <PlaneLanding size={18} /> Mark Arrival
                                </button>
                                <button 
                                    onClick={handleMarkDeparture}
                                    disabled={currentStatus === 'OUT_OF_COUNTRY' || currentStatus === null}
                                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
                                        currentStatus === 'OUT_OF_COUNTRY' || currentStatus === null
                                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/50'
                                    }`}
                                >
                                    <PlaneTakeoff size={18} /> Mark Departure
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Visa Details */}
                    <div className="glass-panel rounded-2xl p-6 border border-slate-700/50">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <FileText size={20} className="text-indigo-400" /> Linked Visas
                        </h3>

                        {visas.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-xl border border-dashed border-slate-700">
                                <ShieldAlert size={32} className="mx-auto mb-3 opacity-50" />
                                <p>No visas found for this passport.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {visas.map(visa => {
                                    const today = new Date().toISOString().split('T')[0];
                                    const isDateValid = visa.issueDate <= today && visa.expiryDate >= today;
                                    const isActive = visa.status === 'Active';
                                    const isActuallyValid = isActive && isDateValid;

                                    return (
                                        <div key={visa.visaId} className={`p-4 rounded-xl border ${isActuallyValid ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <span className="text-white font-bold">{visa.visaType} Visa</span>
                                                    <span className="ml-2 text-xs text-slate-400">#{visa.visaId}</span>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                    isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                   {visa.status}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4 mt-3">
                                                <div>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Issued</p>
                                                    <p className="text-sm text-slate-300">{visa.issueDate}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Expires</p>
                                                    <p className={`text-sm ${visa.expiryDate < today ? 'text-red-400 font-medium' : 'text-emerald-400 font-medium'}`}>
                                                        {visa.expiryDate}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AirportDuty;
