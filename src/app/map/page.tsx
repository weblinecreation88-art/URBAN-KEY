"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

const MEKNES_CENTER = { lat: 33.8920, lng: -5.5540 };

// Vraies coordonnées GPS — Fiche de parcours officielle
const questSteps = [
  { id: "bab-mansour",      lat: 33.8953, lng: -5.5524, title: "Bab Mansour",                        order: 1, status: "active" as const },
  { id: "lalla-aouda",      lat: 33.8945, lng: -5.5510, title: "Place Lalla Aouda",                   order: 2, status: "locked" as const },
  { id: "mausolee",         lat: 33.8920, lng: -5.5490, title: "Mausolée Moulay Ismaïl",             order: 3, status: "locked" as const },
  { id: "dar-lakbira",      lat: 33.8896, lng: -5.5600, title: "Dar Lakbira",                        order: 4, status: "locked" as const },
  { id: "hri-souani",       lat: 33.8831, lng: -5.5605, title: "Hri Souani",                         order: 5, status: "locked" as const },
  { id: "sarij-souani",     lat: 33.8831, lng: -5.5608, title: "Sarij Souani",                       order: 6, status: "locked" as const },
  { id: "prison-qara",      lat: 33.8920, lng: -5.5524, title: "Prison de Qara & Pavillon",          order: 7, status: "locked" as const },
];

