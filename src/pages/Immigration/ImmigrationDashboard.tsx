import React from 'react';
import { ShieldCheck, UserPlus, FileText, Globe } from 'lucide-react';
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
import VisaDashboard from '../../components/Dashboard/VisaDashboard';
import { LayoutDashboard, History, Book } from 'lucide-react';

const immigrationNavItems = [
    {
        id: 'overview-group',
        label: 'Overview',
        icon: <LayoutDashboard size={15} />,
        children: [
            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={13} /> },
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



    const renderContent = () => {
        if (activeTab === 'wizard') return <RegistrationWizard />;
        if (activeTab === 'tourist-overview') return <TouristOverview />;
        if (activeTab === 'airport-duty') return <AirportDuty />;
        if (activeTab === 'travel-logs') return <TravelLogs />;
        if (activeTab === 'tourists') return <TouristManagement />;
        if (activeTab === 'passports') return <PassportManagement />;
        if (activeTab === 'visas') return <VisaManagement />;
        if (activeTab === 'extensions') return <VisaExtensionManagement />;

        // Default Dashboard
        return <VisaDashboard />;
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
