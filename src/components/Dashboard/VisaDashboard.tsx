import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
    Users,
    LogIn,
    LogOut,
    AlertTriangle,
    Clock,
    Building2,
    RefreshCcw,
    TrendingUp,
    TrendingDown,
} from 'lucide-react';
import { TouristAPI, EntryAPI, ExitAPI } from '../../api/tourist.api';
import { VisaAPI } from '../../api/visa.api';

// ─── Register ChartJS modules ────────────────────────────────────────────────
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Tooltip,
    Legend,
    Filler,
);

// ─── Colour tokens (matching the project's glass-dark aesthetic) ──────────────
const BLUE   = '#378ADD';
const GREEN  = '#1D9E75';
const PURPLE = '#7F77DD';
const AMBER  = '#BA7517';
const RED    = '#E24B4A';

// ─── Shared Chart defaults ────────────────────────────────────────────────────
const GRID_COLOR  = 'rgba(255,255,255,0.06)';
const TICK_COLOR  = 'rgba(255,255,255,0.35)';
const TOOLTIP_BG  = '#1e293b';
const TOOLTIP_FG  = '#e2e8f0';

const sharedOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: TOOLTIP_BG,
            titleColor: '#fff',
            bodyColor: TOOLTIP_FG,
            borderColor: 'rgba(255,255,255,0.12)',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
        },
    },
};

// ─── Helper ───────────────────────────────────────────────────────────────────
const today = new Date();
const daysBetween = (a: Date, b: Date) =>
    Math.ceil((b.getTime() - a.getTime()) / 86_400_000);

function classifyVisa(visa: any): 'active' | 'expiring' | 'expired' | 'business' {
    if (!visa.expiryDate) return 'active';
    const exp = new Date(visa.expiryDate);
    const diff = daysBetween(today, exp);
    if (diff < 0) return 'expired';
    if (diff <= 7) return 'expiring';
    if (visa.visaType?.toLowerCase().includes('business')) return 'business';
    return 'active';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    color: string;          // tailwind bg + text pair key
}

