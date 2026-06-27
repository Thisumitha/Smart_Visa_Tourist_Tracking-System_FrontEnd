import React, { useEffect, useState, useMemo } from 'react';
import { Map, Plus, Edit2, Trash2, Search, Calendar, MapPin, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { PartnerAPI } from '../api/partner.api';
import { TravelLogAPI } from '../api/visa.api';

const AgencyTravelLog: React.FC = () => {
    const [assignedTourists, setAssignedTourists] = useState<any[]>([]);
    const [travelLogs, setTravelLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<any>(null);

    const [formData, setFormData] = useState({
        touristId: '',
        location: '',
        checkInDate: '',
        checkOutDate: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            // We are mocking getting the agencyId from token or profile
            try {
                if (token) {
                    // token parsing logic if needed later
                }
            } catch (e) {
                console.error("Failed to decode token", e);
            }

            const [touristsRes, logsRes] = await Promise.all([
                PartnerAPI.getAgencyTourists(),
                TravelLogAPI.getAllTravelLogs(0, 1000)
            ]);

            setAssignedTourists(touristsRes || []);
            
            // Filter logs to only those belonging to assigned tourists
            const touristIds = (touristsRes || []).map((t: any) => t.touristId || t.id);
            const allLogs = logsRes.content || [];
            setTravelLogs(allLogs.filter((log: any) => touristIds.includes(log.touristId)));
            
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const getTouristName = (touristId: number) => {
        const tourist = assignedTourists.find(t => (t.touristId || t.id) === touristId);
        if (!tourist) return 'Unknown';
        return tourist.name || `${tourist.firstName} ${tourist.lastName}`;
    };

    const filteredLogs = useMemo(() => {
        if (!searchQuery) return travelLogs;
        const lowerQ = searchQuery.toLowerCase();
        return travelLogs.filter(log => {
            const tName = getTouristName(log.touristId).toLowerCase();
            const loc = (log.location || '').toLowerCase();
            return tName.includes(lowerQ) || loc.includes(lowerQ);
        });
    }, [travelLogs, searchQuery, assignedTourists]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await TravelLogAPI.createTravelLog({
                touristId: Number(formData.touristId),
                location: formData.location,
                checkInDate: formData.checkInDate,
                checkOutDate: formData.checkOutDate
            });
            Swal.fire('Success', 'Travel Plan added successfully', 'success');
            setIsAddModalOpen(false);
            setFormData({ touristId: '', location: '', checkInDate: '', checkOutDate: '' });
            fetchData();
        } catch (error) {
            Swal.fire('Error', 'Failed to add travel plan', 'error');
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await TravelLogAPI.updateTravelLog(selectedLog.logId, {
                location: formData.location,
                checkInDate: formData.checkInDate,
                checkOutDate: formData.checkOutDate
            });
            Swal.fire('Success', 'Travel Plan updated successfully', 'success');
            setIsEditModalOpen(false);
            fetchData();
        } catch (error) {
            Swal.fire('Error', 'Failed to update travel plan', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#475569',
            confirmButtonText: 'Yes, delete it!'
        });
        if (result.isConfirmed) {
            try {
                await TravelLogAPI.deleteTravelLog(id);
                Swal.fire('Deleted!', 'Travel Plan has been deleted.', 'success');
                fetchData();
            } catch (error) {
                Swal.fire('Error', 'Failed to delete travel plan', 'error');
            }
        }
    };

    const openEditModal = (log: any) => {
        setSelectedLog(log);
        setFormData({
            touristId: String(log.touristId),
            location: log.location,
            checkInDate: log.checkInDate,
            checkOutDate: log.checkOutDate || ''
        });
        setIsEditModalOpen(true);
    };

    const formatDate = (dateVal: any) => {
        if (!dateVal) return '';
        if (Array.isArray(dateVal)) {
            const [y, m, d] = dateVal;
            return `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
        }
        return String(dateVal).split('T')[0];
    };

    return (
        <div className="space-y-8 w-full max-w-6xl mx-auto">
            {/* Header */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-700/50">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Map className="text-amber-400" /> Travel Plans
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Manage travel itineraries for your assigned tourists.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input type="text" placeholder="Search by name or location..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-amber-500" />
                    </div>
                    <button onClick={() => { setFormData({ touristId: '', location: '', checkInDate: '', checkOutDate: '' }); setIsAddModalOpen(true); }} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap">
                        <Plus size={16} /> Add Travel Plan
                    </button>
                </div>
            </div>

            {/* List Table */}
            <div className="glass-panel rounded-2xl w-full overflow-hidden border border-slate-700/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/80 border-b border-glassborder text-slate-400 text-xs tracking-wider uppercase">
                                <th className="p-4 font-medium">Log ID</th>
                                <th className="p-4 font-medium">Tourist Name</th>
                                <th className="p-4 font-medium">Location</th>
                                <th className="p-4 font-medium">Check-In</th>
                                <th className="p-4 font-medium">Check-Out</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading travel plans...</td></tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No travel plans found.</td></tr>
                            ) : (
                                filteredLogs.map(log => (
                                    <tr key={log.logId} className="border-b border-glassborder hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4 font-medium text-slate-400">#{log.logId}</td>
                                        <td className="p-4 text-indigo-300 font-medium">{getTouristName(log.touristId)}</td>
                                        <td className="p-4 text-white">
                                            <div className="flex items-center gap-2"><MapPin size={14} className="text-amber-400" /> {log.location}</div>
                                        </td>
                                        <td className="p-4 text-slate-300">
                                            <div className="flex items-center gap-2"><Calendar size={14} className="text-slate-500"/> {formatDate(log.checkInDate)}</div>
                                        </td>
                                        <td className="p-4 text-slate-300">
                                            {log.checkOutDate ? <div className="flex items-center gap-2"><Calendar size={14} className="text-slate-500"/> {formatDate(log.checkOutDate)}</div> : '-'}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEditModal(log)} className="p-2 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors" title="Edit">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(log.logId)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {(isAddModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-slate-700/50 bg-slate-800/50">
                            <h3 className="text-lg font-semibold text-white">{isEditModalOpen ? 'Edit Travel Plan' : 'Add Travel Plan'}</h3>
                            <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="text-slate-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={isEditModalOpen ? handleEdit : handleAdd} className="p-6 space-y-4">
                            {!isEditModalOpen && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Select Tourist</label>
                                    <select required value={formData.touristId} onChange={e => setFormData({...formData, touristId: e.target.value})} className="w-full p-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white outline-none focus:border-amber-500">
                                        <option value="">-- Select a Tourist --</option>
                                        {assignedTourists.map((t: any) => (
                                            <option key={t.touristId || t.id} value={t.touristId || t.id}>
                                                {t.name || `${t.firstName} ${t.lastName}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
                                <input type="text" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white outline-none focus:border-amber-500" placeholder="e.g. Grand Hotel, Kandy" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Check-in Date</label>
                                    <input type="date" required value={formatDate(formData.checkInDate)} onChange={e => setFormData({...formData, checkInDate: e.target.value})} className="w-full p-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white outline-none focus:border-amber-500" style={{ colorScheme: 'dark' }} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Check-out Date (Optional)</label>
                                    <input type="date" value={formatDate(formData.checkOutDate)} onChange={e => setFormData({...formData, checkOutDate: e.target.value})} className="w-full p-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white outline-none focus:border-amber-500" style={{ colorScheme: 'dark' }} />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="px-4 py-2 text-slate-300 hover:text-white font-medium">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors">
                                    {isEditModalOpen ? 'Update Plan' : 'Save Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgencyTravelLog;
