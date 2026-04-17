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
export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
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
  if (pos.coords.accuracy < 1) return true;
  if (pos.coords.speed !== null && pos.coords.speed > 60) return true;
  return false;
}

/** Détecte une téléportation : saut > 300m en < 3s ou vitesse > 10 m/s (36 km/h) */
function isTeleporting(
  history: Array<{ lat: number; lng: number; ts: number }>,
  current: { lat: number; lng: number; ts: number }
): boolean {
  if (history.length === 0) return false;
  const prev = history[history.length - 1];
  const dt = (current.ts - prev.ts) / 1000;
  if (dt <= 0) return false;
  const dist = haversine(prev.lat, prev.lng, current.lat, current.lng);
  if (dist > 300 && dt < 3) return true;
  return dist / dt > 10;
}

/** Rayon adaptatif basé sur la précision GPS réelle (entre 20-50m ou 30-60m pour les bonus) */
function adaptiveRadius(base: number, accuracy: number): number {
  return base >= 30
    ? Math.max(30, Math.min(60, accuracy * 1.5))
    : Math.max(20, Math.min(50, accuracy * 1.5));
}

/** Vibration haptique à l'entrée d'une zone */
function triggerHaptic(): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate([100, 50, 100]);
  }
}

export function useGeofencing(zones: GeoZone[], radiusOverride?: number) {
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [activeEvent, setActiveEvent] = useState<GeofenceEvent | null>(null);
  const [spoofDetected, setSpoofDetected] = useState(false);
  const [spoofLevel, setSpoofLevel] = useState<0 | 1 | 2 | 3>(0);

  const triggeredIds = useRef<Set<string>>(new Set());
  const watchId = useRef<number | null>(null);
  const lastPositions = useRef<Array<{ lat: number; lng: number; ts: number }>>([]);
  const spoofCount = useRef(0);
  const spoofLevelRef = useRef<0 | 1 | 2 | 3>(0);

  const dismissEvent = useCallback(() => setActiveEvent(null), []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const current = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          ts: pos.timestamp,
        };

        const staticSpoof = isSpoofed(pos);
        const teleportSpoof = isTeleporting(lastPositions.current, current);

        if (staticSpoof || teleportSpoof) {
          spoofCount.current += 1;
          const level = (Math.min(spoofCount.current, 3) as 1 | 2 | 3);
          spoofLevelRef.current = level;
          setSpoofLevel(level);
          setSpoofDetected(true);
          return;
        }

        // Lecture propre — reset compteur
        spoofCount.current = 0;
        spoofLevelRef.current = 0;
        setSpoofLevel(0);
        setSpoofDetected(false);

        // Garder max 3 positions en historique
        lastPositions.current = [...lastPositions.current.slice(-2), current];

        const loc = { lat: current.lat, lng: current.lng };
        setUserPos(loc);

        for (const zone of zones) {
          const dist = haversine(loc.lat, loc.lng, zone.lat, zone.lng);
          const radius = radiusOverride ?? adaptiveRadius(zone.radiusMeters, pos.coords.accuracy);
          if (dist <= radius && !triggeredIds.current.has(zone.id)) {
            // Bloquer le déclenchement si spoof niveau 3
            if (spoofLevelRef.current >= 3) break;
            triggeredIds.current.add(zone.id);
            setActiveEvent({ zone, distance: Math.round(dist) });
            triggerHaptic();
            break;
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

  return { userPos, activeEvent, dismissEvent, spoofDetected, spoofLevel };
}
