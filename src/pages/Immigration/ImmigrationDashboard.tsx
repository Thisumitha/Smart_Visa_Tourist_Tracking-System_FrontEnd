import React, { useState } from 'react';
import { TouristAPI } from '../../api/tourist.api';
import { ShieldCheck, UserPlus, FileText, Globe, Calendar, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ImmigrationDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [formData, setFormData] = useState({
        fullName: '',
        passportNumber: '',
        nationality: '',
        visaType: 'Tourist',
        issueDate: '',
        expiryDate: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMsg('');
        try {
            await TouristAPI.registerTourist(formData);
            setSuccessMsg(`Successfully registered profile for passport ${formData.passportNumber}`);
            setFormData({ fullName: '', passportNumber: '', nationality: '', visaType: 'Tourist', issueDate: '', expiryDate: '' });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
            <header className="h-16 glass-panel border-x-0 border-t-0 rounded-none flex items-center justify-between px-8 z-10 sticky top-0">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-emerald-500" size={24} />
                    <h2 className="text-xl font-bold text-white tracking-wide">Immigration Control</h2>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 font-medium transition-colors">
                    <LogOut size={18} /> Sign Out
                </button>
            </header>

            <main className="flex-1 p-8 bg-[url('https://images.unsplash.com/photo-1551041777-ed277b8dd348?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-fixed relative">
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-0"></div>
                
                <div className="relative z-10 max-w-3xl mx-auto mt-8">
                    <div className="glass-panel rounded-2xl p-8 shadow-2xl border border-emerald-500/20">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                <UserPlus className="text-emerald-400" /> Automated Tourist Profiling
                            </h1>
                            <p className="text-slate-400">Register new arrivals into the national tracking system.</p>
                        </div>

                        {successMsg && (
                            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-xl text-emerald-400 text-sm font-medium flex items-center gap-2">
                                <ShieldCheck size={18} /> {successMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                            <FileText size={18} />
                                        </div>
                                        <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="John Doe" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Passport Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <input type="text" name="passportNumber" required value={formData.passportNumber} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all uppercase" placeholder="AB123456" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Nationality</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                            <Globe size={18} />
                                        </div>
                                        <input type="text" name="nationality" required value={formData.nationality} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="e.g. United Kingdom" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Visa Type</label>
                                    <select name="visaType" value={formData.visaType} onChange={handleChange} className="block w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none">
                                        <option>Tourist</option>
                                        <option>Business</option>
                                        <option>Transit</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Issue Date</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                            <Calendar size={18} />
                                        </div>
                                        <input type="date" name="issueDate" required value={formData.issueDate} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Expiry Date</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                            <Calendar size={18} />
                                        </div>
                                        <input type="date" name="expiryDate" required value={formData.expiryDate} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                                    </div>
                                </div>
                            </div>
                            
                            <button type="submit" disabled={loading} className="w-full py-4 mt-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50">
                                {loading ? 'Registering Profile...' : 'Create Centralized Profile'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ImmigrationDashboard;
