"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface GeoZone {
  id: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  label: string;
  message: string;
  type: "enigme" | "popup" | "photo" | "bonus";
}

export interface GeofenceEvent {
  zone: GeoZone;
  distance: number;
}

/** Haversine distance in meters between two GPS points */
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Détecte si la position est probablement spoofée (précision trop bonne ou vitesse impossible) */
function isSpoofed(pos: GeolocationPosition): boolean {
  // Si l'accuracy est trop faible (< 1m), c'est suspect sur mobile
  if (pos.coords.accuracy < 1) return true;
  // Si la vitesse dépasse 60 m/s (~216 km/h) c'est impossible à pied
  if (pos.coords.speed !== null && pos.coords.speed > 60) return true;
  return false;
}

export function useGeofencing(zones: GeoZone[], radiusOverride?: number) {
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [activeEvent, setActiveEvent] = useState<GeofenceEvent | null>(null);
  const [spoofDetected, setSpoofDetected] = useState(false);
  const triggeredIds = useRef<Set<string>>(new Set());
  const watchId = useRef<number | null>(null);

  const dismissEvent = useCallback(() => setActiveEvent(null), []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (isSpoofed(pos)) {
          setSpoofDetected(true);
          return;
        }
        setSpoofDetected(false);
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPos(loc);

        // Vérifie chaque zone
        for (const zone of zones) {
          const dist = haversine(loc.lat, loc.lng, zone.lat, zone.lng);
          const radius = radiusOverride ?? zone.radiusMeters;
          if (dist <= radius && !triggeredIds.current.has(zone.id)) {
            triggeredIds.current.add(zone.id);
            setActiveEvent({ zone, distance: Math.round(dist) });
            break; // Un pop-up à la fois
          }
        }
      },
      (err) => console.warn("[Geofencing]", err.message),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [zones, radiusOverride]);

  return { userPos, activeEvent, dismissEvent, spoofDetected };
}
