import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Activity, Globe, UserPlus, Briefcase, Building2, LogOut, FileText, Bell } from 'lucide-react';

interface AdminSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        navigate('/login');
    };

    const navItems = [
        { id: 'overview', label: 'System Overview', icon: <Activity size={20} />, activeColor: 'bg-blue-600/20 text-blue-400 border-blue-500/30' },
        { id: 'tourists', label: 'Manage Tourists', icon: <Globe size={20} />, activeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
        { id: 'visas', label: 'Manage Visas', icon: <FileText size={20} />, activeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
        { id: 'alerts', label: 'System Alerts', icon: <Bell size={20} />, activeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
        { id: 'users', label: 'System Users', icon: <UserPlus size={20} />, activeColor: 'bg-blue-600/20 text-blue-400 border-blue-500/30' },
        { id: 'agencies', label: 'Agencies', icon: <Briefcase size={20} />, activeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
        { id: 'hotels', label: 'Hotels', icon: <Building2 size={20} />, activeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30' }
    ];

    return (
        <aside className="w-64 glass-panel border-y-0 border-l-0 rounded-none flex flex-col hidden md:flex">
            <div className="p-6 border-b border-glassborder flex items-center gap-3">
                <ShieldCheck className="text-blue-500" size={28} />
                <span className="font-bold text-lg tracking-wide text-white">SmartVisa Admin</span>
            </div>
            
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map(item => (
                    <button 
                        key={item.id}
                        onClick={() => onTabChange(item.id)} 
                        className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            activeTab === item.id 
                                ? `${item.activeColor} border` 
                                : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'
                        }`}
                    >
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>
            
            <div className="p-4 border-t border-glassborder">
                <button onClick={handleLogout} className="flex items-center w-full gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                    <LogOut size={20} />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
