import React, { useEffect, useState } from 'react';
import { FileText, Plus, Trash2, Edit2, X, Save, Search } from 'lucide-react';
import { VisaAPI } from '../api/visa.api';
import { TouristAPI } from '../api/tourist.api';
import Swal from 'sweetalert2';

const VisaManagement: React.FC = () => {
    // Visas Data
    const [visas, setVisas] = useState<any[]>([]);
    const [loadingVisas, setLoadingVisas] = useState(false);

    // Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('touristId'); // 'touristId' or 'visaType'

    // Tourists Dropdown Data
    const [availableTourists, setAvailableTourists] = useState<any[]>([]);

    // Form
    const [visaForm, setVisaForm] = useState({ visaId: '', touristId: '', visaType: 'Tourist', issueDate: '', expiryDate: '', status: 'Active' });
    const [editingId, setEditingId] = useState<number | null>(null);
    
    // UI states
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchVisas();
        fetchTourists();
    }, []);

    const fetchTourists = async () => {
        try {
            const data = await TouristAPI.getAllTourists();
            setAvailableTourists(data);
        } catch (error) {
            console.error("Failed to fetch tourists for dropdown", error);
        }
    };

    const fetchVisas = async () => {
        setLoadingVisas(true);
        try {
            const data = await VisaAPI.getAllVisas(0, 100);
            setVisas(data.content || []);
        } catch (error) {
            console.error("Failed to fetch visas", error);
        } finally {
            setLoadingVisas(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) {
            fetchVisas();
            return;
        }

        setLoadingVisas(true);
        try {
            let data;
            if (searchType === 'touristId') {
                data = await VisaAPI.searchByTouristId(Number(searchQuery), 0, 100);
            } else {
                data = await VisaAPI.searchByVisaType(searchQuery, 0, 100);
            }
            setVisas(data.content || []);
        } catch (error) {
            console.error("Failed to search visas", error);
            setVisas([]);
        } finally {
            setLoadingVisas(false);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingId) {
                await VisaAPI.updateVisa(editingId, { ...visaForm, visaId: editingId, touristId: Number(visaForm.touristId) });
                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: `Visa #${editingId} updated successfully!`,
                    background: '#0f172a',
                    color: '#fff',
                    confirmButtonColor: '#3b82f6'
                });
            } else {
                await VisaAPI.createVisa({ ...visaForm, visaId: Number(visaForm.visaId), touristId: Number(visaForm.touristId) });
                Swal.fire({
                    icon: 'success',
                    title: 'Created!',
                    text: `Visa created successfully!`,
                    background: '#0f172a',
                    color: '#fff',
                    confirmButtonColor: '#10b981'
                });
            }
            // Reset form
            setVisaForm({ visaId: '', touristId: '', visaType: 'Tourist', issueDate: '', expiryDate: '', status: 'Active' });
            setEditingId(null);
            fetchVisas();
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Failed to ${editingId ? 'update' : 'create'} visa.`,
                background: '#0f172a',
                color: '#fff',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (visa: any) => {
        setEditingId(visa.visaId);
        setVisaForm({
            visaId: visa.visaId.toString(),
            touristId: visa.touristId?.toString() || '',
            visaType: visa.visaType,
            issueDate: visa.issueDate,
            expiryDate: visa.expiryDate,
            status: visa.status
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setVisaForm({ visaId: '', touristId: '', visaType: 'Tourist', issueDate: '', expiryDate: '', status: 'Active' });
    };

    const handleDeleteVisa = async (id: number) => {
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
                await VisaAPI.deleteVisa(id);
                fetchVisas();
                if (editingId === id) handleCancelEdit();
                Swal.fire({
                    title: 'Deleted!',
                    text: 'The visa has been deleted.',
                    icon: 'success',
                    background: '#0f172a',
                    color: '#fff',
                    confirmButtonColor: '#10b981'
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to delete visa',
                    background: '#0f172a',
                    color: '#fff',
                    confirmButtonColor: '#ef4444'
                });
            }
        }
    };

    return (
        <div className="space-y-8 w-full">
            {/* Create / Edit Visa Form */}
            <div className="glass-panel rounded-2xl p-8 max-w-4xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {editingId ? (
                            <><Edit2 className="text-indigo-400" /> Edit Visa #{editingId}</>
                        ) : (
                            <><FileText className="text-indigo-400" /> Issue New Visa</>
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
                        <label className="block text-sm font-medium text-slate-300 mb-2">Visa ID</label>
                        <input type="number" disabled={!!editingId} required value={visaForm.visaId} onChange={e => setVisaForm({...visaForm, visaId: e.target.value})} className={`w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`} placeholder="e.g. 1001" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Assign to Tourist</label>
                        <select required value={visaForm.touristId} onChange={e => setVisaForm({...visaForm, touristId: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none">
                            <option value="" disabled>Select a tourist...</option>
                            <option value="0" className="font-bold text-amber-400">Unassigned (Link Later)</option>
                            {availableTourists.map(t => (
                                <option key={t.touristId} value={t.touristId}>
                                    {t.firstName} {t.lastName} (ID: {t.touristId})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Visa Type</label>
                        <select value={visaForm.visaType} onChange={e => setVisaForm({...visaForm, visaType: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none">
                            <option>Tourist</option>
                            <option>Business</option>
                            <option>Transit</option>
                            <option>Student</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Issue Date</label>
                        <input type="date" required value={visaForm.issueDate} onChange={e => setVisaForm({...visaForm, issueDate: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Expiry Date</label>
                        <input type="date" required value={visaForm.expiryDate} onChange={e => setVisaForm({...visaForm, expiryDate: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                        <select value={visaForm.status} onChange={e => setVisaForm({...visaForm, status: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none">
                            <option>Active</option>
                            <option>Expired</option>
                            <option>Revoked</option>
                        </select>
                    </div>
                    <div className="md:col-span-2 flex justify-end mt-4">
                        <button type="submit" disabled={isSubmitting} className={`px-8 py-3 text-white rounded-xl font-medium transition-all flex items-center gap-2 ${editingId ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                            {isSubmitting ? (editingId ? 'Updating...' : 'Processing...') : (editingId ? <><Save size={18} /> Update Visa</> : <><Plus size={18} /> Issue Visa</>)}
                        </button>
                    </div>
                </form>
            </div>

            {/* Visa List Table with Search */}
            <div className="glass-panel rounded-2xl max-w-4xl mx-auto w-full overflow-hidden border border-slate-700/50">
                <div className="p-6 border-b border-glassborder flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-slate-900/50">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                        <FileText className="text-slate-400" size={18}/> Visa Registry
                    </h3>
                    
                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                        <select value={searchType} onChange={e => setSearchType(e.target.value)} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 outline-none focus:border-indigo-500">
                            <option value="touristId">Tourist ID</option>
                            <option value="visaType">Visa Type</option>
                        </select>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-indigo-500" />
                        </div>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
                            Search
                        </button>
                        {searchQuery && (
                            <button type="button" onClick={() => { setSearchQuery(''); fetchVisas(); }} className="px-3 py-2 text-slate-400 hover:text-white transition-colors text-sm">
                                Clear
                            </button>
                        )}
                    </form>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/80 border-b border-glassborder text-slate-400 text-xs tracking-wider uppercase">
                                <th className="p-4 font-medium">Visa ID</th>
                                <th className="p-4 font-medium">Tourist ID</th>
                                <th className="p-4 font-medium">Type</th>
                                <th className="p-4 font-medium">Issued</th>
                                <th className="p-4 font-medium">Expires</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingVisas ? (
                                <tr><td colSpan={7} className="p-8 text-center text-slate-500">Loading visas...</td></tr>
                            ) : visas.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-slate-500">No visas found.</td></tr>
                            ) : (
                                visas.map(v => (
                                    <tr key={v.visaId} className={`border-b border-glassborder transition-colors ${editingId === v.visaId ? 'bg-indigo-900/20' : 'hover:bg-slate-800/30'}`}>
                                        <td className="p-4 font-medium text-white">#{v.visaId}</td>
                                        <td className="p-4 text-slate-300">#{v.touristId}</td>
                                        <td className="p-4 text-slate-300">{v.visaType}</td>
                                        <td className="p-4 text-slate-400">{v.issueDate}</td>
                                        <td className="p-4 text-slate-400">{v.expiryDate}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${v.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : v.status === 'Expired' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {v.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <button onClick={() => handleEditClick(v)} className="text-indigo-400 hover:text-indigo-300 p-2 rounded-lg hover:bg-indigo-500/10 transition-colors" title="Edit Visa">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteVisa(v.visaId)} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete Visa">
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
        </div>
    );
};

export default VisaManagement;
