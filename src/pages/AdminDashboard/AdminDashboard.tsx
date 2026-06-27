import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, Plus, Save, UserPlus } from 'lucide-react';
import { AuthAPI } from '../../api/auth.api';
import { HotelAPI } from '../../api/partner.api';
import AdminSidebar from '../../components/AdminSidebar';
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

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { tab } = useParams<{ tab: string }>();
    const activeTab = tab || 'dashboard';
    
    // Form states
    const [userForm, setUserForm] = useState({ email: '', password: '', role: 'ADMIN' });
    
    // UI states
    const [registerStatus, setRegisterStatus] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    // Removed overview useEffect

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
        if (activeTab === 'dashboard') {
            return <VisaDashboard />;
        }

        if (activeTab === 'wizard') {
            return <RegistrationWizard />;
        }

        if (activeTab === 'tourist-overview') {
            return <TouristOverview />;
        }

        if (activeTab === 'airport-duty') {
            return <AirportDuty />;
        }

        if (activeTab === 'travel-logs') {
            return <TravelLogs />;
        }

        if (activeTab === 'tourists') {
            return <TouristManagement />;
        }

        if (activeTab === 'passports') {
            return <PassportManagement />;
        }

        if (activeTab === 'visas') {
            return <VisaManagement />;
        }

        if (activeTab === 'extensions') {
            return <VisaExtensionManagement />;
        }

        if (activeTab === 'alerts') {
            return <AlertManagement />;
        }

        if (activeTab === 'users') {
            return (
                <div className="max-w-2xl mx-auto">
                    <div className="glass-panel rounded-2xl p-8">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <UserPlus className="text-blue-400" /> Create System User
                        </h2>
                        {registerStatus && <div className="mb-6 p-4 bg-blue-500/10 text-blue-400 rounded-xl text-sm font-medium border border-blue-500/20">{registerStatus}</div>}
                        
                        <form onSubmit={handleRegisterUser} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                                <input type="email" required value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="agency@smartvisa.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                                <input type="password" required value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">System Role</label>
                                <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                                    <option value="ADMIN">System Admin</option>
                                    <option value="IMMIGRATION_OFFICER">Immigration Officer</option>
                                    <option value="HOTEL_STAFF">Hotel Staff</option>
                                    <option value="TRAVEL_AGENCY_STAFF">Travel Agency Staff</option>
                                    <option value="TOURIST_POLICE">Tourist Police</option>
                                </select>
                            </div>
                            <button type="submit" disabled={isRegistering} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all flex justify-center items-center gap-2">
                                {isRegistering ? 'Registering...' : <><Save size={18} /> Register User via API</>}
                            </button>
                        </form>
                    </div>
                </div>
            );
        }

        if (activeTab === 'agencies') {
            return <AgencyManagement />;
        }

        if (activeTab === 'hotels') {
            return <HotelManagement />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex text-slate-200">
            {/* Sidebar Component */}
            <AdminSidebar 
                activeTab={activeTab} 
                onTabChange={(newTab) => {
                    navigate(`/admin/${newTab}`);
                    setRegisterStatus('');
                }} 
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-20 glass-panel border-x-0 border-t-0 rounded-none flex items-center justify-between px-8 z-10">
                    <h2 className="text-xl font-semibold text-white capitalize">
                        {activeTab === 'dashboard' ? 'Visa Tracking Dashboard' : `Manage ${activeTab}`}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold border-2 border-slate-800 shadow-lg">
                            A
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-slate-900 to-slate-950">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
