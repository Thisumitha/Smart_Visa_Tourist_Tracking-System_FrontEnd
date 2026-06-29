import React, { useState } from 'react';
import { TouristAPI } from '../../api/tourist.api';
import { ShieldCheck, UserPlus, FileText, Globe, Calendar } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import PillNav from '../../components/PillNav';
import RegistrationWizard from '../../components/RegistrationWizard';
import TouristOverview from '../../components/TouristOverview';
import AirportDuty from '../../components/AirportDuty';
import TravelLogs from '../../components/TravelLogs';
import TouristManagement from '../../components/TouristManagement';
import PassportManagement from '../../components/PassportManagement';
import VisaManagement from '../../components/VisaManagement';
import VisaExtensionManagement from '../../components/VisaExtensionManagement';
import { LayoutDashboard, History, Book } from 'lucide-react';

const immigrationNavItems = [
    {
        id: 'overview-group',
        label: 'Overview',
        icon: <LayoutDashboard size={15} />,
        children: [
            { id: 'dashboard', label: 'Profiling', icon: <LayoutDashboard size={13} /> },
            { id: 'tourist-overview', label: 'Tourist Overview', icon: <Globe size={13} /> },
        ]
    },
    {
        id: 'operations-group',
        label: 'Operations',
        icon: <ShieldCheck size={15} />,
        children: [
            { id: 'wizard', label: 'New Registration', icon: <UserPlus size={13} /> },
            { id: 'airport-duty', label: 'Airport Duty', icon: <ShieldCheck size={13} /> },
            { id: 'travel-logs', label: 'Travel Logs', icon: <History size={13} /> },
        ]
    },
    {
        id: 'management-group',
        label: 'Management',
        icon: <FileText size={15} />,
        children: [
            { id: 'tourists', label: 'Manage Tourists', icon: <Globe size={13} /> },
            { id: 'passports', label: 'Passports', icon: <Book size={13} /> },
            { id: 'visas', label: 'Visas', icon: <FileText size={13} /> },
            { id: 'extensions', label: 'Extensions', icon: <History size={13} /> },
        ]
    }
];

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
            <div className="max-w-3xl mx-auto mt-4">
                <div className="glass-panel rounded-2xl p-8 shadow-card">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <UserPlus className="text-slate-500" size={22} /> Automated Tourist Profiling
                        </h1>
                        <p className="text-slate-500">Register new arrivals into the national tracking system.</p>
                    </div>

                    {successMsg && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium flex items-center gap-2">
                            <ShieldCheck size={16} /> {successMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1.5">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <FileText size={16} />
                                    </div>
                                    <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange}
                                        className="input-light pl-10" placeholder="John Doe" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1.5">Passport Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <ShieldCheck size={16} />
                                    </div>
                                    <input type="text" name="passportNumber" required value={formData.passportNumber} onChange={handleChange}
                                        className="input-light pl-10 uppercase" placeholder="AB123456" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1.5">Nationality</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Globe size={16} />
                                    </div>
                                    <input type="text" name="nationality" required value={formData.nationality} onChange={handleChange}
                                        className="input-light pl-10" placeholder="e.g. United Kingdom" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1.5">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <UserPlus size={16} />
                                    </div>
                                    <input type="email" name="email" required value={formData.email} onChange={handleChange} 
                                        className="input-light pl-10" placeholder="tourist@example.com" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1.5">Visa Type</label>
                                <select name="visaType" value={formData.visaType} onChange={handleChange}
                                    className="input-light appearance-none">
                                    <option>Tourist</option>
                                    <option>Business</option>
                                    <option>Transit</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1.5">Issue Date</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Calendar size={16} />
                                    </div>
                                    <input type="date" name="issueDate" required value={formData.issueDate} onChange={handleChange}
                                        className="input-light pl-10" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1.5">Expiry Date</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Calendar size={16} />
                                    </div>
                                    <input type="date" name="expiryDate" required value={formData.expiryDate} onChange={handleChange}
                                        className="input-light pl-10" />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 mt-2"
                        >
                            {loading ? 'Registering Profile...' : 'Create Centralised Profile'}
                        </button>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen text-slate-800">
            {/* Floating Pill Navigation */}
            <PillNav
                logoIcon={<ShieldCheck size={18} />}
                logoLabel="Immigration Control"
                navItems={immigrationNavItems}
                activeTab={activeTab}
                onTabChange={(newTab) => {
                    navigate(`/immigration/${newTab}`);
                    setSuccessMsg('');
                }}
            />

            {/* Main Content Canvas */}
            <main className="dashboard-canvas pb-8">
                {renderContent()}
            </main>
        </div>
    );
};

export default ImmigrationDashboard;
