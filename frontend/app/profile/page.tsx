'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    User,
    Settings,
    Bell,
    Moon,
    Sun,
    Volume2,
    Shield,
    ChevronLeft,
    LogOut,
    Camera,
    CheckCircle2,
    Eye,
    Monitor,
    DollarSign,
    ShieldCheck,
    Zap,
    History
} from 'lucide-react';
import fetcher from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

type Tab = 'account' | 'appearance' | 'notifications' | 'admin';

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('account');
    const [notifications, setNotifications] = useState({
        rideUpdates: true,
        offers: false,
        sounds: true,
    });
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [topupAmount, setTopupAmount] = useState<string>('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        fetchWalletBalance();
    }, []);

    const fetchWalletBalance = async () => {
        try {
            const { data } = await fetcher.get('/finance/wallet');
            setWalletBalance(data.balance);
        } catch (err) {
            console.error('Error fetching wallet balance:', err);
        }
    };

    const handleTopup = async () => {
        const amount = parseFloat(topupAmount);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        setLoading(true);
        try {
            const { data } = await fetcher.post('/finance/wallet/topup', { amount });
            setWalletBalance(data.new_balance);
            setTopupAmount('');
            alert('Top-up successful! Platinum balance updated.');
        } catch (err) {
            alert('Payment failed. Please check your banking details.');
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { id: 'account', label: 'Account', icon: User },
        { id: 'appearance', label: 'Appearance', icon: Eye },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'admin', label: 'Admin', icon: Shield },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500 font-sans">
            {/* Premium Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-600/5 dark:bg-blue-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-600/5 dark:bg-purple-500/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="relative max-w-4xl mx-auto px-6 py-12">
                {/* Header Navigation */}
                <div className="flex items-center justify-between mb-12">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 group transition-all"
                    >
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-white dark:group-hover:bg-slate-800">
                            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">Back to Maps</span>
                    </button>

                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-black uppercase tracking-widest text-[10px] border border-red-100 dark:border-red-900/30 transition-all hover:scale-105 active:scale-95"
                    >
                        <LogOut size={14} />
                        Logout
                    </button>
                </div>

                {/* Profile Overview Card */}
                <div className="mb-12 flex flex-col md:flex-row items-center gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-blue-600 to-blue-400 shadow-2xl shadow-blue-500/20 flex items-center justify-center text-white text-4xl font-black transform transition-transform group-hover:rotate-6">
                            {user?.full_name?.[0] || 'U'}
                        </div>
                        <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-xl transition-all hover:scale-110 active:scale-90">
                            <Camera size={18} />
                        </button>
                    </div>

                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                            <h1 className="text-4xl font-black tracking-tight">{user?.full_name || 'Platinum User'}</h1>
                            <CheckCircle2 size={24} className="text-blue-500" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-bold tracking-[0.2em] uppercase text-xs mb-4">{user?.role || 'Elite Rider'} Account</p>

                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-0.5">Total Rides</p>
                                <p className="text-lg font-black text-blue-600 dark:text-blue-400">42</p>
                            </div>
                            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-0.5">Rating</p>
                                <p className="text-lg font-black text-amber-500 flex items-center gap-1">4.98 <Shield size={14} /></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Section */}
                <div className="flex flex-col md:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    {/* Tabs Sidebar */}
                    <div className="md:w-64 flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id as Tab)}
                                className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all whitespace-nowrap ${activeTab === cat.id
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xl shadow-slate-900/10 dark:shadow-white/5 translate-x-2'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
                                    }`}
                            >
                                <cat.icon size={20} />
                                <span className="font-bold uppercase tracking-widest text-[11px]">{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 min-h-[400px]">
                        {activeTab === 'account' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div>
                                    <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Account Details</h2>
                                    <div className="grid gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-500">Full Name</label>
                                            <div className="px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold">
                                                {user?.full_name}
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-500">Email Address</label>
                                            <div className="px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold">
                                                {user?.email}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[3px] rounded-2xl shadow-lg shadow-blue-600/20 transition-all mb-8">
                                    Update Profile
                                </button>

                                {/* Platinum Wallet Section */}
                                <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
                                                <DollarSign size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black uppercase tracking-tight">Platinum Wallet</h3>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Safe & Secure Credits</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-black tracking-tighter text-blue-600">${walletBalance.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <div className="relative flex-1">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                    <DollarSign size={16} />
                                                </div>
                                                <input
                                                    type="number"
                                                    placeholder="Top-up Amount"
                                                    value={topupAmount}
                                                    onChange={(e) => setTopupAmount(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                                />
                                            </div>
                                            <button
                                                onClick={handleTopup}
                                                disabled={loading}
                                                className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                            >
                                                {loading ? '...' : 'Top Up'}
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                                            <ShieldCheck size={12} className="text-emerald-500" />
                                            Tier-1 Stripe Encrypted Connection
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div>
                                    <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Interface Design</h2>
                                    <div className="grid gap-4">
                                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex items-center justify-between group transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                    {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">Theme Mode</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{theme === 'dark' ? 'Platinum Dark' : 'Bright Luxe'}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={toggleTheme}
                                                className={`w-14 h-8 rounded-full transition-all relative ${theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'}`}
                                            >
                                                <div className={`absolute top-1 bottom-1 w-6 bg-white rounded-full transition-all ${theme === 'dark' ? 'left-7' : 'left-1'}`}></div>
                                            </button>
                                        </div>

                                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex items-center justify-between opacity-50 cursor-not-allowed">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400">
                                                    <Monitor size={24} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">System Sync</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Coming soon</p>
                                                </div>
                                            </div>
                                            <div className="w-14 h-8 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div>
                                    <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Signal Preferences</h2>
                                    <div className="grid gap-4">
                                        {[
                                            { id: 'rideUpdates', label: 'Ride Status Updates', sub: 'Real-time booking alerts', icon: Bell },
                                            { id: 'sounds', label: 'Sound Alerts', sub: 'Audible connection signals', icon: Volume2 },
                                            { id: 'offers', label: 'Promotion News', sub: 'Exclusive elite offers', icon: Shield },
                                        ].map((item) => (
                                            <div key={item.id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex items-center justify-between transition-all hover:bg-white dark:hover:bg-slate-900">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                        <item.icon size={22} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm tracking-tight">{item.label}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.sub}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                                                    className={`w-14 h-8 rounded-full transition-all relative ${notifications[item.id as keyof typeof notifications] ? 'bg-blue-600' : 'bg-slate-300'}`}
                                                >
                                                    <div className={`absolute top-1 bottom-1 w-6 bg-white rounded-full transition-all ${notifications[item.id as keyof typeof notifications] ? 'left-7' : 'left-1'}`}></div>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'admin' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col items-center justify-center text-center py-12">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-900 dark:text-white">
                                    <Shield size={40} />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Platform Console</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Access restricted to platform operators</p>
                                <button
                                    onClick={() => router.push('/admin')}
                                    className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl transition-all hover:scale-105 active:scale-95"
                                >
                                    Launch Admin Console
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <p className="mt-12 text-center text-[10px] font-black uppercase tracking-[4px] text-slate-400 dark:text-slate-600">Platinum Edition • Version 1.1.0</p>
            </div>
        </div>
    );
}
