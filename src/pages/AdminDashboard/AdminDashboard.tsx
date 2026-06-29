import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, UserPlus, ShieldCheck, Globe, History, Book, FileText, Bell, Briefcase, Building2, LayoutDashboard } from 'lucide-react';
import { AuthAPI } from '../../api/auth.api';

import PillNav from '../../components/PillNav';
import TouristManagement from '../../components/TouristManagement';
import VisaManagement from '../../components/VisaManagement';
import AlertManagement from '../../components/AlertManagement';
import RegistrationWizard from '../../components/RegistrationWizard';
import PassportManagement from '../../components/PassportManagement';
import TouristOverview from '../../components/TouristOverview';
import AirportDuty from '../../components/AirportDuty';
import TravelLogs from '../../components/TravelLogs';
import VisaDashboard from '../../components/Dashboard/VisaDashboard';
import AgencyManagement from '../../components/AgencyManagement';
import HotelManagement from '../../components/HotelManagement';
import VisaExtensionManagement from '../../components/VisaExtensionManagement';

const adminNavItems = [
    {
        id: 'overview-group',
        label: 'Overview',
        icon: <LayoutDashboard size={15} />,
        children: [
            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={13} /> },
            { id: 'tourist-overview', label: 'Tourist Analytics', icon: <Globe size={13} /> },
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
    },
    {
        id: 'system-group',
        label: 'System Config',
        icon: <Building2 size={15} />,
        children: [
            { id: 'alerts', label: 'Alerts', icon: <Bell size={13} /> },
            { id: 'users', label: 'Users', icon: <UserPlus size={13} /> },
            { id: 'agencies', label: 'Agencies', icon: <Briefcase size={13} /> },
            { id: 'hotels', label: 'Hotels', icon: <Building2 size={13} /> },
        ]
    }
];

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { tab } = useParams<{ tab: string }>();
    const activeTab = tab || 'dashboard';

    // Form states
    const [userForm, setUserForm] = useState({ email: '', password: '', role: 'ADMIN' });

    // UI states
    const [registerStatus, setRegisterStatus] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    const handleRegisterUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsRegistering(true);
        setRegisterStatus('');
        try {
            await AuthAPI.registerUser({
                email: userForm.email,
                password: userForm.password,
                roles: [userForm.role]
            });
            setRegisterStatus('User registered successfully in the backend!');
            setUserForm({ email: '', password: '', role: 'ADMIN' });
        } catch (error: any) {
            setRegisterStatus(error.response?.data || 'Failed to register user. Are you sure you are logged in as an ADMIN?');
        } finally {
            setIsRegistering(false);
        }
    };

    const renderContent = () => {
        if (activeTab === 'dashboard') return <VisaDashboard />;
        if (activeTab === 'wizard') return <RegistrationWizard />;
        if (activeTab === 'tourist-overview') return <TouristOverview />;
        if (activeTab === 'airport-duty') return <AirportDuty />;
        if (activeTab === 'travel-logs') return <TravelLogs />;
        if (activeTab === 'tourists') return <TouristManagement />;
        if (activeTab === 'passports') return <PassportManagement />;
        if (activeTab === 'visas') return <VisaManagement />;
        if (activeTab === 'extensions') return <VisaExtensionManagement />;
        if (activeTab === 'alerts') return <AlertManagement />;
        if (activeTab === 'agencies') return <AgencyManagement />;
        if (activeTab === 'hotels') return <HotelManagement />;

        if (activeTab === 'users') {
            return (
                <div className="max-w-2xl mx-auto">
                    <div className="glass-panel rounded-2xl p-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <UserPlus className="text-slate-500" size={22} /> Create System User
                        </h2>
                        {registerStatus && (
                            <div className="mb-6 p-4 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium border border-slate-200">
                                {registerStatus}
                            </div>
                        )}

                        <form onSubmit={handleRegisterUser} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={userForm.email}
                                    onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                                    className="input-light"
                                    placeholder="agency@smartvisa.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1.5">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={userForm.password}
                                    onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                                    className="input-light"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1.5">System Role</label>
                                <select
                                    value={userForm.role}
                                    onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                                    className="input-light appearance-none"
                                >
                                    <option value="ADMIN">System Admin</option>
                                    <option value="IMMIGRATION_OFFICER">Immigration Officer</option>
                                    <option value="HOTEL_STAFF">Hotel Staff</option>
                                    <option value="TRAVEL_AGENCY_STAFF">Travel Agency Staff</option>
                                    <option value="TOURIST_POLICE">Tourist Police</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={isRegistering}
                                className="btn-primary w-full py-3 mt-2"
                            >
                                {isRegistering ? 'Registering...' : <><Save size={16} /> Register User via API</>}
                            </button>
                        </form>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen text-slate-800">
            {/* Floating Pill Navigation */}
            <PillNav
                logoIcon={<ShieldCheck size={18} />}
                logoLabel="SmartVisa Admin"
                navItems={adminNavItems}
                activeTab={activeTab}
                onTabChange={(newTab) => {
                    navigate(`/admin/${newTab}`);
                    setRegisterStatus('');
                }}
            />

            {/* Main Content Canvas */}
            <main className="dashboard-canvas pb-8">
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminDashboard;