export default function MapPage() {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const [layersOpen, setLayersOpen] = useState(false);
  const [showPOI, setShowPOI] = useState(true);
  const [showPath, setShowPath] = useState(true);
  const [mapError, setMapError] = useState("");
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [activeStep, setActiveStep] = useState(questSteps[0]);

  // Init Google Maps
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setMapError("Clé API Google Maps manquante.");
      return;
    }

    setOptions({ key: apiKey, v: "weekly" });

    importLibrary("maps").then(() => {
      if (!mapRef.current) return;

      const map = new google.maps.Map(mapRef.current, {
        center: MEKNES_CENTER,
        zoom: 16,
        disableDefaultUI: true,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#0e1c2e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#a2cfce" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#081422" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a2d42" }] },
          { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0e1c2e" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#081422" }] },
          { featureType: "poi", elementType: "geometry", stylers: [{ color: "#0e1c2e" }] },
          { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#0e2215" }] },
          { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1a2d42" }] },
          { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#1a2d42" }] },
          { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#0e1c2e" }] },
        ],
      });
      mapInstanceRef.current = map;

      // Quest step markers
      questSteps.forEach((step) => {
        const isActive = step.status === "active";
        const marker = new google.maps.Marker({
          position: { lat: step.lat, lng: step.lng },
          map,
          title: step.title,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: isActive ? 14 : 8,
            fillColor: isActive ? "#f0be72" : "#2a3545",
            fillOpacity: 1,
            strokeColor: isActive ? "#f0be72" : "#a2cfce",
            strokeWeight: isActive ? 2 : 1,
          },
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `<div style="background:#0e1c2e;color:#a2cfce;padding:8px 12px;border-radius:8px;font-family:sans-serif;font-size:12px;font-weight:bold">${step.title}</div>`,
        });

        marker.addListener("click", () => {
          setActiveStep(step);
          infoWindow.open(map, marker);
        });
      });

      // Draw path
      if (showPath) {
        new google.maps.Polyline({
          path: questSteps.map((s) => ({ lat: s.lat, lng: s.lng })),
          geodesic: true,
          strokeColor: "#a2cfce",
          strokeOpacity: 0.4,
          strokeWeight: 2,
          icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 }, offset: "0", repeat: "12px" }],
          map,
        });
      }
    }).catch((e: unknown) => { console.error(e); setMapError("Impossible de charger Google Maps."); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Geolocation watch
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPos(loc);
        if (mapInstanceRef.current) {
          if (!userMarkerRef.current) {
            userMarkerRef.current = new google.maps.Marker({
              position: loc,
              map: mapInstanceRef.current,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#a2cfce",
                fillOpacity: 1,
                strokeColor: "#081422",
                strokeWeight: 3,
              },
              title: "Vous êtes ici",
              zIndex: 999,
            });
          } else {
            userMarkerRef.current.setPosition(loc);
          }
        }
      },
      (err) => console.warn("Géolocalisation:", err.message),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  function recenter() {
    if (!mapInstanceRef.current) return;
    const target = userPos ?? MEKNES_CENTER;
    mapInstanceRef.current.panTo(target);
    mapInstanceRef.current.setZoom(17);
  }

  return (
    <div className="h-dvh w-full bg-background relative overflow-hidden">
      {/* Map container */}
      <div ref={mapRef} className="absolute inset-0 w-full h-full" />

      {/* Fallback si pas de clé */}
      {mapError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/90">
          <Icon name="map_off" className="text-on-surface-variant" size={48} />
          <p className="text-on-surface-variant text-sm text-center px-8">{mapError}</p>
          <p className="text-on-surface-variant/50 text-[10px] text-center px-8">
            Ajoute ta clé Google Maps dans .env.local → NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </p>
        </div>
      )}

      {/* Header */}
      <header
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 pt-12 pb-4"
        style={{ background: "linear-gradient(to bottom, rgba(8,20,34,0.9), transparent)" }}
      >
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center tap-scale"
          style={{ background: "rgba(32,43,58,0.85)", backdropFilter: "blur(12px)" }}
        >
          <Icon name="arrow_back" className="text-primary" />
        </button>
        <div
          className="px-4 py-2 rounded-full flex items-center gap-2"
          style={{ background: "rgba(32,43,58,0.85)", backdropFilter: "blur(12px)" }}
        >
          <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-on-surface text-xs font-bold uppercase tracking-wider">GPS Actif</span>
          {userPos && (
            <span className="text-on-surface-variant text-[10px] ml-1">
              {userPos.lat.toFixed(3)}, {userPos.lng.toFixed(3)}
            </span>
          )}
        </div>
        <button
          onClick={() => setLayersOpen(!layersOpen)}
          className="w-10 h-10 rounded-full flex items-center justify-center tap-scale"
          style={{ background: "rgba(32,43,58,0.85)", backdropFilter: "blur(12px)" }}
        >
          <Icon name="layers" className="text-primary" />
        </button>
      </header>

      {/* Layers panel */}
      {layersOpen && (
        <div
          className="absolute top-28 right-4 z-20 w-52 rounded-2xl p-4 space-y-3"
          style={{ background: "rgba(14,28,46,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(162,207,206,0.1)" }}
        >
          <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-2">Couches</p>
          {[
            { label: "Points d'intérêt", value: showPOI, set: setShowPOI, icon: "place" },
            { label: "Tracé du parcours", value: showPath, set: setShowPath, icon: "route" },
          ].map(({ label, value, set, icon }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name={icon} className="text-primary" size={16} />
                <span className="text-on-surface text-xs font-medium">{label}</span>
              </div>
              <label className="toggle-switch scale-75">
                <input type="checkbox" checked={value} onChange={() => set(!value)} />
                <span className="slider" />
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Recenter button */}
      <button
        onClick={recenter}
        className="absolute right-4 bottom-56 z-10 w-12 h-12 rounded-full flex items-center justify-center tap-scale shadow-lg"
        style={{ background: "rgba(32,43,58,0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(162,207,206,0.15)" }}
      >
        <Icon name="my_location" className="text-primary" size={22} />
      </button>

      {/* Active step bottom sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-28 pt-5 rounded-t-3xl"
        style={{ background: "rgba(8,20,34,0.97)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(162,207,206,0.1)" }}
      >
        <div className="w-10 h-1 bg-outline-variant/30 rounded-full mx-auto mb-4" />
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-secondary mb-1">Étape active</p>
            <h3 className="font-headline font-bold text-on-surface text-lg leading-tight">{activeStep.title}</h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">
            {activeStep.status === "active" ? "En cours" : "Verrouillé"}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-surface-container-highest overflow-hidden mb-2">
          <div className="h-full bg-secondary rounded-full" style={{ width: "16%" }} />
        </div>
        <p className="text-on-surface-variant text-xs mb-4">1 / {questSteps.length} étapes</p>
        <button
          onClick={() => router.push(`/enigma/${activeStep.id}`)}
          className="w-full py-4 rounded-xl cta-gradient font-headline font-bold text-on-primary-fixed tap-scale flex items-center justify-center gap-2"
        >
          <Icon name="extension" size={18} />
          Ouvrir l&apos;étape
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
