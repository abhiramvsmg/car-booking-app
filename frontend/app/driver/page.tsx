'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { Car, MapPin, User, CheckCircle, XCircle, Bell, RefreshCw, Navigation, Loader2 } from 'lucide-react';
import fetcher from '@/lib/axios';
import { socket, connectSocket } from '@/lib/socket';
import 'leaflet/dist/leaflet.css';

// Dynamic import for the Map component to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-900 flex items-center justify-center text-slate-500">Loading Map...</div>
});

export default function DriverDashboard() {
    const { user } = useAuth();
    const [rides, setRides] = useState<any[]>([]);
    const [online, setOnline] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentPos, setCurrentPos] = useState<{ lat: number, lng: number } | null>(null);
    const [currentRideId, setCurrentRideId] = useState<number | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            connectSocket(token);
        }

        socket.on('new_ride_request', (ride) => {
            setRides(prev => [ride, ...prev]);
            new Audio('/notification.mp3').play().catch(() => { });
        });

        if (user?.role === 'driver') {
            socket.emit('join_driver_room', { driver_id: user.id });
        }

        return () => {
            socket.off('new_ride_request');
        };
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (online) {
            interval = setInterval(async () => {
                if ('geolocation' in navigator) {
                    navigator.geolocation.getCurrentPosition(async (pos) => {
                        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                        setCurrentPos(coords);
                        try {
                            await fetcher.post(`/drivers/location?lat=${coords.lat}&lng=${coords.lng}`);
                            if (currentRideId) {
                                socket.emit('update_location', {
                                    lat: coords.lat,
                                    lng: coords.lng,
                                    ride_id: currentRideId
                                });
                            }
                        } catch (err) {
                            console.error('Failed to update location', err);
                        }
                    });
                }
            }, 10000);
        }
        return () => clearInterval(interval);
    }, [online, currentRideId]);

    const toggleStatus = async () => {
        setLoading(true);
        try {
            const newStatus = !online ? 'online' : 'offline';
            await fetcher.post(`/drivers/status?status=${newStatus}`);
            setOnline(!online);
        } catch (err) {
            console.error('Failed to update status', err);
        } finally {
            setLoading(false);
        }
    };

    const acceptRide = async (rideId: number) => {
        setLoading(true);
        try {
            await fetcher.patch(`/rides/${rideId}/accept`);
            setRides(prev => prev.filter(r => r.ride_id !== rideId));
            setCurrentRideId(rideId);
            alert('Ride accepted! Navigate to pickup.');
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.detail || 'Failed to accept ride');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
            <header className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-10 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Car className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-bold text-white uppercase tracking-tight">Driver Hub</h1>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50">
                        <span className={`w-2.5 h-2.5 rounded-full ${online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></span>
                        <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">{online ? 'Online' : 'Offline'}</span>
                        <button
                            onClick={toggleStatus}
                            className={`ml-2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${online ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                                }`}
                        >
                            {online ? 'Go Offline' : 'Go Online'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    {!online ? (
                        <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl p-20 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-700">
                                <Car className="text-slate-600 w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">You are currently offline</h3>
                            <p className="text-slate-500 mb-8 max-w-sm">Go online to start receiving ride requests and earn money.</p>
                            <button
                                onClick={toggleStatus}
                                disabled={loading}
                                className="px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[2px] rounded-2xl shadow-xl shadow-emerald-600/20 transition-all transform active:scale-[0.98] flex items-center gap-3"
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
                                Go Online Now
                            </button>
                        </div>
                    ) : rides.length === 0 ? (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-20 flex flex-col items-center justify-center text-center animate-pulse">
                            <h3 className="text-xl font-bold text-slate-300 mb-2">Searching for rides...</h3>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {rides.map((ride, index) => (
                                <div key={index} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                                    <div className="flex-1 space-y-4">
                                        <h4 className="text-white font-bold text-lg">New Passenger Request</h4>
                                        <div className="space-y-2">
                                            <p className="text-sm text-slate-300">Pickup: {ride.pickup_address}</p>
                                            <p className="text-sm text-slate-300">Drop: {ride.drop_address}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <p className="text-3xl font-black text-white">${ride.fare_estimate}</p>
                                        <button
                                            onClick={() => acceptRide(ride.ride_id)}
                                            className="py-4 px-10 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl"
                                        >
                                            Accept
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-12">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <Navigation className="text-emerald-500" />
                            Live Coverage
                        </h2>
                        <div className="h-[400px] w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 relative z-0">
                            <Map
                                center={currentPos ? [currentPos.lat, currentPos.lng] : [40.7128, -74.0060]}
                                driverPos={currentPos}
                            />
                            {!online && (
                                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[1000]">
                                    <p className="text-slate-400 font-bold uppercase tracking-[4px] text-xs">Map Offline</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
