'use client';

import React, { useMemo, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';
import { useTheme } from '@/context/ThemeContext';

const containerStyle = {
  width: '100%',
  height: '100%'
};

interface MapProps {
    center: [number, number];
    pickup?: { lat: number; lng: number } | null;
    drop?: { lat: number; lng: number } | null;
    driverPos?: { lat: number; lng: number } | null;
    nearbyDrivers?: { id: number; lat: number; lng: number }[];
    route?: [number, number][] | null;
}

const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    styles: [
        {
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [{ "saturation": 36 }, { "color": "#333333" }, { "lightness": 40 }]
        }
        // ... add dark mode styles if needed
    ]
};

const darkMapStyles = [
    { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
    { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
    { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] },
    { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
    { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
    { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] },
    { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] },
    { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] },
    { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] },
    { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }
];

export default function VibrantGoogleMap({ center, pickup, drop, driverPos, nearbyDrivers, route }: MapProps) {
  const { theme } = useTheme();
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  });

  const mapCenter = useMemo(() => ({
    lat: center[0] || 40.7128,
    lng: center[1] || -74.0060
  }), [center]);

  const onUnmount = useCallback(function callback(map: any) {
    // Clean up if needed
  }, []);

  if (!isLoaded) return <div className="h-full w-full bg-slate-900 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">Initializing Vibrant Engine...</div>;

  const polylineCoords = route ? route.map(c => ({ lat: c[0], lng: c[1] })) : [];

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={14}
      onUnmount={onUnmount}
      options={{
          ...mapOptions,
          styles: theme === 'dark' ? darkMapStyles : []
      }}
    >
      {pickup && (
        <Marker
          position={{ lat: pickup.lat, lng: pickup.lng }}
          icon={{
            url: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            scaledSize: new google.maps.Size(40, 40)
          }}
        />
      )}

      {drop && (
        <Marker
          position={{ lat: drop.lat, lng: drop.lng }}
          icon={{
            url: 'https://cdn-icons-png.flaticon.com/512/149/149060.png',
            scaledSize: new google.maps.Size(40, 40)
          }}
        />
      )}

      {nearbyDrivers?.map((d) => (
        <Marker
          key={d.id}
          position={{ lat: d.lat, lng: d.lng }}
          icon={{
            url: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png',
            scaledSize: new google.maps.Size(30, 30)
          }}
        />
      ))}

      {driverPos && (
        <Marker
          position={{ lat: driverPos.lat, lng: driverPos.lng }}
          icon={{
            url: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png',
            scaledSize: new google.maps.Size(50, 50)
          }}
        />
      )}

      {polylineCoords.length > 0 && (
        <Polyline
          path={polylineCoords}
          options={{
            strokeColor: '#FF7A00',
            strokeOpacity: 0.8,
            strokeWeight: 6,
          }}
        />
      )}
    </GoogleMap>
  );
}