const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    blue:   { bg: 'bg-blue-500/10',   text: 'text-blue-400',   iconBg: 'bg-blue-500/20' },
    green:  { bg: 'bg-emerald-500/10', text: 'text-emerald-400', iconBg: 'bg-emerald-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', iconBg: 'bg-purple-500/20' },
    red:    { bg: 'bg-red-500/10',    text: 'text-red-400',    iconBg: 'bg-red-500/20' },
    amber:  { bg: 'bg-amber-500/10',  text: 'text-amber-400',  iconBg: 'bg-amber-500/20' },
    teal:   { bg: 'bg-teal-500/10',   text: 'text-teal-400',   iconBg: 'bg-teal-500/20' },
};

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, change, trend, color }) => {
    const c = colorMap[color] ?? colorMap.blue;
    return (
        <div className={`glass-panel rounded-2xl p-5 flex flex-col gap-2 ${c.bg} border border-slate-700/40`}>
            <div className={`w-9 h-9 rounded-full ${c.iconBg} flex items-center justify-center ${c.text}`}>
                {icon}
            </div>
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wide mt-1">{label}</div>
            <div className={`text-2xl font-bold ${c.text}`}>{value}</div>
            {change && (
                <div className={`text-xs flex items-center gap-1 ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'}`}>
                    {trend === 'up' ? <TrendingUp size={11} /> : trend === 'down' ? <TrendingDown size={11} /> : null}
                    {change}
                </div>
            )}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const VisaDashboard: React.FC = () => {
    // ── state ──────────────────────────────────────────────────────────────
    const [loading, setLoading]     = useState(true);
    const [lastUpdated, setLast]    = useState(new Date());
    const intervalRef               = useRef<ReturnType<typeof setInterval> | null>(null);

    // raw data
    const [tourists,  setTourists]  = useState<any[]>([]);
    const [visas,     setVisas]     = useState<any[]>([]);
    const [entries,   setEntries]   = useState<any[]>([]);
    const [exits,     setExits]     = useState<any[]>([]);

    // ── fetch all data ──────────────────────────────────────────────────────
    const fetchAll = useCallback(async () => {
        try {
            const [touristsRes, visaRes, entryRes, exitRes] = await Promise.allSettled([
                TouristAPI.getAllTourists(),
                VisaAPI.getAllVisas(0, 500),
                EntryAPI.getAllEntryRecords(),
                ExitAPI.getAllExitRecords(),
            ]);

            if (touristsRes.status === 'fulfilled') setTourists(touristsRes.value as any[] ?? []);
            if (visaRes.status === 'fulfilled') {
                const v = visaRes.value as any;
                setVisas(Array.isArray(v) ? v : (v?.content ?? []));
            }
            if (entryRes.status === 'fulfilled') setEntries(entryRes.value as any[] ?? []);
            if (exitRes.status === 'fulfilled') setExits(exitRes.value as any[] ?? []);

            setLast(new Date());
        } catch (e) {
            console.error('Dashboard fetch error', e);
        } finally {
            setLoading(false);
        }
    }, []);

    // initial + auto-refresh every 30 s
    useEffect(() => {
        fetchAll();
        intervalRef.current = setInterval(fetchAll, 30_000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [fetchAll]);

    // ── derived stats ───────────────────────────────────────────────────────
    const totalTourists   = tourists.length;
    const totalEntries    = entries.length;
    const totalExits      = exits.length;
    const touristsInside  = Math.max(0, totalEntries - totalExits);

    // visa classification
    const visaStats = visas.reduce(
        (acc, v) => { acc[classifyVisa(v)]++; return acc; },
        { active: 0, expiring: 0, expired: 0, business: 0 }
    );

    // alerts: expired + expiring ≤7 days
    const alertVisas = visas
        .map(v => ({ ...v, _cls: classifyVisa(v), _diff: v.expiryDate ? daysBetween(today, new Date(v.expiryDate)) : null }))
        .filter(v => v._cls === 'expired' || v._cls === 'expiring')
        .sort((a, b) => (a._diff ?? -999) - (b._diff ?? -999))
        .slice(0, 8);

    // ── Entry vs Exit — last 6 months ───────────────────────────────────────
    const months6Labels: string[] = [];
    const monthsMap: Record<string, { e: number; x: number }> = {};
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleString('default', { month: 'short' });
        months6Labels.push(label);
        monthsMap[key] = { e: 0, x: 0 };
    }
    entries.forEach((r: any) => {
        const d = r.entryDate ?? r.createdAt ?? '';
        const key = d.slice(0, 7);
        if (monthsMap[key]) monthsMap[key].e++;
    });
    exits.forEach((r: any) => {
        const d = r.exitDate ?? r.createdAt ?? '';
        const key = d.slice(0, 7);
        if (monthsMap[key]) monthsMap[key].x++;
    });
    const barEntries = Object.values(monthsMap).map(m => m.e);
    const barExits   = Object.values(monthsMap).map(m => m.x);

    // ── 7-day expiry countdown ──────────────────────────────────────────────
    const expiryDayCounts: number[] = Array(8).fill(0);
    const expiryLabels = ['Today', 'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
    visas.forEach(v => {
        if (!v.expiryDate) return;
        const diff = daysBetween(today, new Date(v.expiryDate));
        if (diff >= 0 && diff <= 7) expiryDayCounts[diff]++;
    });

    // ── nationality breakdown ────────────────────────────────────────────────
    const natMap: Record<string, number> = {};
    tourists.forEach((t: any) => {
        const nat = t.nationality ?? 'Unknown';
        natMap[nat] = (natMap[nat] ?? 0) + 1;
    });
    const sortedNats = Object.entries(natMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const natLabels = sortedNats.map(n => n[0]);
    const natCounts = sortedNats.map(n => n[1]);

    // ── visa type split (donut) ──────────────────────────────────────────────
    const donutData   = [visaStats.active, visaStats.business, visaStats.expiring, visaStats.expired];
    const donutTotal  = donutData.reduce((a, b) => a + b, 0) || 1;

    // ─────────────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Loading dashboard data…</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-6">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <p className="text-slate-400 text-xs">
                    Live overview · Last updated {lastUpdated.toLocaleTimeString()}
                </p>
                <button
                    onClick={() => { setLoading(true); fetchAll(); }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-slate-300 rounded-xl text-sm transition-all"
                >
                    <RefreshCcw size={14} />
                    Refresh
                </button>
            </div>

            {/* ── Stat cards ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard label="tourists inside"  value={touristsInside.toLocaleString()} icon={<Users size={16}/>}         trend="up"      change="+live count"  color="blue" />
                <StatCard label="entries this month" value={totalEntries.toLocaleString()}  icon={<LogIn size={16}/>}          trend="up"      change="all time"     color="green" />
                <StatCard label="exits this month"  value={totalExits.toLocaleString()}    icon={<LogOut size={16}/>}         trend="neutral" change="all time"     color="purple" />
                <StatCard label="expired visas"     value={visaStats.expired}              icon={<AlertTriangle size={16}/>}  trend="down"    change="overstay alert" color="red" />
                <StatCard label="expiring ≤7 days"  value={visaStats.expiring}             icon={<Clock size={16}/>}          trend="neutral" change="send warnings" color="amber" />
                <StatCard label="registered"        value={totalTourists.toLocaleString()} icon={<Building2 size={16}/>}      trend="up"      change="total tourists" color="teal" />
            </div>

            {/* ── Entry vs Exit bar chart ──────────────────────────────────── */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-700/40">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white">Entry vs Exit — Last 6 Months</h3>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: BLUE }} />Entries
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: GREEN }} />Exits
                        </span>
                    </div>
                </div>
                <div style={{ height: 220 }}>
                    <Bar
                        data={{
                            labels: months6Labels,
                            datasets: [
                                { label: 'Entries', data: barEntries, backgroundColor: BLUE,  borderRadius: 5, barPercentage: 0.6 },
                                { label: 'Exits',   data: barExits,   backgroundColor: GREEN, borderRadius: 5, barPercentage: 0.6 },
                            ],
                        }}
                        options={{
                            ...sharedOptions,
                            scales: {
                                x: { grid: { display: false }, ticks: { color: TICK_COLOR, font: { size: 11 } } },
                                y: { grid: { color: GRID_COLOR }, ticks: { color: TICK_COLOR, font: { size: 11 } }, beginAtZero: true },
                            },
                        }}
                    />
                </div>
            </div>

            {/* ── Tourist Presence ─────────────────────────────────────────── */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-700/40">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                        Tourist Presence
                    </h3>
                    <span className="text-xs text-slate-400 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/50">
                        Live · auto-refreshes every 30 s
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">

                    {/* Presence donut */}
                    <div className="flex items-center gap-5">
                        <div style={{ width: 110, height: 110, flexShrink: 0, position: 'relative' }}>
                            <Doughnut
                                data={{
                                    labels: ['In Country', 'Exited'],
                                    datasets: [{
                                        data: [touristsInside, Math.max(0, totalExits)],
                                        backgroundColor: ['#22d3ee', '#334155'],
                                        borderWidth: 0,
                                        hoverOffset: 4,
                                    }],
                                }}
                                options={{ ...sharedOptions, cutout: '70%', layout: { padding: 4 } }}
                            />
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                                <span className="text-lg font-bold text-cyan-400">{touristsInside}</span>
                                <span className="text-[10px] text-slate-400">inside</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#22d3ee' }} />
                                <span className="text-slate-400 flex-1">In Country</span>
                                <span className="font-bold text-white">{touristsInside}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                                <span className="text-slate-400 flex-1">Exited</span>
                                <span className="font-bold text-white">{Math.max(0, totalExits)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                                <span className="text-slate-400 flex-1">Total Registered</span>
                                <span className="font-bold text-white">{totalTourists}</span>
                            </div>
                        </div>
                    </div>

                    {/* Presence ratio progress bar */}
                    <div className="md:col-span-2 flex flex-col gap-4">
                        {/* In-country ratio */}
                        <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                                <span>Presence Rate</span>
                                <span className="font-semibold text-cyan-400">
                                    {totalTourists > 0 ? Math.round((touristsInside / totalTourists) * 100) : 0}%
                                </span>
                            </div>
                            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${totalTourists > 0 ? (touristsInside / totalTourists) * 100 : 0}%`,
                                        background: 'linear-gradient(90deg, #0891b2, #22d3ee)',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Entry coverage */}
                        <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                                <span>Entry Coverage (of registered)</span>
                                <span className="font-semibold text-emerald-400">
                                    {totalTourists > 0 ? Math.round((totalEntries / totalTourists) * 100) : 0}%
                                </span>
                            </div>
                            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${totalTourists > 0 ? Math.min(100, (totalEntries / totalTourists) * 100) : 0}%`,
                                        background: 'linear-gradient(90deg, #059669, #34d399)',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Overstay risk */}
                        <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                                <span>Overstay / Expiry Risk</span>
                                <span className="font-semibold text-red-400">
                                    {visaStats.expired + visaStats.expiring}
                                </span>
                            </div>
                            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${totalTourists > 0 ? Math.min(100, ((visaStats.expired + visaStats.expiring) / Math.max(totalTourists, 1)) * 100) : 0}%`,
                                        background: 'linear-gradient(90deg, #b91c1c, #f87171)',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Row: Visa status donut + Nationality horizontal bar ──────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Visa status donut */}
                <div className="glass-panel rounded-2xl p-5 border border-slate-700/40">
                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
                        Visa Status Breakdown
                    </h3>
                    <div className="flex items-center gap-6">
                        <div style={{ width: 130, height: 130, flexShrink: 0, position: 'relative' }}>
                            <Doughnut
                                data={{
                                    labels: ['Tourist Active', 'Business', 'Expiring', 'Expired'],
                                    datasets: [{
                                        data: donutData,
                                        backgroundColor: [GREEN, BLUE, AMBER, RED],
                                        borderWidth: 0,
                                        hoverOffset: 4,
                                    }],
                                }}
                                options={{ ...sharedOptions, cutout: '72%', layout: { padding: 4 } }}
                            />
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                                <span className="text-lg font-bold text-white">{donutTotal}</span>
                                <span className="text-xs text-slate-400">total</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2.5 flex-1">
                            {[
                                { label: 'Tourist Active', value: visaStats.active,   color: GREEN },
                                { label: 'Business',       value: visaStats.business, color: BLUE },
                                { label: 'Expiring Soon',  value: visaStats.expiring, color: AMBER },
                                { label: 'Expired',        value: visaStats.expired,  color: RED },
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-2 text-xs">
                                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                                    <span className="text-slate-400 flex-1">{item.label}</span>
                                    <span className="font-semibold text-white">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Nationality horizontal bar */}
                <div className="glass-panel rounded-2xl p-5 border border-slate-700/40">
                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                        Top Nationalities
                    </h3>
                    {natLabels.length > 0 ? (
                        <div style={{ height: 160 }}>
                            <Bar
                                data={{
                                    labels: natLabels,
                                    datasets: [{
                                        label: 'Tourists',
                                        data: natCounts,
                                        backgroundColor: [BLUE, GREEN, PURPLE, AMBER, '#D4537E'],
                                        borderRadius: 5,
                                        barPercentage: 0.6,
                                    }],
                                }}
                                options={{
                                    ...sharedOptions,
                                    indexAxis: 'y' as const,
                                    scales: {
                                        x: { grid: { color: GRID_COLOR }, ticks: { color: TICK_COLOR, font: { size: 11 } }, beginAtZero: true },
                                        y: { grid: { display: false }, ticks: { color: TICK_COLOR, font: { size: 11 } } },
                                    },
                                }}
                            />
                        </div>
                    ) : (
                        <div className="text-slate-500 text-sm text-center py-8">No nationality data available.</div>
                    )}
                </div>
            </div>

            {/* ── Row: Visa alerts + 7-day expiry line ────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Visa alerts list */}
                <div className="glass-panel rounded-2xl p-5 border border-slate-700/40">
                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-red-400" />
                        Visa Alerts
                        <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold">
                            {alertVisas.length}
                        </span>
                    </h3>
                    {alertVisas.length === 0 ? (
                        <div className="text-slate-500 text-sm text-center py-6">✓ No active visa alerts</div>
                    ) : (
                        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                            {alertVisas.map((v: any) => {
                                const isExpired  = v._cls === 'expired';
                                const diffLabel  = v._diff === null ? '—'
                                    : v._diff < 0  ? `${Math.abs(v._diff)}d ago`
                                    : v._diff === 0 ? 'today'
                                    : `in ${v._diff}d`;
                                const rowStyle = isExpired
                                    ? 'bg-red-500/10 border-l-2 border-red-500 text-red-300'
                                    : 'bg-amber-500/10 border-l-2 border-amber-500 text-amber-300';
                                return (
                                    <div key={v.visaId ?? v.id} className={`flex items-center gap-3 px-3 py-2 rounded-r-xl text-xs ${rowStyle}`}>
                                        <span className="font-semibold min-w-[70px]">VID-{String(v.visaId ?? v.id).padStart(4, '0')}</span>
                                        <span className="flex-1 text-slate-300">
                                            {isExpired ? 'Expired' : 'Expires'} · {v.visaType ?? 'Tourist'}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isExpired ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                            {diffLabel}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 7-day expiry countdown line chart */}
                <div className="glass-panel rounded-2xl p-5 border border-slate-700/40">
                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                        <Clock size={14} className="text-amber-400" />
                        7-Day Visa Expiry Countdown
                    </h3>
                    <div style={{ height: 180 }}>
                        <Line
                            data={{
                                labels: expiryLabels,
                                datasets: [
                                    {
                                        label: 'Expiring',
                                        data: expiryDayCounts,
                                        borderColor: RED,
                                        backgroundColor: 'rgba(226,75,74,0.10)',
                                        fill: true,
                                        tension: 0.4,
                                        pointBackgroundColor: RED,
                                        pointRadius: 4,
                                        pointHoverRadius: 6,
                                    },
                                    {
                                        label: 'Threshold',
                                        data: Array(8).fill(5),
                                        borderColor: AMBER,
                                        borderDash: [5, 4],
                                        borderWidth: 1.5,
                                        pointRadius: 0,
                                        fill: false,
                                        tension: 0,
                                    },
                                ],
                            }}
                            options={{
                                ...sharedOptions,
                                plugins: {
                                    ...sharedOptions.plugins,
                                    legend: {
                                        display: true,
                                        labels: { color: TICK_COLOR, boxWidth: 10, font: { size: 11 } },
                                    },
                                },
                                scales: {
                                    x: { grid: { display: false }, ticks: { color: TICK_COLOR, font: { size: 11 } } },
                                    y: { grid: { color: GRID_COLOR }, ticks: { color: TICK_COLOR, font: { size: 11 } }, beginAtZero: true },
                                },
                            }}
                        />
                    </div>
                </div>
            </div>

        </div>
    );
};

export default VisaDashboard;
