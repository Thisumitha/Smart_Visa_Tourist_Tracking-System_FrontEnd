import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, MapPin, Activity, Building2, Briefcase, Plus, Save, UserPlus } from 'lucide-react';
import { AdminAPI } from '../../api/admin.api';
import { AuthAPI } from '../../api/auth.api';
import { PartnerAPI } from '../../api/partner.api';
import AdminSidebar from '../../components/AdminSidebar';
import TouristManagement from '../../components/TouristManagement';
import VisaManagement from '../../components/VisaManagement';
import AlertManagement from '../../components/AlertManagement';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { tab } = useParams<{ tab: string }>();
    const activeTab = tab || 'overview';
    
    
    // Overview Data
    const [tourists, setTourists] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [userForm, setUserForm] = useState({ email: '', password: '', role: 'ROLE_ADMIN' });
    const [agencyForm, setAgencyForm] = useState({ name: '', license: '', email: '', password: '' });
    const [hotelForm, setHotelForm] = useState({ name: '', registrationId: '', district: '' });
    
    // UI states
    const [registerStatus, setRegisterStatus] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

    useEffect(() => {
        if (activeTab === 'overview') {
            const fetchDashboardData = async () => {
                setLoading(true);
                try {
                    const [touristsData, locationsData] = await Promise.all([
                        AdminAPI.getAllTourists(),
                        AdminAPI.getRecentLocations()
                    ]);
                    setTourists(touristsData as any[]);
                    setLocations(locationsData as any[]);
                } catch (error) {
                    console.error("Failed to fetch dashboard data", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchDashboardData();
        }
    }, [activeTab]);

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
            setUserForm({ email: '', password: '', role: 'ROLE_AGENCY' });
        } catch (error: any) {
            setRegisterStatus(error.response?.data || 'Failed to register user. Are you sure you are logged in as an ADMIN?');
        } finally {
            setIsRegistering(false);
        }
    };

    const handleRegisterAgency = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsRegistering(true);
        setRegisterStatus('');
        try {
            // Step 1: Create the User Account
            await AuthAPI.registerUser({
                email: agencyForm.email,
                password: agencyForm.password,
                roles: ['TRAVEL_AGENCY_STAFF']
            });

            // Step 2: Create the Agency Profile
            await PartnerAPI.createAgency({
                agencyName: agencyForm.name,
                licenseNumber: Number(agencyForm.license.replace(/\D/g,'')) || 0, // ensure it's a number for backend
                status: true
            });

            setRegisterStatus(`Success! User Account and Agency Profile '${agencyForm.name}' created.`);
            setAgencyForm({ name: '', license: '', email: '', password: '' });
        } catch (error: any) {
            setRegisterStatus(error.response?.data || 'Failed to register Agency. Make sure you are logged in as ADMIN.');
        } finally {
            setIsRegistering(false);
        }
    };

    const handleRegisterHotel = (e: React.FormEvent) => {
        e.preventDefault();
        setRegisterStatus(`Mock: Hotel '${hotelForm.name}' created successfully.`);
        setHotelForm({ name: '', registrationId: '', district: '' });
    };

    const renderContent = () => {
        if (activeTab === 'overview') {
            return (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-panel p-6 rounded-2xl">
                            <div className="text-slate-400 text-sm font-medium mb-2 flex justify-between items-center">
                                Total Registered <Users size={16} className="text-blue-400"/>
                            </div>
                            <div className="text-3xl font-bold text-white">{loading ? '...' : tourists.length}</div>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl">
                            <div className="text-slate-400 text-sm font-medium mb-2 flex justify-between items-center">
                                Active Trackers <MapPin size={16} className="text-emerald-400"/>
                            </div>
                            <div className="text-3xl font-bold text-white">{loading ? '...' : locations.length}</div>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl">
                            <div className="text-slate-400 text-sm font-medium mb-2 flex justify-between items-center">
                                System Status <Activity size={16} className="text-indigo-400"/>
                            </div>
                            <div className="text-xl font-bold text-emerald-400 mt-2 flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span> Healthy
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="glass-panel rounded-2xl flex flex-col">
                            <div className="p-6 border-b border-glassborder flex justify-between items-center">
                                <h3 className="text-lg font-medium text-white">Recent Tourists</h3>
                            </div>
                            <div className="p-6">
                                {loading ? (
                                    <div className="text-center text-slate-500 py-8">Loading data...</div>
                                ) : (
                                    <div className="space-y-4">
                                        {tourists.map(t => (
                                            <div key={t.id} className="flex justify-between items-center p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                                                <div>
                                                    <div className="font-medium text-white">{t.name}</div>
                                                    <div className="text-sm text-slate-400">Passport: {t.passport}</div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${t.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                                                    {t.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (activeTab === 'tourists') {
            return <TouristManagement />;
        }

        if (activeTab === 'visas') {
            return <VisaManagement />;
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
                                    <option value="ROLE_ADMIN">System Admin (ROLE_ADMIN)</option>
                                    <option value="ROLE_IMMIGRATION">Immigration Officer (ROLE_IMMIGRATION)</option>
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
            return (
                <div className="max-w-2xl mx-auto">
                    <div className="glass-panel rounded-2xl p-8">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Briefcase className="text-indigo-400" /> Register Travel Agency
                        </h2>
                        {registerStatus && <div className="mb-6 p-4 bg-indigo-500/10 text-indigo-400 rounded-xl text-sm font-medium border border-indigo-500/20">{registerStatus}</div>}
                        
                        <form onSubmit={handleRegisterAgency} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Agency Name</label>
                                <input type="text" required value={agencyForm.name} onChange={e => setAgencyForm({...agencyForm, name: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Lanka Tours Pvt Ltd" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">License Number</label>
                                <input type="text" required value={agencyForm.license} onChange={e => setAgencyForm({...agencyForm, license: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="SLTBA-12345" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Contact Email (Login ID)</label>
                                <input type="email" required value={agencyForm.email} onChange={e => setAgencyForm({...agencyForm, email: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="contact@lankatours.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Account Password</label>
                                <input type="password" required value={agencyForm.password} onChange={e => setAgencyForm({...agencyForm, password: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" />
                            </div>
                            <button type="submit" disabled={isRegistering} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all flex justify-center items-center gap-2">
                                {isRegistering ? 'Registering...' : <><Plus size={18} /> Register Agency Profile & Account</>}
                            </button>
                        </form>
                    </div>
                </div>
            );
        }

        if (activeTab === 'hotels') {
            return (
                <div className="max-w-2xl mx-auto">
                    <div className="glass-panel rounded-2xl p-8">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Building2 className="text-amber-400" /> Register Hotel
                        </h2>
                        {registerStatus && <div className="mb-6 p-4 bg-amber-500/10 text-amber-400 rounded-xl text-sm font-medium border border-amber-500/20">{registerStatus}</div>}
                        
                        <form onSubmit={handleRegisterHotel} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Hotel Name</label>
                                <input type="text" required value={hotelForm.name} onChange={e => setHotelForm({...hotelForm, name: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Grand Palace Hotel" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Registration ID</label>
                                <input type="text" required value={hotelForm.registrationId} onChange={e => setHotelForm({...hotelForm, registrationId: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500 outline-none" placeholder="HTL-9988" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">District</label>
                                <input type="text" required value={hotelForm.district} onChange={e => setHotelForm({...hotelForm, district: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Colombo" />
                            </div>
                            <button type="submit" className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition-all flex justify-center items-center gap-2">
                                <Plus size={18} /> Register Hotel Profile
                            </button>
                        </form>
                    </div>
                </div>
            );
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
                        {activeTab === 'overview' ? 'System Overview' : `Manage ${activeTab}`}
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
