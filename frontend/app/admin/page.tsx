'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Users,
    Car,
    TrendingUp,
    ShieldCheck,
    Activity,
    DollarSign,
    ChevronLeft,
    RefreshCcw,
    CheckCircle2,
    AlertCircle,
    Tag,
    Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import fetcher from '@/lib/axios';

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const { data } = await fetcher.get('/admin/stats');
            setStats(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch admin stats:', err);
            setError('Access Denied or System Offline');
        } finally {
            setLoading(false);
        }
    };

    const seedPromos = async () => {
        try {
            await fetcher.post('/finance/promos/seed');
            alert('Promos seeded successfully!');
        } catch (err) {
            console.error('Failed to seed promos:', err);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const cards = [
        { label: 'Total Rides', value: stats?.total_rides || '0', icon: Car, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Platform Revenue', value: `$${stats?.revenue || '0.00'}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { label: 'Active Drivers', value: stats?.active_drivers || '0', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { label: 'Growth Rate', value: stats?.growth_rate || '12.5%', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500 font-sans">
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Admin Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-slate-900">
                                <ShieldCheck size={24} />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight uppercase">Platform Admin</h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-bold tracking-[0.2em] uppercase text-[10px]">Real-time system monitoring & management</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchStats}
                            className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center gap-2 group"
                        >
                            <RefreshCcw size={18} className={`text-slate-600 dark:text-slate-400 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Refresh Data</span>
                        </button>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-900/10 dark:shadow-white/5 transition-all hover:scale-105 active:scale-95"
                        >
                            Exit Console
                        </button>
                    </div>
                </div>

                {error ? (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-8 rounded-3xl flex flex-col items-center text-center">
                        <AlertCircle size={48} className="text-red-600 dark:text-red-400 mb-4" />
                        <h2 className="text-xl font-black mb-2 uppercase tracking-tight text-red-700 dark:text-red-400">{error}</h2>
                        <p className="text-sm text-red-600/70 dark:text-red-400/70 font-bold mb-6 max-w-md">The admin console is restricted to platform operators. Please ensure you have the correct administrative credentials.</p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-red-600 dark:text-red-400 underline underline-offset-4"
                        >
                            <ChevronLeft size={16} /> Return to Dashboard
                        </button>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {cards.map((card, i) => (
                                <div key={i} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] transition-all hover:scale-105 hover:shadow-2xl dark:hover:shadow-white/5">
                                    <div className={`${card.bg} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}>
                                        <card.icon size={24} className={card.color} />
                                    </div>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{card.label}</p>
                                    <p className="text-3xl font-black tracking-tighter">{loading ? '---' : card.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity Table */}
                        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
                                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                    <Activity size={20} className="text-blue-600" />
                                    System Activity
                                </h2>
                                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800/50 text-[10px] font-black uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    Live Monitoring
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="grid gap-6">
                                    <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 group transition-all hover:bg-white dark:hover:bg-slate-900">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
                                                <BarChart3 size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">Last 24 Hours</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total ride volume</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black">{stats?.recent_activity || '0'}</p>
                                            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">+4.2% increased</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 opacity-50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600">
                                                <Users size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">Driver Verification</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">3 pending approvals</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">View All</button>
                                    </div>

                                    <div className="flex items-center justify-between p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-800/50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-blue-600">
                                                <Tag size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">Promo Management</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic text-blue-600">Active Campaign: ELITE20</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={seedPromos}
                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                                        >
                                            Reset Promos
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Footer */}
                        <div className="flex items-center justify-center gap-2 py-8 text-slate-400 dark:text-slate-600">
                            <ShieldCheck size={14} />
                            <p className="text-[10px] font-black uppercase tracking-[4px]">Platinum Security Protocol Active</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
