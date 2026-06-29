import React, { useState } from 'react';
import { TouristAPI } from '../../api/tourist.api';
import { ShieldCheck, UserPlus, FileText, Globe, Calendar } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import ImmigrationSidebar from '../../components/ImmigrationSidebar';
import RegistrationWizard from '../../components/RegistrationWizard';
import TouristOverview from '../../components/TouristOverview';
import AirportDuty from '../../components/AirportDuty';
import TravelLogs from '../../components/TravelLogs';
import TouristManagement from '../../components/TouristManagement';
import PassportManagement from '../../components/PassportManagement';
import VisaManagement from '../../components/VisaManagement';
import VisaExtensionManagement from '../../components/VisaExtensionManagement';

const ImmigrationDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { tab } = useParams<{ tab: string }>();
    const activeTab = tab || 'dashboard';

    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [formData, setFormData] = useState({
        fullName: '',
        passportNumber: '',
        nationality: '',
        visaType: 'Tourist',
        issueDate: '',
        expiryDate: '',
        email: ''
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
            setFormData({ fullName: '', passportNumber: '', nationality: '', visaType: 'Tourist', issueDate: '', expiryDate: '', email: '' });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        if (activeTab === 'wizard') return <RegistrationWizard />;
        if (activeTab === 'tourist-overview') return <TouristOverview />;
        if (activeTab === 'airport-duty') return <AirportDuty />;
        if (activeTab === 'travel-logs') return <TravelLogs />;
        if (activeTab === 'tourists') return <TouristManagement />;
        if (activeTab === 'passports') return <PassportManagement />;
        if (activeTab === 'visas') return <VisaManagement />;
        if (activeTab === 'extensions') return <VisaExtensionManagement />;

        // Default Dashboard (Automated Profiling)
        return (
            <div className="max-w-3xl mx-auto mt-8 relative z-10">
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
                                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <UserPlus size={18} />
                                    </div>
                                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="tourist@example.com" />
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
        );
    };

    return (
        <div className="min-h-screen bg-slate-950 flex text-slate-200">
            {/* Sidebar Component */}
            <ImmigrationSidebar 
                activeTab={activeTab} 
                onTabChange={(newTab) => {
                    navigate(`/immigration/${newTab}`);
                    setSuccessMsg('');
                }} 
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[url('https://images.unsplash.com/photo-1551041777-ed277b8dd348?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-fixed relative">
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-0"></div>

                <header className="h-20 glass-panel border-x-0 border-t-0 rounded-none flex items-center justify-between px-8 z-10 relative">
                    <h2 className="text-xl font-semibold text-white capitalize">
                        {activeTab === 'dashboard' ? 'Automated Tourist Profiling' : `Manage ${activeTab.replace('-', ' ')}`}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold border-2 border-slate-800 shadow-lg">
                            IO
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 relative z-10">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default ImmigrationDashboard;
