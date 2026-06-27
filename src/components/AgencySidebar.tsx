import React from 'react';
import { LayoutDashboard, Globe, Compass, LogOut, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AgencySidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const AgencySidebar: React.FC<AgencySidebarProps> = ({ activeTab, onTabChange }) => {
    const navigate = useNavigate();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'tourist-overview', label: 'Tourist Overview', icon: <Globe size={20} /> },
        { id: 'travel-plans', label: 'Travel Plans', icon: <Map size={20} /> }
    ];

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        navigate('/login');
    };

    return (
        <aside className="w-64 glass-panel border-y-0 border-l-0 rounded-none flex flex-col h-screen sticky top-0">
            <div className="p-6 border-b border-glassborder">
                <div className="flex items-center gap-3">
                    <Compass className="text-indigo-500" size={28} />
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-wide">Agency</h1>
                        <p className="text-xs text-indigo-400 font-medium">Partner Portal</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                            activeTab === item.id 
                                ? 'bg-indigo-600 shadow-lg shadow-indigo-500/20 text-white' 
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                        }`}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="p-4 border-t border-glassborder">
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors font-medium"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default AgencySidebar;
