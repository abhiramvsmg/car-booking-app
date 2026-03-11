'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import fetcher from '@/lib/axios';
import Link from 'next/link';
import { LogIn, Mail, Lock, Car } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            const { data } = await fetcher.post('/auth/login', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            await login(data.access_token);
        } catch (err: any) {
            console.error('Login error details:', err);
            if (!err.response) {
                setError('Network error: Is the backend server running at http://localhost:8000?');
            } else {
                setError(err.response?.data?.detail || 'Failed to login');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4 text-slate-900 dark:text-white transition-colors duration-300">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-xl dark:shadow-2xl overflow-hidden p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 premium-gradient rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <Car className="text-white w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase font-heading">VibrantCabs</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-black uppercase tracking-widest text-[10px]">Your Elite Transport Awaits</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                required
                                className="block w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                required
                                className="block w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-primary hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98]"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <LogIn size={20} />
                                <span>Sign In</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        New to the platform?{' '}
                        <Link href="/register" className="text-primary hover:text-orange-600 font-black transition-colors underline underline-offset-4">
                            Join the Fleet
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
