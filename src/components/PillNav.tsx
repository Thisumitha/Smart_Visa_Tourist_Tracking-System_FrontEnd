import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown, Sun, Moon } from 'lucide-react';

export interface PillNavSubItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
}

export interface PillNavItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    children?: PillNavSubItem[];
}

interface PillNavProps {
    logoIcon: React.ReactNode;
    logoLabel: string;
    navItems: PillNavItem[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    logoutPath?: string;
}

const PillNav: React.FC<PillNavProps> = ({
    logoIcon,
    logoLabel,
    navItems,
    activeTab,
    onTabChange,
    logoutPath = '/login',
}) => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    });
    
    const [brandOpen, setBrandOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    
    const brandRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (brandRef.current && !brandRef.current.contains(event.target as Node)) {
                setBrandOpen(false);
            }
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        navigate(logoutPath);
    };

    // Helper to determine if a parent category has the active sub-item
    const isCategoryActive = (item: PillNavItem) => {
        if (item.id === activeTab) return true;
        if (item.children) {
            return item.children.some(sub => sub.id === activeTab);
        }
        return false;
    };

    return (
        <header className="pill-nav-container">
            <nav className="pill-nav-bar relative" ref={navRef}>
                {/* Logo / Brand with Dropdown trigger */}
                <div className="relative" ref={brandRef}>
                    <button 
                        onClick={() => {
                            setBrandOpen(!brandOpen);
                            setActiveDropdown(null);
                        }}
                        className="pill-nav-logo flex items-center gap-1.5 hover:bg-slate-500/10 py-1.5 px-3 rounded-full transition-colors cursor-pointer border-none bg-transparent"
                    >
                        <span className="text-slate-500 dark:text-slate-400 flex items-center">{logoIcon}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs tracking-tight leading-none">
                            {logoLabel}
                        </span>
                        <ChevronDown size={11} className="text-slate-400 dark:text-slate-500 ml-1 flex-shrink-0" />
                    </button>

                    {/* Theme Dropdown */}
                    {brandOpen && (
                        <div className="absolute left-0 mt-2 w-36 glass-panel rounded-xl py-1 shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                            <button
                                onClick={() => {
                                    setTheme('light');
                                    setBrandOpen(false);
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium border-none bg-transparent cursor-pointer transition-colors ${
                                    theme === 'light' 
                                        ? 'text-blue-600 dark:text-blue-400 bg-slate-500/10' 
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-500/5'
                                }`}
                            >
                                <Sun size={14} />
                                <span>Light Mode</span>
                            </button>
                            <button
                                onClick={() => {
                                    setTheme('dark');
                                    setBrandOpen(false);
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium border-none bg-transparent cursor-pointer transition-colors ${
                                    theme === 'dark' 
                                        ? 'text-blue-600 dark:text-blue-400 bg-slate-500/10' 
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-500/5'
                                }`}
                            >
                                <Moon size={14} />
                                <span>Dark Mode</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Nav Items (Flat or Dropdowns) */}
                {navItems.map((item) => {
                    const hasChildren = item.children && item.children.length > 0;
                    const isActive = isCategoryActive(item);

                    if (hasChildren) {
                        const isOpen = activeDropdown === item.id;
                        return (
                            <div key={item.id} className="relative">
                                <button
                                    onClick={() => {
                                        setActiveDropdown(isOpen ? null : item.id);
                                        setBrandOpen(false);
                                    }}
                                    className={`pill-nav-item flex items-center gap-1 ${isActive ? 'active' : ''}`}
                                >
                                    <span className="opacity-75">{item.icon}</span>
                                    <span>{item.label}</span>
                                    <ChevronDown size={11} className="opacity-60 ml-0.5" />
                                </button>

                                {/* Dropdown Items */}
                                {isOpen && (
                                    <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-44 glass-panel rounded-xl py-1.5 shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                        {item.children!.map((sub) => (
                                            <button
                                                key={sub.id}
                                                onClick={() => {
                                                    onTabChange(sub.id);
                                                    setActiveDropdown(null);
                                                }}
                                                className={`w-full flex items-center gap-2 px-3.5 py-2 text-left text-xs font-medium border-none bg-transparent cursor-pointer transition-colors ${
                                                    activeTab === sub.id
                                                        ? 'text-blue-600 dark:text-blue-400 bg-slate-500/10'
                                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-500/5'
                                                }`}
                                            >
                                                {sub.icon && <span className="opacity-70">{sub.icon}</span>}
                                                <span>{sub.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    // Flat navigation item
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                onTabChange(item.id);
                                setActiveDropdown(null);
                                setBrandOpen(false);
                            }}
                            className={`pill-nav-item ${isActive ? 'active' : ''}`}
                            title={item.label}
                        >
                            <span className="opacity-75">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    );
                })}

                {/* Divider + Logout */}
                <div className="pill-nav-divider" />
                <button
                    onClick={handleLogout}
                    className="pill-nav-logout"
                    title="Sign Out"
                >
                    <LogOut size={14} />
                    <span className="hidden sm:inline">Sign Out</span>
                </button>
            </nav>
        </header>
    );
};

export default PillNav;
