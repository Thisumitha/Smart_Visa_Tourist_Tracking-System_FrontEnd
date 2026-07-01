import React, { useEffect, useState } from 'react';
import { Briefcase, Plus, Trash2, Edit2, X, Save } from 'lucide-react';
import { PartnerAPI } from '../api/partner.api';
import { AuthAPI } from '../api/auth.api';
import Swal from 'sweetalert2';

const AgencyManagement: React.FC = () => {
    // Agencies Data
    const [agencies, setAgencies] = useState<any[]>([]);
    const [loadingAgencies, setLoadingAgencies] = useState(false);

    // Form
    const [agencyForm, setAgencyForm] = useState({ name: '', license: '', email: '', password: '' });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchAgencies();
    }, []);

    const fetchAgencies = async () => {
        setLoadingAgencies(true);
        try {
            const data = await PartnerAPI.getAllAgencies();
            setAgencies(Array.isArray(data) ? data : (data?.content || []));
        } catch (error) {
            console.error("Failed to fetch agencies", error);
        } finally {
            setLoadingAgencies(false);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingId) {
                // Update existing agency
                await PartnerAPI.updateAgency(editingId, {
                    agencyName: agencyForm.name,
                    licenseNumber: Number(agencyForm.license.replace(/\D/g,'')) || 0,
                    status: true,
                    email: agencyForm.email
                });
                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: `Agency '${agencyForm.name}' updated successfully!`,
                    background: '#0f172a',
                    color: '#fff',
                    confirmButtonColor: '#3b82f6'
                });
            } else {
                // Create new agency - Requires Auth first
                await AuthAPI.registerUser({
                    email: agencyForm.email,
                    password: agencyForm.password,
                    roles: ['TRAVEL_AGENCY_STAFF']
                });

                await PartnerAPI.createAgency({
                    agencyName: agencyForm.name,
                    licenseNumber: Number(agencyForm.license.replace(/\D/g,'')) || 0,
                    status: true,
                    email: agencyForm.email
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Registered!',
                    text: `Agency '${agencyForm.name}' created successfully!`,
                    background: '#0f172a',
                    color: '#fff',
                    confirmButtonColor: '#10b981'
                });
            }
            // Reset form
            setAgencyForm({ name: '', license: '', email: '', password: '' });
            setEditingId(null);
            fetchAgencies(); // Refresh list
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data || `Failed to ${editingId ? 'update' : 'register'} agency.`,
                background: '#0f172a',
                color: '#fff',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (agency: any) => {
        setEditingId(agency.agencyId);
        setAgencyForm({
            name: agency.agencyName,
            license: String(agency.licenseNumber),
            email: agency.email || '', 
            password: ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setAgencyForm({ name: '', license: '', email: '', password: '' });
    };

    const handleDeleteAgency = async (id: number) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This will remove the agency from the system. Ensure no active tours rely on this agency.",
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
                await PartnerAPI.deleteAgency(id);
                fetchAgencies();
                if (editingId === id) handleCancelEdit();
                Swal.fire({
                    title: 'Deleted!',
                    text: 'The agency has been deleted.',
                    icon: 'success',
                    background: '#0f172a',
                    color: '#fff',
                    confirmButtonColor: '#10b981'
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to delete agency.',
                    background: '#0f172a',
                    color: '#fff',
                    confirmButtonColor: '#ef4444'
                });
            }
        }
    };

    return (
        <div className="space-y-8 w-full max-w-5xl mx-auto">
            {/* Create / Edit Form */}
            <div className="glass-panel rounded-2xl p-8 w-full border border-slate-700/50">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {editingId ? (
                            <><Edit2 className="text-indigo-400" /> Edit Agency #{editingId}</>
                        ) : (
                            <><Briefcase className="text-indigo-400" /> Register Travel Agency</>
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
                        <label className="block text-sm font-medium text-slate-300 mb-2">Agency Name</label>
                        <input type="text" required value={agencyForm.name} onChange={e => setAgencyForm({...agencyForm, name: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Lanka Tours Pvt Ltd" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">License Number</label>
                        <input type="text" required value={agencyForm.license} onChange={e => setAgencyForm({...agencyForm, license: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="12345" />
                    </div>
                    
                    {!editingId && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Login Email</label>
                                <input type="email" required value={agencyForm.email} onChange={e => setAgencyForm({...agencyForm, email: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="contact@agency.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Account Password</label>
                                <input type="password" required value={agencyForm.password} onChange={e => setAgencyForm({...agencyForm, password: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" />
                            </div>
                        </>
                    )}

                    <div className="md:col-span-2 flex justify-end mt-4">
                        <button type="submit" disabled={isSubmitting} className={`px-8 py-3 text-white rounded-xl font-medium transition-all flex items-center gap-2 ${editingId ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                            {isSubmitting ? (editingId ? 'Updating...' : 'Registering...') : (editingId ? <><Save size={18} /> Update Agency</> : <><Plus size={18} /> Create Agency</>)}
                        </button>
                    </div>
                </form>
            </div>

            {/* Agencies Data Table */}
            <div className="glass-panel rounded-2xl w-full overflow-hidden border border-slate-700/50">
                <div className="p-6 border-b border-glassborder flex justify-between items-center bg-slate-900/50">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2"><Briefcase className="text-slate-400" size={18}/> Agency Database</h3>
                    <button onClick={fetchAgencies} className="text-sm text-emerald-400 hover:text-emerald-300">Refresh</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/80 border-b border-glassborder text-slate-400 text-xs tracking-wider uppercase">
                                <th className="p-4 font-medium">ID</th>
                                <th className="p-4 font-medium">Agency Name</th>
                                <th className="p-4 font-medium">License No</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingAgencies ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading database...</td></tr>
                            ) : agencies.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No agencies found.</td></tr>
                            ) : (
                                agencies.map(a => (
                                    <tr key={a.agencyId} className={`border-b border-glassborder transition-colors ${editingId === a.agencyId ? 'bg-indigo-900/20' : 'hover:bg-slate-800/30'}`}>
                                        <td className="p-4 text-slate-400">#{a.agencyId}</td>
                                        <td className="p-4 font-medium text-white">{a.agencyName}</td>
                                        <td className="p-4 text-slate-300">{a.licenseNumber}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${a.status ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {a.status ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <button onClick={() => handleEditClick(a)} className="text-indigo-400 hover:text-indigo-300 p-2 rounded-lg hover:bg-indigo-500/10 transition-colors" title="Edit Agency">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteAgency(a.agencyId)} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete Agency">
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

export default AgencyManagement;
