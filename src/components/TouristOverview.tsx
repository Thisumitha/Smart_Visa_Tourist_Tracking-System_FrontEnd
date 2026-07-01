import React, { useEffect, useState } from 'react';
import { Search, Globe, CreditCard, FileText, ChevronDown, ChevronUp, User, Briefcase, Phone, PhoneCall, Edit2, Save, Plus, X } from 'lucide-react';
import { TouristAPI, PassportAPI, EmergencyContactAPI } from '../api/tourist.api';
import { VisaAPI } from '../api/visa.api';
import { PartnerAPI } from '../api/partner.api';

interface EmergencyContact {
    contactId: number;
    touristId: number;
    name: string;
    phoneNumber: string;
    relationship: string;
}

interface Tourist {
    touristId: number;
    firstName: string;
    lastName: string;
    nationality: string;
    dateOfBirth: string;
    gender: string;
}

interface Passport {
    passportId: number;
    touristId: number;
    passportNumber: string;
    issueDate: string;
    expiryDate: string;
}

interface Visa {
    visaId: number;
    passportId: number;
    visaType: string;
    issueDate: string;
    expiryDate: string;
    status: string;
}

interface TouristOverviewProps {
    agencyMode?: boolean;
}

const TouristOverview: React.FC<TouristOverviewProps> = ({ agencyMode = false }) => {
    const [tourists, setTourists] = useState<Tourist[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [touristAgencyMap, setTouristAgencyMap] = useState<Record<number, any>>({});
    const [myAgencyId, setMyAgencyId] = useState<number | null>(null);

    // State for expanded tourist rows
    const [expandedTourist, setExpandedTourist] = useState<number | null>(null);
    const [passportsMap, setPassportsMap] = useState<Record<number, Passport[]>>({});
    const [loadingPassports, setLoadingPassports] = useState<Record<number, boolean>>({});

    // State for expanded passports (to load their visas)
    const [visasMap, setVisasMap] = useState<Record<number, Visa[]>>({});
    const [loadingVisas, setLoadingVisas] = useState<Record<number, boolean>>({});

    // Emergency Contacts State
    const [contactsMap, setContactsMap] = useState<Record<number, EmergencyContact[]>>({});
    const [loadingContacts, setLoadingContacts] = useState<Record<number, boolean>>({});
    const [editingContact, setEditingContact] = useState<number | null>(null);
    const [contactForm, setContactForm] = useState({ name: '', phoneNumber: '', relationship: '' });
    const [showContactFormFor, setShowContactFormFor] = useState<number | null>(null);

    useEffect(() => {
        fetchTourists();
    }, []);

    const fetchTourists = async () => {
        setLoading(true);
        try {
            const data = await TouristAPI.getAllTourists();
            setTourists(data.content ? data.content : data);

            // Fetch agency mappings
            try {
                const agenciesData = await PartnerAPI.getAllAgencies();
                const agencies = Array.isArray(agenciesData) ? agenciesData : (agenciesData?.content || []);
                
                if (agencies.length > 0) {
                    setMyAgencyId(agencies[0].agencyId);
                }
                
                const mapping: Record<number, any> = {};
                
                // For each agency, get its assigned tourists
                await Promise.all(agencies.map(async (agency: any) => {
                    try {
                        const touristIdsData = await PartnerAPI.getAssignedTourists(agency.agencyId);
                        const touristIds = Array.isArray(touristIdsData) ? touristIdsData : (touristIdsData?.content || []);
                        touristIds.forEach((tId: number) => {
                            mapping[tId] = agency;
                        });
                    } catch (e) {
                        console.error(`Failed mapping for agency ${agency.agencyId}`, e);
                    }
                }));
                
                setTouristAgencyMap(mapping);
            } catch (err) {
                console.error("Failed to fetch agency mappings", err);
            }
        } catch (err) {
            console.error("Failed to fetch tourists", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Since we don't have a complex backend search across all fields yet,
        // we'll fetch all and filter in memory for simplicity in this overview.
        // If the backend has a search endpoint, we would call it here.
    };

    const toggleTourist = async (touristId: number) => {
        if (expandedTourist === touristId) {
            setExpandedTourist(null);
            setShowContactFormFor(null);
            setEditingContact(null);
            return;
        }
        
        setExpandedTourist(touristId);

        // Fetch emergency contacts if not already cached
        if (!contactsMap[touristId]) {
            setLoadingContacts(prev => ({ ...prev, [touristId]: true }));
            try {
                const data = await EmergencyContactAPI.getContactsByTouristId(touristId);
                setContactsMap(prev => ({ ...prev, [touristId]: data.content ? data.content : data }));
            } catch (err) {
                console.error(`Failed to fetch emergency contacts for tourist ${touristId}`, err);
            } finally {
                setLoadingContacts(prev => ({ ...prev, [touristId]: false }));
            }
        }

        // Fetch passports if not already cached
        if (!passportsMap[touristId]) {
            setLoadingPassports(prev => ({ ...prev, [touristId]: true }));
            try {
                const data = await PassportAPI.getPassportsByTouristId(touristId);
                const passports: Passport[] = data.content ? data.content : data;
                setPassportsMap(prev => ({ ...prev, [touristId]: passports }));

                // Eagerly fetch Visas for these passports
                passports.forEach(p => {
                    fetchVisasForPassport(p.passportId);
                });
            } catch (err) {
                console.error(`Failed to fetch passports for tourist ${touristId}`, err);
            } finally {
                setLoadingPassports(prev => ({ ...prev, [touristId]: false }));
            }
        }
    };

    const handleSaveNewContact = async (touristId: number) => {
        try {
            const newContact = await EmergencyContactAPI.createContact(touristId, contactForm);
            setContactsMap(prev => ({
                ...prev,
                [touristId]: [...(prev[touristId] || []), newContact]
            }));
            setShowContactFormFor(null);
            setContactForm({ name: '', phoneNumber: '', relationship: '' });
        } catch (e) {
            console.error("Failed to save contact", e);
        }
    };

    const handleUpdateContact = async (touristId: number, contactId: number) => {
        try {
            const updated = await EmergencyContactAPI.updateContact(contactId, touristId, contactForm);
            setContactsMap(prev => ({
                ...prev,
                [touristId]: prev[touristId].map(c => c.contactId === contactId ? updated : c)
            }));
            setEditingContact(null);
            setContactForm({ name: '', phoneNumber: '', relationship: '' });
        } catch (e) {
            console.error("Failed to update contact", e);
        }
    };

    const fetchVisasForPassport = async (passportId: number) => {
        if (visasMap[passportId]) return; // Already cached
        
        setLoadingVisas(prev => ({ ...prev, [passportId]: true }));
        try {
            const data = await VisaAPI.searchByPassportId(passportId, 0, 100);
            setVisasMap(prev => ({ ...prev, [passportId]: data.content ? data.content : data }));
        } catch (err) {
            console.error(`Failed to fetch visas for passport ${passportId}`, err);
        } finally {
            setLoadingVisas(prev => ({ ...prev, [passportId]: false }));
        }
    };

    const filteredTourists = tourists.filter(t => {
        if (agencyMode) {
            // For demonstration purposes, we are disabling the strict agency filter 
            // so you can see all tourists in the system. Assigned tourists will have a badge.
        }

        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            t.firstName.toLowerCase().includes(q) ||
            t.lastName.toLowerCase().includes(q) ||
            t.nationality.toLowerCase().includes(q) ||
            t.touristId.toString() === q
        );
    });

    return (
        <div className="space-y-6 max-w-6xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Globe className="text-indigo-400" /> Unified Tourist Overview
                    </h2>
                    <p className="text-slate-400 mt-1 text-sm">Search and view comprehensive details of tourists, passports, and visas.</p>
                </div>
                
                <form onSubmit={handleSearch} className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by Name, Nationality, or ID..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                </form>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 animate-pulse">
                        Loading tourists...
                    </div>
                ) : filteredTourists.length === 0 ? (
                    <div className="glass-panel p-8 rounded-2xl text-center text-slate-400">
                        No tourists found matching your search.
                    </div>
                ) : (
                    filteredTourists.map(tourist => (
                        <div key={tourist.touristId} className="glass-panel rounded-2xl overflow-hidden border border-slate-700/50 transition-all duration-300">
                            {/* Tourist Header (Clickable) */}
                            <div 
                                onClick={() => toggleTourist(tourist.touristId)}
                                className={`p-5 flex items-center justify-between cursor-pointer transition-colors ${expandedTourist === tourist.touristId ? 'bg-indigo-900/30 border-b border-slate-700/50' : 'hover:bg-slate-800/40'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xl border border-indigo-500/30">
                                        {tourist.firstName.charAt(0)}{tourist.lastName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            {tourist.firstName} {tourist.lastName}
                                            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">ID: #{tourist.touristId}</span>
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                                            <span className="flex items-center gap-1"><Globe size={14}/> {tourist.nationality}</span>
                                            <span className="flex items-center gap-1"><User size={14}/> {tourist.gender}</span>
                                            <span>DOB: {tourist.dateOfBirth}</span>
                                            {touristAgencyMap[tourist.touristId] && (
                                                <span className="flex items-center gap-1 text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20" title={`Assigned Agency (Lic: ${touristAgencyMap[tourist.touristId].licenseNumber})`}>
                                                    <Briefcase size={12}/> {touristAgencyMap[tourist.touristId].agencyName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-slate-500 p-2">
                                    {expandedTourist === tourist.touristId ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                </div>
                            </div>

                            {/* Expanded Content: Passports, Visas, and Agency */}
                            {expandedTourist === tourist.touristId && (
                                <div className="p-6 bg-slate-900/40">
                                    
                                    {/* Assigned Agency Details */}
                                    {touristAgencyMap[tourist.touristId] && (
                                        <div className="mb-6 bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                                            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <Briefcase size={16} className="text-indigo-400"/> Assigned Travel Agency
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Agency Name</p>
                                                    <p className="text-sm font-medium text-white">{touristAgencyMap[tourist.touristId].agencyName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">License Number</p>
                                                    <p className="text-sm font-medium text-white">{touristAgencyMap[tourist.touristId].licenseNumber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">System ID</p>
                                                    <p className="text-sm font-medium text-slate-300">#{touristAgencyMap[tourist.touristId].agencyId}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Status</p>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${touristAgencyMap[tourist.touristId].status ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                                        {touristAgencyMap[tourist.touristId].status ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Emergency Contacts Section */}
                                    <div className="mb-6 bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                                <PhoneCall size={16} className="text-pink-400"/> Emergency Contacts
                                            </h4>
                                            {agencyMode && !showContactFormFor && (
                                                <button 
                                                    onClick={() => {
                                                        setShowContactFormFor(tourist.touristId);
                                                        setContactForm({ name: '', phoneNumber: '', relationship: '' });
                                                        setEditingContact(null);
                                                    }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 rounded-lg text-xs font-medium transition-colors border border-pink-500/20"
                                                >
                                                    <Plus size={14} /> Add Contact
                                                </button>
                                            )}
                                        </div>

                                        {loadingContacts[tourist.touristId] ? (
                                            <div className="text-slate-500 text-sm animate-pulse ml-6">Loading contacts...</div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {contactsMap[tourist.touristId]?.map(contact => (
                                                    <div key={contact.contactId} className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/30">
                                                        {editingContact === contact.contactId ? (
                                                            <div className="space-y-3">
                                                                <input type="text" placeholder="Name" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-pink-500" />
                                                                <input type="text" placeholder="Phone Number" value={contactForm.phoneNumber} onChange={e => setContactForm({...contactForm, phoneNumber: e.target.value})} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-pink-500" />
                                                                <input type="text" placeholder="Relationship" value={contactForm.relationship} onChange={e => setContactForm({...contactForm, relationship: e.target.value})} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-pink-500" />
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => handleUpdateContact(tourist.touristId, contact.contactId)} className="flex-1 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-medium transition-colors">Save</button>
                                                                    <button onClick={() => setEditingContact(null)} className="py-2 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium transition-colors"><X size={14}/></button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-white font-medium">{contact.name}</span>
                                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">{contact.relationship}</span>
                                                                    </div>
                                                                    <p className="text-sm text-slate-400 flex items-center gap-1.5"><Phone size={12}/> {contact.phoneNumber}</p>
                                                                </div>
                                                                {agencyMode && (
                                                                    <button 
                                                                        onClick={() => {
                                                                            setEditingContact(contact.contactId);
                                                                            setContactForm({ name: contact.name, phoneNumber: contact.phoneNumber, relationship: contact.relationship });
                                                                        }}
                                                                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                                                    >
                                                                        <Edit2 size={14} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {contactsMap[tourist.touristId]?.length === 0 && !showContactFormFor && (
                                                    <div className="text-slate-500 text-sm italic col-span-2 ml-2">No emergency contacts found.</div>
                                                )}
                                                
                                                {/* Add New Contact Form */}
                                                {showContactFormFor === tourist.touristId && (
                                                    <div className="bg-pink-500/5 rounded-xl p-4 border border-pink-500/20 col-span-1 md:col-span-2 lg:col-span-1">
                                                        <h5 className="text-xs font-medium text-pink-400 mb-3">Add New Contact</h5>
                                                        <div className="space-y-3">
                                                            <input type="text" placeholder="Name" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-pink-500" />
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <input type="text" placeholder="Phone Number" value={contactForm.phoneNumber} onChange={e => setContactForm({...contactForm, phoneNumber: e.target.value})} className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-pink-500" />
                                                                <input type="text" placeholder="Relationship" value={contactForm.relationship} onChange={e => setContactForm({...contactForm, relationship: e.target.value})} className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-pink-500" />
                                                            </div>
                                                            <div className="flex gap-2 pt-1">
                                                                <button onClick={() => handleSaveNewContact(tourist.touristId)} className="flex-1 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-medium transition-colors flex justify-center items-center gap-1.5"><Save size={14}/> Save Contact</button>
                                                                <button onClick={() => setShowContactFormFor(null)} className="py-2 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium transition-colors">Cancel</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <CreditCard size={16} className="text-amber-400"/> Assigned Passports
                                    </h4>

                                    {loadingPassports[tourist.touristId] ? (
                                        <div className="text-slate-500 text-sm animate-pulse ml-6">Loading passports...</div>
                                    ) : passportsMap[tourist.touristId]?.length === 0 ? (
                                        <div className="text-slate-500 text-sm italic ml-6">No passports found for this tourist.</div>
                                    ) : (
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                            {passportsMap[tourist.touristId]?.map(passport => (
                                                <div key={passport.passportId} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 flex flex-col h-full">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-white font-bold text-lg">{passport.passportNumber}</span>
                                                                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">ID: #{passport.passportId}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-400 mt-1">Issued: {passport.issueDate} &bull; Expires: {passport.expiryDate}</p>
                                                        </div>
                                                        <CreditCard className="text-slate-500" size={24} />
                                                    </div>

                                                    <div className="flex-1 bg-slate-900/60 rounded-lg p-4 border border-slate-700/30">
                                                        <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                            <FileText size={14} className="text-emerald-400"/> Linked Visas
                                                        </h5>
                                                        
                                                        {loadingVisas[passport.passportId] ? (
                                                            <div className="text-slate-500 text-xs animate-pulse">Loading visas...</div>
                                                        ) : visasMap[passport.passportId]?.length === 0 ? (
                                                            <div className="text-slate-500 text-xs italic">No visas attached to this passport.</div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                {visasMap[passport.passportId]?.map(visa => (
                                                                    <div key={visa.visaId} className="flex justify-between items-center bg-slate-800/80 p-3 rounded-lg border border-slate-700/50">
                                                                        <div>
                                                                            <p className="text-sm font-medium text-white flex items-center gap-2">
                                                                                {visa.visaType} Visa
                                                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">#{visa.visaId}</span>
                                                                            </p>
                                                                            <p className="text-[11px] text-slate-400 mt-0.5">{visa.issueDate} &rarr; {visa.expiryDate}</p>
                                                                        </div>
                                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                                            visa.status === 'Active' 
                                                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                                                : visa.status === 'Expired'
                                                                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                                        }`}>
                                                                            {visa.status}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TouristOverview;
