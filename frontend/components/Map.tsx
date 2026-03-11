'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useTheme } from '@/context/ThemeContext';

// Fix for default marker icons
const pickupIcon = typeof window !== 'undefined' ? new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Orange Pin
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    className: 'pickup-marker filter-orange'
}) : undefined;

const dropIcon = typeof window !== 'undefined' ? new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149060.png', 
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    className: 'drop-marker saturate-200'
}) : undefined;

const carIcon = typeof window !== 'undefined' ? new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png', // Sleek car top-down
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    className: 'map-car-icon opacity-80'
}) : undefined;

const assignedCarIcon = typeof window !== 'undefined' ? new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png',
    iconSize: [55, 55],
    iconAnchor: [27, 27],
    className: 'assigned-driver-marker brightness-110 contrast-125 drop-shadow-[0_0_15px_rgba(255,122,0,0.8)]'
}) : undefined;

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (map && center && center[0] !== undefined && center[1] !== undefined) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

interface MapProps {
    center: [number, number];
    pickup?: { lat: number; lng: number } | null;
    drop?: { lat: number; lng: number } | null;
    driverPos?: { lat: number; lng: number } | null;
    nearbyDrivers?: { id: number; lat: number; lng: number }[];
    route?: [number, number][] | null;
    onMapClick?: (lat: number, lng: number) => void;
}

export default function Map({ center, pickup, drop, driverPos, nearbyDrivers, route, onMapClick }: MapProps) {
    const { theme } = useTheme();

    return (
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                url={theme === 'dark'
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                }
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            <MapUpdater center={center} />
            {onMapClick && <MapEvents onMapClick={onMapClick} />}

            {pickup && (
                <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
                </Marker>
            )}

            {drop && (
                <Marker position={[drop.lat, drop.lng]} icon={dropIcon} />
            )}

            {/* Nearby Drivers - simplified and robust */}
            {nearbyDrivers?.map((d) => (
                d.lat && d.lng && (
                    <Marker key={d.id} position={[d.lat, d.lng]} icon={carIcon} />
                )
            ))}

            {driverPos && (
                <Marker position={[driverPos.lat, driverPos.lng]} icon={assignedCarIcon} />
            )}

            {route && route.length > 0 && (
                <Polyline 
                    positions={route} 
                    color="#FF7A00" 
                    weight={5} 
                    opacity={0.8}
                    lineCap="round"
                    dashArray="10, 10"
                />
            )}
        </MapContainer>
    );
}
