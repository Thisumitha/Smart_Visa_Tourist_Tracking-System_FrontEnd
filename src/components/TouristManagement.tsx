import React, { useEffect, useState } from 'react';
import { Globe, Users, Plus, Trash2, Edit2, X, Save, Building, MapPin, Search } from 'lucide-react';
import { TouristAPI } from '../api/tourist.api';
import { PartnerAPI, HotelCheckInAPI } from '../api/partner.api';
import Swal from 'sweetalert2';

const TouristManagement: React.FC = () => {
    // Tourists Data
    const [manageTourists, setManageTourists] = useState<any[]>([]);
    const [loadingTourists, setLoadingTourists] = useState(false);

    // Tourist Form
    const [searchQuery, setSearchQuery] = useState('');
    const [touristForm, setTouristForm] = useState({ firstName: '', lastName: '', nationality: '', dateOfBirth: '', gender: 'Male', email: '' });
    const [editingId, setEditingId] = useState<number | null>(null);
    // UI states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [nationalities, setNationalities] = useState<string[]>([]);

    // Agency Assignment States
    const [agencies, setAgencies] = useState<any[]>([]);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedTouristForAgency, setSelectedTouristForAgency] = useState<any>(null);
    const [selectedAgencyId, setSelectedAgencyId] = useState<number | ''>('');
    const [isAssigning, setIsAssigning] = useState(false);
    const [isReassigningMode, setIsReassigningMode] = useState(false);
    const [touristAgencyMap, setTouristAgencyMap] = useState<Record<number, any>>({});

    // Travel History States
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedTouristForHistory, setSelectedTouristForHistory] = useState<any>(null);
    const [travelHistory, setTravelHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        fetchManageTourists();
        fetchAgencies();
    }, []);

    useEffect(() => {
        const fetchNationalities = async () => {
            let countryNames = [];
            try {
                const response = await fetch('https://restcountries.com/v3.1/all?fields=name');
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                countryNames = data.map((country: any) => country.name.common).sort();
            } catch (error) {
                console.warn("Failed to fetch nationalities from API, using fallback list.", error);
                countryNames = [
                    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
                ];
            }
            setNationalities(countryNames);
        };
        fetchNationalities();
    }, []);

    const fetchAgencies = async () => {
        try {
            const data = await PartnerAPI.getAllAgencies();
            const fetchedAgencies = Array.isArray(data) ? data : (data?.content || []);
            setAgencies(fetchedAgencies);

            const mapping: Record<number, any> = {};
            await Promise.all(fetchedAgencies.map(async (agency: any) => {
                try {
                    const touristIdsData = await PartnerAPI.getAssignedTourists(agency.agencyId);
                    const touristIds = Array.isArray(touristIdsData) ? touristIdsData : (touristIdsData?.content || []);
                    touristIds.forEach((tId: number) => {
                        mapping[tId] = agency;
                    });
                } catch (e) {
                    // Ignore mapping error for single agency
                }
            }));
            setTouristAgencyMap(mapping);
        } catch (error) {
            console.error("Failed to fetch agencies", error);
        }
    };

    const fetchManageTourists = async () => {
        setLoadingTourists(true);
        try {
            const data = await TouristAPI.getAllTourists();
            setManageTourists(data);
        } catch (error) {
            console.error("Failed to fetch tourists", error);
        } finally {
            setLoadingTourists(false);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingId) {
                // Update existing tourist
                await TouristAPI.updateTourist(editingId, touristForm);
                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: `Tourist '${touristForm.firstName} ${touristForm.lastName}' updated successfully!`,
                    background: '#0f172a',
                    color: '#fff',
                    confirmButtonColor: '#3b82f6'
                });
            } else {
                // Create new tourist
                await TouristAPI.registerTourist(touristForm);
                Swal.fire({
                    icon: 'success',
                    title: 'Registered!',
                    text: `Tourist '${touristForm.firstName} ${touristForm.lastName}' registered successfully!`,
                    background: '#0f172a',
                    color: '#fff',
                    confirmButtonColor: '#10b981'
                });
            }
            // Reset form
            setTouristForm({ firstName: '', lastName: '', nationality: '', dateOfBirth: '', gender: 'Male', email: '' });
            setEditingId(null);
            fetchManageTourists(); // Refresh list
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Failed to ${editingId ? 'update' : 'register'} tourist.`,
                background: '#0f172a',
                color: '#fff',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (tourist: any) => {
        setEditingId(tourist.touristId);
        setTouristForm({
            firstName: tourist.firstName,
            lastName: tourist.lastName,
            nationality: tourist.nationality,
            dateOfBirth: tourist.dateOfBirth,
            gender: tourist.gender || 'Male',
            email: tourist.email || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to the form
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setTouristForm({ firstName: '', lastName: '', nationality: '', dateOfBirth: '', gender: 'Male', email: '' });
    };

    const handleDeleteTourist = async (id: number) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            background: '#0f172a',
            color: '#fff',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#475569',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await TouristAPI.deleteTourist(id);
                fetchManageTourists(); // Refresh list after deletion
                if (editingId === id) {
                    handleCancelEdit(); // Clear form if we deleted the tourist we were editing
                }
                Swal.fire({
                    title: 'Deleted!',
                    text: 'The tourist has been deleted.',
                    icon: 'success',
                    background: '#0f172a',
                    color: '#fff',
                    confirmButtonColor: '#10b981'
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to delete tourist',
                    background: '#0f172a',
                    color: '#fff',
                    confirmButtonColor: '#ef4444'
                });
            }
        }
    };

    const handleAssignAgencyClick = async (tourist: any) => {
        if (touristAgencyMap[tourist.touristId]) {
            const currentAgency = touristAgencyMap[tourist.touristId].agencyName;
            const result = await Swal.fire({
                icon: 'question',
                title: 'Already Assigned',
                text: `${tourist.firstName} ${tourist.lastName} is already assigned to ${currentAgency}. Do you want to re-assign them to a new agency?`,
                showCancelButton: true,
                confirmButtonText: 'Yes, Re-assign',
                background: '#0f172a',
                color: '#fff',
                confirmButtonColor: '#8b5cf6',
                cancelButtonColor: '#475569'
            });
            if (!result.isConfirmed) {
                return;
            }
            setIsReassigningMode(true);
        } else {
            setIsReassigningMode(false);
        }
        setSelectedTouristForAgency(tourist);
        setSelectedAgencyId('');
        setIsAssignModalOpen(true);
    };

    const handleAssignAgencySubmit = async () => {
        if (!selectedAgencyId || !selectedTouristForAgency) return;
        setIsAssigning(true);
        try {
            if (isReassigningMode) {
                await PartnerAPI.reassignTouristToAgency(Number(selectedAgencyId), selectedTouristForAgency.touristId);
            } else {
                await PartnerAPI.assignTouristToAgency(Number(selectedAgencyId), selectedTouristForAgency.touristId);
            }
            Swal.fire({
                icon: 'success',
                title: isReassigningMode ? 'Re-assigned!' : 'Assigned!',
                text: `Tourist ${isReassigningMode ? 're-assigned' : 'assigned'} to agency successfully!`,
                background: '#0f172a',
                color: '#fff',
                confirmButtonColor: '#10b981'
            });
            setIsAssignModalOpen(false);
            fetchAgencies(); // Refresh the mappings
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || error.response?.data || 'Failed to assign agency.',
                background: '#0f172a',
                color: '#fff',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsAssigning(false);
        }
    };

    const handleViewTravelHistory = async (tourist: any) => {
        setSelectedTouristForHistory(tourist);
        setIsHistoryModalOpen(true);
        setLoadingHistory(true);
        setTravelHistory([]);
        try {
            const history = await HotelCheckInAPI.getTouristTravelHistory(tourist.touristId);
            // Sort by latest check-in date
            const sortedHistory = (history || []).sort((a: any, b: any) => {
                return new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime();
            });
            setTravelHistory(sortedHistory);
        } catch (error) {
            console.error("Failed to fetch history", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Could not load travel history.',
                background: '#0f172a',
                color: '#fff'
            });
        } finally {
            setLoadingHistory(false);
        }
    };

    const filteredTourists = manageTourists.filter(t => 
        `${t.firstName} ${t.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.nationality.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.touristId.toString().includes(searchQuery)
    );

    return (
        <div className="space-y-8 w-full">
            {/* Create / Edit Tourist Form */}
            <div className="glass-panel rounded-2xl p-8 max-w-4xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {editingId ? (
                            <><Edit2 className="text-blue-400" /> Edit Tourist #{editingId}</>
                        ) : (
                            <><Globe className="text-emerald-400" /> Register Tourist</>
                        )}
                    </h2>
                    {editingId && (
                        <button onClick={handleCancelEdit} className="text-slate-400 hover:text-white flex items-center gap-1 text-sm bg-slate-800/50 hover:bg-slate-700/50 px-3 py-1.5 rounded-lg transition-colors">
                            <X size={16} /> Cancel Edit
                        </button>
                    )}
                </div>
                
                <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                        <input type="text" required value={touristForm.firstName} onChange={e => setTouristForm({...touristForm, firstName: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                        <input type="text" required value={touristForm.lastName} onChange={e => setTouristForm({...touristForm, lastName: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Doe" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Nationality</label>
                        <select required value={touristForm.nationality} onChange={e => setTouristForm({...touristForm, nationality: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                            <option value="" disabled>Select Nationality</option>
                            {nationalities.map((country, idx) => (
                                <option key={idx} value={country}>{country}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Date of Birth</label>
                        <input type="date" required value={touristForm.dateOfBirth} onChange={e => setTouristForm({...touristForm, dateOfBirth: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Gender</label>
                        <select value={touristForm.gender} onChange={e => setTouristForm({...touristForm, gender: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                        <input type="email" required value={touristForm.email} onChange={e => setTouristForm({...touristForm, email: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="tourist@example.com" />
                    </div>
                    <div className="md:col-span-2 flex justify-end mt-4">
                        <button type="submit" disabled={isSubmitting} className={`px-8 py-3 text-white rounded-xl font-medium transition-all flex items-center gap-2 ${editingId ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                            {isSubmitting ? (editingId ? 'Updating...' : 'Registering...') : (editingId ? <><Save size={18} /> Update Tourist</> : <><Plus size={18} /> Create Tourist</>)}
                        </button>
                    </div>
                </form>
            </div>

            {/* Tourist List Table */}
            <div className="glass-panel rounded-2xl max-w-4xl mx-auto w-full overflow-hidden border border-slate-700/50">
                <div className="p-6 border-b border-glassborder flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2"><Users className="text-slate-400" size={18}/> Tourist Database</h3>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search ID, name, or nationality..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <button onClick={fetchManageTourists} className="text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors whitespace-nowrap">Refresh</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/80 border-b border-glassborder text-slate-400 text-xs tracking-wider uppercase">
                                <th className="p-4 font-medium">ID</th>
                                <th className="p-4 font-medium">Name</th>
                                <th className="p-4 font-medium">Nationality</th>
                                <th className="p-4 font-medium">DOB</th>
                                <th className="p-4 font-medium">Gender</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingTourists ? (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading database...</td></tr>
                            ) : filteredTourists.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-500">{searchQuery ? 'No tourists match your search.' : 'No tourists found.'}</td></tr>
                            ) : (
                                filteredTourists.map(t => (
                                    <tr key={t.touristId} className={`border-b border-glassborder transition-colors ${editingId === t.touristId ? 'bg-blue-900/20' : 'hover:bg-slate-800/30'}`}>
                                        <td className="p-4 text-slate-400">#{t.touristId}</td>
                                        <td className="p-4 font-medium text-white">{t.firstName} {t.lastName}</td>
                                        <td className="p-4 text-slate-300">{t.nationality}</td>
                                        <td className="p-4 text-slate-400">{t.dateOfBirth}</td>
                                        <td className="p-4 text-slate-400">{t.gender}</td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <button onClick={() => handleViewTravelHistory(t)} className="text-emerald-400 hover:text-emerald-300 p-2 rounded-lg hover:bg-emerald-500/10 transition-colors" title="View Travel History">
                                                <MapPin size={16} />
                                            </button>
                                            <button onClick={() => handleAssignAgencyClick(t)} className="text-purple-400 hover:text-purple-300 p-2 rounded-lg hover:bg-purple-500/10 transition-colors" title="Assign Agency">
                                                <Building size={16} />
                                            </button>
                                            <button onClick={() => handleEditClick(t)} className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/10 transition-colors" title="Edit Tourist">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteTourist(t.touristId)} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete Tourist">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assign Agency Modal */}
            {isAssignModalOpen && selectedTouristForAgency && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-700/50 shadow-2xl relative">
                        <button onClick={() => setIsAssignModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                        
                        <div className="mb-6">
                            <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mb-4">
                                <Building size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-white">{isReassigningMode ? 'Re-assign Agency' : 'Assign Agency'}</h2>
                            <p className="text-sm text-slate-400 mt-1">{isReassigningMode ? 'Select a new agency for' : 'Assign an agency to'} <span className="font-semibold text-slate-300">{selectedTouristForAgency.firstName} {selectedTouristForAgency.lastName}</span></p>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Select Agency</label>
                                <select 
                                    value={selectedAgencyId} 
                                    onChange={e => setSelectedAgencyId(e.target.value === '' ? '' : Number(e.target.value))} 
                                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none"
                                >
                                    <option value="" disabled>-- Select an Agency --</option>
                                    {agencies.map(agency => (
                                        <option key={agency.agencyId} value={agency.agencyId}>
                                            {agency.agencyName} (License: {agency.licenseNumber})
                                        </option>
                                    ))}
                                </select>
                                {agencies.length === 0 && <p className="text-xs text-amber-400 mt-2">No agencies found. Please add an agency first.</p>}
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setIsAssignModalOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors">
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleAssignAgencySubmit} 
                                    disabled={selectedAgencyId === '' || isAssigning}
                                    className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    {isAssigning ? (isReassigningMode ? 'Re-assigning...' : 'Assigning...') : <><Save size={16} /> {isReassigningMode ? 'Re-assign' : 'Assign'}</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Travel History Modal */}
            {isHistoryModalOpen && selectedTouristForHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className="glass-panel w-full max-w-2xl p-6 rounded-2xl border border-slate-700/50 shadow-2xl relative">
                        <button onClick={() => setIsHistoryModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                        
                        <div className="mb-6">
                            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                                <MapPin size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-white">Travel History</h2>
                            <p className="text-sm text-slate-400 mt-1">Showing checked-in hotels for <span className="font-semibold text-slate-300">{selectedTouristForHistory.firstName} {selectedTouristForHistory.lastName}</span></p>
                        </div>

                        <div className="overflow-x-auto max-h-96 overflow-y-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900/80 border-b border-glassborder text-slate-400 text-xs tracking-wider uppercase">
                                        <th className="p-4 font-medium">Hotel Name</th>
                                        <th className="p-4 font-medium">Check-In Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingHistory ? (
                                        <tr><td colSpan={2} className="p-8 text-center text-slate-500">Loading travel history...</td></tr>
                                    ) : travelHistory.length === 0 ? (
                                        <tr><td colSpan={2} className="p-8 text-center text-amber-400/80 bg-amber-500/10">No travel history found. Tourist has not checked into any hotels yet.</td></tr>
                                    ) : (
                                        travelHistory.map((history, idx) => (
                                            <tr key={idx} className="border-b border-glassborder hover:bg-slate-800/30 transition-colors">
                                                <td className="p-4 font-medium text-emerald-400">{history.hotelName}</td>
                                                <td className="p-4 text-slate-300">{new Date(history.checkInDate).toLocaleString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setIsHistoryModalOpen(false)} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TouristManagement;
