import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, Trash2, CheckCircle, RefreshCcw, Eye, X } from 'lucide-react';
import { AlertAPI } from '../api/alert.api';
import { TouristAPI } from '../api/tourist.api';
import { VisaAPI } from '../api/visa.api';

interface Alert {
    alertId: number;
    touristId: number;
    alertType: string;
    status: string;
    message?: string;
    createdAt?: string;
}

interface Tourist {
    touristId: number;
    firstName: string;
    lastName: string;
    nationality: string;
    dateOfBirth: string;
    gender: string;
}

interface Visa {
    visaId: number;
    visaType: string;
    issueDate: string;
    expiryDate: string;
    status: string;
}

const AlertManagement: React.FC = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [tourists, setTourists] = useState<Record<number, Tourist>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal state
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [modalTourist, setModalTourist] = useState<Tourist | null>(null);
    const [modalVisas, setModalVisas] = useState<Visa[]>([]);
    const [modalLoading, setModalLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            // Fetch alerts and tourists in parallel
            const [alertsData, touristsData] = await Promise.all([
                AlertAPI.getAllAlerts(0, 50),
                TouristAPI.getAllTourists()
            ]);
            
            const alertsContent = alertsData.content ? alertsData.content : alertsData;
            setAlerts(alertsContent);

            // Create tourist map
            const tMap: Record<number, Tourist> = {};
            if (Array.isArray(touristsData)) {
                touristsData.forEach((t: Tourist) => {
                    tMap[t.touristId] = t;
                });
            } else if (touristsData.content) {
                touristsData.content.forEach((t: Tourist) => {
                    tMap[t.touristId] = t;
                });
            }
            setTourists(tMap);

        } catch (err: any) {
            console.error("Failed to fetch data", err);
            setError('Failed to fetch system data. Are the microservices running?');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to dismiss this alert?')) return;
        
        try {
            await AlertAPI.deleteAlert(id);
            setAlerts(alerts.filter(a => a.alertId !== id));
        } catch (err) {
            alert('Failed to dismiss alert.');
        }
    };

    const handleViewDetails = async (alert: Alert) => {
        setSelectedAlert(alert);
        setModalLoading(true);
        try {
            setModalTourist(tourists[alert.touristId] || null);
            const visaData = await VisaAPI.searchByTouristId(alert.touristId);
            setModalVisas(visaData.content ? visaData.content : visaData);
        } catch (err) {
            console.error("Failed to fetch details", err);
        } finally {
            setModalLoading(false);
        }
    };

    const getStatusIcon = (type: string) => {
        switch (type?.toUpperCase()) {
            case 'EXPIRY':
                return <Clock className="text-amber-400" size={20} />;
            case 'VIOLATION':
                return <AlertTriangle className="text-red-400" size={20} />;
            case 'RESOLVED':
                return <CheckCircle className="text-emerald-400" size={20} />;
            default:
                return <AlertTriangle className="text-blue-400" size={20} />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center glass-panel p-6 rounded-2xl">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="text-rose-400" /> System Alerts
                    </h2>
                    <p className="text-slate-400 mt-1">Monitor automated warnings and violations across the system.</p>
                </div>
                <button 
                    onClick={fetchData}
                    disabled={loading}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                    <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} /> 
                    Refresh
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                    {error}
                </div>
            )}

            <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/50 text-slate-400 text-sm border-b border-glassborder">
                                <th className="p-4 font-medium">Type</th>
                                <th className="p-4 font-medium">Tourist Name</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glassborder text-slate-300">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        Loading alerts...
                                    </td>
                                </tr>
                            ) : alerts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        No active alerts found in the system. Everything is looking good!
                                    </td>
                                </tr>
                            ) : (
                                alerts.map((alert) => (
                                    <tr key={alert.alertId} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-800/50 rounded-lg">
                                                    {getStatusIcon(alert.alertType)}
                                                </div>
                                                <span className="font-medium text-white">{alert.alertType || 'UNKNOWN'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-white">
                                            {tourists[alert.touristId] 
                                                ? `${tourists[alert.touristId].firstName} ${tourists[alert.touristId].lastName}`
                                                : `Tourist #${alert.touristId}`}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                alert.status === 'ACTIVE' 
                                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            }`}>
                                                {alert.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-400">
                                            {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : 'Just now'}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleViewDetails(alert)}
                                                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(alert.alertId)}
                                                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                                                    title="Dismiss Alert"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Overlay */}
            {selectedAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="glass-panel w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-glassborder animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-glassborder flex justify-between items-center bg-slate-900/50">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <AlertTriangle className="text-amber-400" />
                                Alert Details
                            </h3>
                            <button 
                                onClick={() => setSelectedAlert(null)}
                                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {modalLoading ? (
                                <div className="text-center text-slate-400 py-8 animate-pulse">Loading data...</div>
                            ) : (
                                <>
                                    {/* Tourist Data Section */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Tourist Information</h4>
                                        {modalTourist ? (
                                            <div className="grid grid-cols-2 gap-4 bg-slate-900/40 p-4 rounded-xl border border-glassborder">
                                                <div>
                                                    <p className="text-xs text-slate-500">Full Name</p>
                                                    <p className="font-medium text-white">{modalTourist.firstName} {modalTourist.lastName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Tourist ID</p>
                                                    <p className="font-medium text-white">#{modalTourist.touristId}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Nationality</p>
                                                    <p className="font-medium text-white">{modalTourist.nationality}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Gender</p>
                                                    <p className="font-medium text-white">{modalTourist.gender}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-slate-900/40 rounded-xl text-slate-400">Tourist data not found.</div>
                                        )}
                                    </div>

                                    {/* Visa Data Section */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Visa History</h4>
                                        {modalVisas.length > 0 ? (
                                            <div className="space-y-3">
                                                {modalVisas.map(visa => (
                                                    <div key={visa.visaId} className="flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-glassborder">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-medium text-white">{visa.visaType} Visa</span>
                                                                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">#{visa.visaId}</span>
                                                            </div>
                                                            <p className="text-sm text-slate-400">Issued: {visa.issueDate} &rarr; Expires: {visa.expiryDate}</p>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                            visa.status === 'Active' 
                                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                                        }`}>
                                                            {visa.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-slate-900/40 rounded-xl text-slate-400">No visa records found for this tourist.</div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlertManagement;
