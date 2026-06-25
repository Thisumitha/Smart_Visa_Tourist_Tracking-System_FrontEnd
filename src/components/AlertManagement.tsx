import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, Trash2, CheckCircle, RefreshCcw } from 'lucide-react';
import { AlertAPI } from '../api/alert.api';

interface Alert {
    alertId: number;
    touristId: number;
    alertType: string;
    status: string;
    message?: string;
    createdAt?: string;
}

const AlertManagement: React.FC = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAlerts = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await AlertAPI.getAllAlerts(0, 50);
            // Assuming data is a Spring Page, use data.content. If it's a list, use data.
            const content = data.content ? data.content : data;
            setAlerts(content);
        } catch (err: any) {
            console.error("Failed to fetch alerts", err);
            setError('Failed to fetch system alerts. Are the microservices running?');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
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
                    onClick={fetchAlerts}
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
                                <th className="p-4 font-medium">Tourist ID</th>
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
                                        <td className="p-4 font-mono text-blue-400">#{alert.touristId}</td>
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
                                            <button 
                                                onClick={() => handleDelete(alert.alertId)}
                                                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                                                title="Dismiss Alert"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AlertManagement;
