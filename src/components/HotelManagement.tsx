import React, { useEffect, useState } from 'react';
import { Building2, Plus, Trash2, Edit2, X, Save } from 'lucide-react';
import { HotelAPI } from '../api/partner.api';
import { AuthAPI } from '../api/auth.api';
import Swal from 'sweetalert2';

const HotelManagement: React.FC = () => {
    // Hotels Data
    const [hotels, setHotels] = useState<any[]>([]);
    const [loadingHotels, setLoadingHotels] = useState(false);

    // Form
    const [hotelForm, setHotelForm] = useState({ name: '', registrationId: '', district: '', email: '', password: '' });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchHotels();
    }, []);

    const fetchHotels = async () => {
        setLoadingHotels(true);
        try {
            const data = await HotelAPI.getAllHotels();
            setHotels(Array.isArray(data) ? data : (data?.content || []));
        } catch (error) {
            console.error("Failed to fetch hotels", error);
        } finally {
            setLoadingHotels(false);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingId) {
                // Update existing hotel
                await HotelAPI.updateHotel(editingId, {
                    hotelName: hotelForm.name,
                    registrationNumber: Number(hotelForm.registrationId.replace(/\D/g,'')) || 0
                });
                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: `Hotel '${hotelForm.name}' updated successfully!`,
                    background: '#0f172a',
                    color: '#fff',
                    confirmButtonColor: '#3b82f6'
                });
            } else {
                // Create new hotel - Requires Auth first
                await AuthAPI.registerUser({
                    email: hotelForm.email,
                    password: hotelForm.password,
                    roles: ['HOTEL_STAFF']
                });

                await HotelAPI.createHotel({
                    hotelName: hotelForm.name,
                    registrationNumber: Number(hotelForm.registrationId.replace(/\D/g,'')) || 0
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Registered!',
                    text: `Hotel '${hotelForm.name}' created successfully!`,
                    background: '#0f172a',
                    color: '#fff',
                    confirmButtonColor: '#10b981'
                });
            }
            // Reset form
            setHotelForm({ name: '', registrationId: '', district: '', email: '', password: '' });
            setEditingId(null);
            fetchHotels(); // Refresh list
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data || `Failed to ${editingId ? 'update' : 'register'} hotel.`,
                background: '#0f172a',
                color: '#fff',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (hotel: any) => {
        setEditingId(hotel.hotelId);
        setHotelForm({
            name: hotel.hotelName,
            registrationId: String(hotel.registrationNumber),
            district: '', // We don't have district in backend currently based on HotelDto, mocked here
            email: '', // Don't fetch/show password/email for editing right now
            password: ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setHotelForm({ name: '', registrationId: '', district: '', email: '', password: '' });
    };

    const handleDeleteHotel = async (id: number) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This will remove the hotel from the system.",
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
                await HotelAPI.deleteHotel(id);
                fetchHotels();
                if (editingId === id) handleCancelEdit();
                Swal.fire({
                    title: 'Deleted!',
                    text: 'The hotel has been deleted.',
                    icon: 'success',
                    background: '#0f172a',
                    color: '#fff',
                    confirmButtonColor: '#10b981'
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to delete hotel.',
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
                            <><Edit2 className="text-amber-400" /> Edit Hotel #{editingId}</>
                        ) : (
                            <><Building2 className="text-amber-400" /> Register Hotel Profile</>
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
                        <label className="block text-sm font-medium text-slate-300 mb-2">Hotel Name</label>
                        <input type="text" required value={hotelForm.name} onChange={e => setHotelForm({...hotelForm, name: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Grand Palace Hotel" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Registration ID</label>
                        <input type="text" required value={hotelForm.registrationId} onChange={e => setHotelForm({...hotelForm, registrationId: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500 outline-none" placeholder="HTL-9988" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">District (Optional)</label>
                        <input type="text" value={hotelForm.district} onChange={e => setHotelForm({...hotelForm, district: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Colombo" />
                    </div>
                    
                    {!editingId && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Account Email</label>
                                <input type="email" required value={hotelForm.email} onChange={e => setHotelForm({...hotelForm, email: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500 outline-none" placeholder="admin@hotel.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Account Password</label>
                                <input type="password" required value={hotelForm.password} onChange={e => setHotelForm({...hotelForm, password: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500 outline-none" placeholder="••••••••" />
                            </div>
                        </>
                    )}

                    <div className="md:col-span-2 flex justify-end mt-4">
                        <button type="submit" disabled={isSubmitting} className={`px-8 py-3 text-white rounded-xl font-medium transition-all flex items-center gap-2 ${editingId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                            {isSubmitting ? (editingId ? 'Updating...' : 'Registering...') : (editingId ? <><Save size={18} /> Update Hotel</> : <><Plus size={18} /> Create Hotel Profile</>)}
                        </button>
                    </div>
                </form>
            </div>

            {/* Hotels Data Table */}
            <div className="glass-panel rounded-2xl w-full overflow-hidden border border-slate-700/50">
                <div className="p-6 border-b border-glassborder flex justify-between items-center bg-slate-900/50">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2"><Building2 className="text-slate-400" size={18}/> Hotel Database</h3>
                    <button onClick={fetchHotels} className="text-sm text-emerald-400 hover:text-emerald-300">Refresh</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/80 border-b border-glassborder text-slate-400 text-xs tracking-wider uppercase">
                                <th className="p-4 font-medium">ID</th>
                                <th className="p-4 font-medium">Hotel Name</th>
                                <th className="p-4 font-medium">Registration No</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingHotels ? (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Loading database...</td></tr>
                            ) : hotels.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-500">No hotels found.</td></tr>
                            ) : (
                                hotels.map(h => (
                                    <tr key={h.hotelId} className={`border-b border-glassborder transition-colors ${editingId === h.hotelId ? 'bg-amber-900/20' : 'hover:bg-slate-800/30'}`}>
                                        <td className="p-4 text-slate-400">#{h.hotelId}</td>
                                        <td className="p-4 font-medium text-white">{h.hotelName}</td>
                                        <td className="p-4 text-slate-300">{h.registrationNumber}</td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <button onClick={() => handleEditClick(h)} className="text-amber-400 hover:text-amber-300 p-2 rounded-lg hover:bg-amber-500/10 transition-colors" title="Edit Hotel">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteHotel(h.hotelId)} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete Hotel">
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

export default HotelManagement;
