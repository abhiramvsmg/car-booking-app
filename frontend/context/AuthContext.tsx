'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import fetcher from '@/lib/axios';

interface User {
    id: number;
    email: string;
    full_name: string;
    role: 'rider' | 'driver' | 'admin';
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchUser = async () => {
        try {
            const { data } = await fetcher.get('/auth/me');
            setUser(data);
        } catch (error) {
            localStorage.removeItem('token');
            setUser(null);
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const PLATINUM_VERSION = '1.2.0-auth-enforced';
        const lastSeenVersion = localStorage.getItem('app_version');
        const token = localStorage.getItem('token');
        const path = window.location.pathname;
        const publicRoutes = ['/login', '/register'];
        const isPublic = publicRoutes.includes(path);

        if (lastSeenVersion !== PLATINUM_VERSION) {
            console.log('Update detected: Forcing re-authentication for the new version.');
            localStorage.removeItem('token');
            localStorage.setItem('app_version', PLATINUM_VERSION);
            setLoading(false);
            setUser(null);
            router.push('/login');
            return;
        }

        if (token) {
            fetchUser();
        } else {
            setLoading(false);
            if (!isPublic && path !== '/') {
                router.push('/login');
            }
        }
    }, [router]);

    const login = async (token: string) => {
        localStorage.setItem('token', token);
        await fetchUser();
        router.push('/');
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
