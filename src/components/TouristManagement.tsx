import React, { useEffect, useState } from 'react';
import { Globe, Users, Plus, Trash2, Edit2, X, Save } from 'lucide-react';
import { TouristAPI } from '../api/tourist.api';
import Swal from 'sweetalert2';

const TouristManagement: React.FC = () => {
    // Tourists Data
    const [manageTourists, setManageTourists] = useState<any[]>([]);
    const [loadingTourists, setLoadingTourists] = useState(false);

    // Tourist Form
    const [touristForm, setTouristForm] = useState({ firstName: '', lastName: '', nationality: '', dateOfBirth: '', gender: 'Male' });
    const [editingId, setEditingId] = useState<number | null>(null);
    // UI states
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchManageTourists();
    }, []);

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
            setTouristForm({ firstName: '', lastName: '', nationality: '', dateOfBirth: '', gender: 'Male' });
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
            gender: tourist.gender || 'Male'
        });
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to the form
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setTouristForm({ firstName: '', lastName: '', nationality: '', dateOfBirth: '', gender: 'Male' });
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
                        <input type="text" required value={touristForm.nationality} onChange={e => setTouristForm({...touristForm, nationality: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="United Kingdom" />
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
                    <div className="md:col-span-2 flex justify-end mt-4">
                        <button type="submit" disabled={isSubmitting} className={`px-8 py-3 text-white rounded-xl font-medium transition-all flex items-center gap-2 ${editingId ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                            {isSubmitting ? (editingId ? 'Updating...' : 'Registering...') : (editingId ? <><Save size={18} /> Update Tourist</> : <><Plus size={18} /> Create Tourist</>)}
                        </button>
                    </div>
                </form>
            </div>

            {/* Tourist List Table */}
            <div className="glass-panel rounded-2xl max-w-4xl mx-auto w-full overflow-hidden border border-slate-700/50">
                <div className="p-6 border-b border-glassborder flex justify-between items-center bg-slate-900/50">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2"><Users className="text-slate-400" size={18}/> Tourist Database</h3>
                    <button onClick={fetchManageTourists} className="text-sm text-emerald-400 hover:text-emerald-300">Refresh</button>
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
                            ) : manageTourists.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No tourists found.</td></tr>
                            ) : (
                                manageTourists.map(t => (
                                    <tr key={t.touristId} className={`border-b border-glassborder transition-colors ${editingId === t.touristId ? 'bg-blue-900/20' : 'hover:bg-slate-800/30'}`}>
                                        <td className="p-4 text-slate-400">#{t.touristId}</td>
                                        <td className="p-4 font-medium text-white">{t.firstName} {t.lastName}</td>
                                        <td className="p-4 text-slate-300">{t.nationality}</td>
                                        <td className="p-4 text-slate-400">{t.dateOfBirth}</td>
                                        <td className="p-4 text-slate-400">{t.gender}</td>
                                        <td className="p-4 text-right flex justify-end gap-2">
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
        </div>
    );
};

export default TouristManagement;
