import React, { useEffect, useState } from 'react';
import { Book, Users, Plus, Trash2, Edit2, X, Save, FileText } from 'lucide-react';
import { PassportAPI, TouristAPI } from '../api/tourist.api';
import { VisaAPI } from '../api/visa.api';
import Swal from 'sweetalert2';

const PassportManagement: React.FC = () => {
    // Data
    const [passports, setPassports] = useState<any[]>([]);
    const [tourists, setTourists] = useState<any[]>([]);
    const [visas, setVisas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Form
    const [passportForm, setPassportForm] = useState({ passportNumber: '', issueDate: '', expiryDate: '', touristId: '' });
    const [editingId, setEditingId] = useState<number | null>(null);
    
    // UI states
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [passportsData, touristsData, visasData] = await Promise.all([
                PassportAPI.getAllPassports(),
                TouristAPI.getAllTourists(),
                VisaAPI.getAllVisas(0, 100)
            ]);
            setPassports(passportsData);
            setTourists(touristsData);
            setVisas(visasData.content || []);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passportForm.touristId) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Please assign a Tourist.', background: '#0f172a', color: '#fff' });
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingId) {
                // Update
                await PassportAPI.updatePassport(editingId, Number(passportForm.touristId), passportForm);
                Swal.fire({
                    icon: 'success', title: 'Updated!', text: `Passport ${passportForm.passportNumber} updated successfully!`,
                    background: '#0f172a', color: '#fff', confirmButtonColor: '#3b82f6'
                });
            } else {
                // Create
                await PassportAPI.createPassport(Number(passportForm.touristId), passportForm);
                Swal.fire({
                    icon: 'success', title: 'Created!', text: `Passport ${passportForm.passportNumber} created successfully!`,
                    background: '#0f172a', color: '#fff', confirmButtonColor: '#10b981'
                });
            }
            // Reset form
            setPassportForm({ passportNumber: '', issueDate: '', expiryDate: '', touristId: '' });
            setEditingId(null);
            fetchData();
        } catch (error: any) {
            Swal.fire({
                icon: 'error', title: 'Error', text: `Failed to ${editingId ? 'update' : 'create'} passport.`,
                background: '#0f172a', color: '#fff', confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (passport: any) => {
        setEditingId(passport.passportId);
        
        setPassportForm({
            passportNumber: passport.passportNumber,
            issueDate: passport.issueDate,
            expiryDate: passport.expiryDate,
            touristId: passport.tourist ? passport.tourist.touristId.toString() : ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setPassportForm({ passportNumber: '', issueDate: '', expiryDate: '', touristId: '' });
    };

    const handleDeletePassport = async (id: number) => {
        const result = await Swal.fire({
            title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true,
            background: '#0f172a', color: '#fff', confirmButtonColor: '#ef4444', cancelButtonColor: '#475569'
        });

        if (result.isConfirmed) {
            try {
                await PassportAPI.deletePassport(id);
                fetchData();
                if (editingId === id) handleCancelEdit();
                Swal.fire({ title: 'Deleted!', text: 'Passport has been deleted.', icon: 'success', background: '#0f172a', color: '#fff', confirmButtonColor: '#10b981' });
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete passport', background: '#0f172a', color: '#fff', confirmButtonColor: '#ef4444' });
            }
        }
    };

    // Helper to find tourist for a passport
    const getTouristForPassport = (passportId: number) => {
        const passport = passports.find(p => p.passportId === passportId);
        if (passport && passport.tourist) {
            return `${passport.tourist.firstName} ${passport.tourist.lastName}`;
        }
        return 'Unassigned';
    };

    // Helper to find visas for a passport
    const getVisasForPassport = (passportId: number) => {
        return visas.filter(v => v.passportId === passportId);
    };

    return (
        <div className="space-y-8 w-full">
            {/* Form */}
            <div className="glass-panel rounded-2xl p-8 max-w-4xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {editingId ? <><Edit2 className="text-blue-400" /> Edit Passport #{editingId}</> : <><Book className="text-blue-400" /> Register Passport</>}
                    </h2>
                    {editingId && (
                        <button onClick={handleCancelEdit} className="text-slate-400 hover:text-white flex items-center gap-1 text-sm bg-slate-800/50 hover:bg-slate-700/50 px-3 py-1.5 rounded-lg transition-colors">
                            <X size={16} /> Cancel Edit
                        </button>
                    )}
                </div>
                
                <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Passport Number</label>
                        <input type="text" required value={passportForm.passportNumber} onChange={e => setPassportForm({...passportForm, passportNumber: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="P1234567" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Assign to Tourist</label>
                        <select required value={passportForm.touristId} onChange={e => setPassportForm({...passportForm, touristId: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                            <option value="" disabled>Select a tourist...</option>
                            {tourists.map(t => (
                                <option key={t.touristId} value={t.touristId}>
                                    {t.firstName} {t.lastName} (ID: {t.touristId})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Issue Date</label>
                        <input type="date" required value={passportForm.issueDate} onChange={e => setPassportForm({...passportForm, issueDate: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Expiry Date</label>
                        <input type="date" required value={passportForm.expiryDate} onChange={e => setPassportForm({...passportForm, expiryDate: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="md:col-span-2 flex justify-end mt-4">
                        <button type="submit" disabled={isSubmitting} className={`px-8 py-3 text-white rounded-xl font-medium transition-all flex items-center gap-2 ${editingId ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
                            {isSubmitting ? (editingId ? 'Updating...' : 'Registering...') : (editingId ? <><Save size={18} /> Update Passport</> : <><Plus size={18} /> Create Passport</>)}
                        </button>
                    </div>
                </form>
            </div>

            {/* List Table */}
            <div className="glass-panel rounded-2xl max-w-4xl mx-auto w-full overflow-hidden border border-slate-700/50">
                <div className="p-6 border-b border-glassborder flex justify-between items-center bg-slate-900/50">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2"><Book className="text-slate-400" size={18}/> Passport Registry</h3>
                    <button onClick={fetchData} className="text-sm text-blue-400 hover:text-blue-300">Refresh</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/80 border-b border-glassborder text-slate-400 text-xs tracking-wider uppercase">
                                <th className="p-4 font-medium">Passport ID</th>
                                <th className="p-4 font-medium">Number</th>
                                <th className="p-4 font-medium">Tourist</th>
                                <th className="p-4 font-medium">Dates</th>
                                <th className="p-4 font-medium">Linked Visas</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading database...</td></tr>
                            ) : passports.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No passports found.</td></tr>
                            ) : (
                                passports.map(p => {
                                    const assignedVisas = getVisasForPassport(p.passportId);
                                    return (
                                        <tr key={p.passportId} className={`border-b border-glassborder transition-colors ${editingId === p.passportId ? 'bg-blue-900/20' : 'hover:bg-slate-800/30'}`}>
                                            <td className="p-4 text-slate-400">#{p.passportId}</td>
                                            <td className="p-4 font-medium text-white">{p.passportNumber}</td>
                                            <td className="p-4 text-emerald-300 flex items-center gap-2"><Users size={14}/> {getTouristForPassport(p.passportId)}</td>
                                            <td className="p-4 text-xs text-slate-400">
                                                <div>Iss: {p.issueDate}</div>
                                                <div>Exp: {p.expiryDate}</div>
                                            </td>
                                            <td className="p-4">
                                                {assignedVisas.length > 0 ? (
                                                    <div className="flex flex-col gap-1">
                                                        {assignedVisas.map((v: any) => (
                                                            <span key={v.visaId} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30">
                                                                <FileText size={10} /> Visa #{v.visaId} ({v.visaType})
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500 text-xs">No Visas</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right flex justify-end gap-2 h-full items-center">
                                                <button onClick={() => handleEditClick(p)} className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/10 transition-colors" title="Edit Passport">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDeletePassport(p.passportId)} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete Passport">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PassportManagement;
