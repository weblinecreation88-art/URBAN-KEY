"use client";

import { useEffect, useRef, useState, useMemo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";
import GeofencePopup from "@/components/GeofencePopup";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { useGeofencing, haversine, type GeoZone } from "@/hooks/useGeofencing";
import { PARCOURS_MEKNES } from "@/data/parcours";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

const MEKNES_CENTER = { lat: 33.8920, lng: -5.5540 };

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#c8b99a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5c3d1e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5ead6" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#e8d5b0" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#d4bc8e" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#d4a96a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#a0c4cc" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4a7a80" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#b8a880" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#a8c090" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#c8b080" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#9a7a50" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#d8c8a8" }] },
];

function MapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const walkingPolylineRef = useRef<google.maps.Polyline | null>(null);
  const lastRouteRequestRef = useRef<number>(0);

  const [layersOpen, setLayersOpen] = useState(false);
  const [showPath, setShowPath] = useState(true);
  const [summerMode, setSummerMode] = useState(false);
  const [mapError, setMapError] = useState("");
  const [isOnline, setIsOnline] = useState(true);

  const mainStepsAll = PARCOURS_MEKNES.steps.filter(s => !s.isBonus && Number.isInteger(s.order));
  const stepFromParam = searchParams.get("step");
  const initialStep = mainStepsAll.find(s => s.id === stepFromParam) ?? mainStepsAll[0];
  const [activeStep, setActiveStep] = useState(initialStep);

  const geoZones = useMemo<GeoZone[]>(() =>
    PARCOURS_MEKNES.steps.map((s) => ({
      id: s.id,
      lat: s.coords.lat,
      lng: s.coords.lng,
      radiusMeters: s.isBonus ? 30 : 20,
      label: s.title,
      message: s.enigme.slice(0, 120) + (s.enigme.length > 120 ? "…" : ""),
      type: s.type === "photo" ? "photo" : s.isBonus ? "bonus" : "enigme",
    })),
  []);

  const { userPos, activeEvent, dismissEvent, spoofDetected, spoofLevel } = useGeofencing(geoZones);

  // Cache parcours en localStorage pour le mode offline
  useEffect(() => {
    try {
      localStorage.setItem(
        "urbankey_parcours_cache",
        JSON.stringify(PARCOURS_MEKNES.steps.map(s => ({
          id: s.id, title: s.title, lieu: s.lieu,
          coords: s.coords, isBonus: s.isBonus, order: s.order, type: s.type,
        })))
      );
    } catch { /* quota exceeded */ }
  }, []);

  // Sync statut online après mount (évite hydration mismatch SSR/client)
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Init Google Maps
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "AIzaSyDvm3X_xExGFimV8z7pkAXzYe7tVs8cv6o";
    if (!apiKey) { setMapError("Clé API Google Maps manquante."); return; }

    setOptions({ key: apiKey, v: "weekly" });

    importLibrary("maps").then(() => {
      if (!mapRef.current) return;

      const map = new google.maps.Map(mapRef.current, {
        center: MEKNES_CENTER,
        zoom: 16,
        disableDefaultUI: true,
        styles: MAP_STYLES,
      });
      mapInstanceRef.current = map;

      // Markers étapes — collectés pour le clustering
      const stepMarkers: google.maps.Marker[] = [];
      PARCOURS_MEKNES.steps.filter(s => !s.isBonus).forEach((step) => {
        const isActive = step.id === activeStep.id;
        const color = isActive ? "#8c4b00" : "#9a7a50";
        const marker = new google.maps.Marker({
          position: { lat: step.coords.lat, lng: step.coords.lng },
          map,
          title: step.title,
          label: {
            text: String(Math.floor(step.order)),
            color: "#fff",
            fontWeight: "bold",
            fontSize: "11px",
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: isActive ? 16 : 10,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: "#fff9ed",
            strokeWeight: 2,
          },
        });

        const infoContent = `<div style="background:#fff9ed;color:#5c3d1e;padding:8px 12px;border-radius:8px;font-family:sans-serif;font-size:12px;font-weight:bold;border:1px solid rgba(140,122,90,0.3)">${step.title}</div>`;
        const infoWindow = new google.maps.InfoWindow({ content: infoContent });

        marker.addListener("click", () => {
          setActiveStep(step);
          infoWindow.open(map, marker);
        });

        stepMarkers.push(marker);
      });

      // Clustering (actif uniquement en dessous de zoom 15)
      clustererRef.current = new MarkerClusterer({
        map,
        markers: stepMarkers,
        algorithmOptions: { maxZoom: 14 },
        renderer: {
          render({ count, position }) {
            return new google.maps.Marker({
              position,
              label: { text: String(count), color: "#fff9ed", fontWeight: "bold", fontSize: "11px" },
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 18,
                fillColor: "#9a7a50",
                fillOpacity: 0.9,
                strokeColor: "#fff9ed",
                strokeWeight: 2,
              },
              zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
            });
          },
        },
      });

      // Tracé parcours (stocké en ref pour mise à jour couleur mode été)
      const mainSteps = PARCOURS_MEKNES.steps.filter(s => !s.isBonus && Number.isInteger(s.order));
      polylineRef.current = new google.maps.Polyline({
        path: mainSteps.map((s) => ({ lat: s.coords.lat, lng: s.coords.lng })),
        geodesic: true,
        strokeColor: "#8c4b00",
        strokeOpacity: 0.5,
        strokeWeight: 2,
        icons: [{
          icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 },
          offset: "0",
          repeat: "14px",
        }],
        map: showPath ? map : null,
      });

      return () => {
        clustererRef.current?.clearMarkers();
      };
    }).catch((e: unknown) => { console.error(e); setMapError("Impossible de charger Google Maps."); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mode été — changement de couleur de la polyline parcours
  useEffect(() => {
    if (!polylineRef.current) return;
    polylineRef.current.setOptions({
      strokeColor: summerMode ? "#2563eb" : "#8c4b00",
      strokeOpacity: summerMode ? 0.7 : 0.5,
    });
  }, [summerMode]);

  // Mise à jour visibilité polyline
  useEffect(() => {
    if (!polylineRef.current || !mapInstanceRef.current) return;
    polylineRef.current.setMap(showPath ? mapInstanceRef.current : null);
  }, [showPath]);

  // Mise à jour marqueur utilisateur
  useEffect(() => {
    if (!userPos || !mapInstanceRef.current) return;
    if (!userMarkerRef.current) {
      userMarkerRef.current = new google.maps.Marker({
        position: userPos,
        map: mapInstanceRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#296767",
          fillOpacity: 1,
          strokeColor: "#fff9ed",
          strokeWeight: 3,
        },
        title: "Vous êtes ici",
        zIndex: 999,
      });
    } else {
      userMarkerRef.current.setPosition(userPos);
    }
  }, [userPos]);

  // Polyline piéton vers l'étape active
  // Affiche une ligne directionnelle pointillée bleue (ligne droite).
  // Pour activer le trajet réel, activer "Routes API" dans Google Cloud Console
  // sur la même clé que NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
  const fetchWalkingRoute = useCallback((
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ) => {
    if (!mapInstanceRef.current) return;
    if (Date.now() - lastRouteRequestRef.current < 30000) return;
    lastRouteRequestRef.current = Date.now();

    walkingPolylineRef.current?.setMap(null);
    walkingPolylineRef.current = new google.maps.Polyline({
      path: [origin, destination],
      geodesic: true,
      strokeColor: "#2563eb",
      strokeOpacity: 0.5,
      strokeWeight: 3,
      map: mapInstanceRef.current,
      zIndex: 5,
      icons: [{
        icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 },
        offset: "0",
        repeat: "10px",
      }],
    });
  }, []);

  useEffect(() => {
    if (!userPos || !mapInstanceRef.current) return;
    fetchWalkingRoute(userPos, { lat: activeStep.coords.lat, lng: activeStep.coords.lng });
    return () => { walkingPolylineRef.current?.setMap(null); };
  }, [userPos, activeStep, fetchWalkingRoute]);

  function recenter() {
    if (!mapInstanceRef.current) return;
    const target = userPos ?? MEKNES_CENTER;
    mapInstanceRef.current.panTo(target);
    mapInstanceRef.current.setZoom(17);
  }

  const mainSteps = mainStepsAll;
  const currentIndex = mainSteps.findIndex(s => s.id === activeStep.id);
  const progress = Math.round(((currentIndex + 1) / mainSteps.length) * 100);

  // ETA dynamique vers l'étape active
  const etaMinutes = useMemo(() => {
    if (!userPos) return null;
    const dist = haversine(userPos.lat, userPos.lng, activeStep.coords.lat, activeStep.coords.lng);
    return Math.ceil(dist / 80);
  }, [userPos, activeStep]);

  // Liste étapes triée par ombre en mode été (panneau couches uniquement)
  const displaySteps = useMemo(() => {
    if (!summerMode) return mainSteps;
    return [...mainSteps].sort((a, b) => {
      const toMin = (t?: string) => {
        if (!t) return 999;
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
      };
      return toMin(a.shadedFrom) - toMin(b.shadedFrom);
    });
  }, [mainSteps, summerMode]);

  return (
    <div className="h-dvh w-full bg-background relative overflow-hidden">
      {/* Map */}
      <div ref={mapRef} className="absolute inset-0 w-full h-full" />

      {/* Fallback no API key */}
      {mapError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/95 px-8">
          <Icon name="map_off" className="text-on-surface-variant" size={48} />
          <p className="text-on-surface text-sm text-center font-medium">{mapError}</p>
          <p className="text-on-surface-variant text-[11px] text-center">
            Ajoute <code className="bg-surface-container-high px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> dans <code className="bg-surface-container-high px-1 rounded">.env.local</code>
          </p>
        </div>
      )}

      {/* Bannière anti-spoof (3 niveaux) */}
      {spoofDetected && (
        <div className="absolute top-28 left-4 right-4 z-30 px-4 py-2 rounded-xl flex items-center gap-2"
          style={{
            background: spoofLevel === 3 ? "rgba(186,26,26,0.95)" : "rgba(186,100,26,0.9)",
            backdropFilter: "blur(8px)"
          }}
        >
          <Icon name="gps_off" className="text-white" size={16} />
          <span className="text-white text-xs font-bold">
            {spoofLevel === 3
              ? "GPS falsifié — progression bloquée"
              : spoofLevel === 2
                ? "Alerte GPS — comportement suspect répété"
                : "Position GPS suspecte détectée"}
          </span>
        </div>
      )}

      {/* Bannière hors-ligne */}
      {!isOnline && (
        <div
          className={`absolute left-4 right-4 z-20 px-4 py-2 rounded-xl flex items-center gap-2 ${spoofDetected ? "top-40" : "top-28"}`}
          style={{ background: "rgba(60,60,60,0.88)", backdropFilter: "blur(8px)" }}
        >
          <Icon name="wifi_off" className="text-white" size={16} />
          <span className="text-white text-xs font-bold">Mode hors-ligne — carte en cache</span>
        </div>
      )}

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 pt-12 pb-4"
        style={{ background: "linear-gradient(to bottom, rgba(245,234,214,0.95), transparent)" }}
      >
        <button onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center tap-scale"
          style={{ background: "rgba(255,249,237,0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(140,122,90,0.25)" }}
        >
          <Icon name="arrow_back" className="text-primary" />
        </button>

        <div className="px-4 py-2 rounded-full flex items-center gap-2"
          style={{ background: "rgba(255,249,237,0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(140,122,90,0.25)" }}
        >
          <div className={`w-2 h-2 rounded-full animate-pulse ${userPos ? "bg-secondary" : "bg-on-surface-variant/40"}`} />
          <span className="text-on-surface text-xs font-bold uppercase tracking-wide">
            {userPos ? "GPS Actif" : "En attente GPS…"}
          </span>
        </div>

        <button onClick={() => setLayersOpen(!layersOpen)}
          className="w-10 h-10 rounded-full flex items-center justify-center tap-scale"
          style={{ background: "rgba(255,249,237,0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(140,122,90,0.25)" }}
        >
          <Icon name="layers" className="text-primary" />
        </button>
      </header>

      {/* Layers panel */}
      {layersOpen && (
        <div className="absolute top-28 right-4 z-20 w-56 rounded-2xl p-4 space-y-3"
          style={{ background: "rgba(255,249,237,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(140,122,90,0.25)", boxShadow: "0 4px 24px rgba(44,26,0,0.15)" }}
        >
          <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-2">Couches</p>

          {/* Toggle tracé */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="route" className="text-primary" size={16} />
              <span className="text-on-surface text-xs font-medium">Tracé parcours</span>
            </div>
            <label className="toggle-switch scale-75">
              <input type="checkbox" checked={showPath} onChange={() => setShowPath(!showPath)} />
              <span className="slider" />
            </label>
          </div>

          {/* Toggle mode été */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="wb_sunny" size={16} className="text-amber-600" />
              <span className="text-on-surface text-xs font-medium">Mode été</span>
            </div>
            <label className="toggle-switch scale-75">
              <input type="checkbox" checked={summerMode} onChange={() => setSummerMode(!summerMode)} />
              <span className="slider" />
            </label>
          </div>

          <div className="pt-2 mt-2" style={{ borderTop: "1px solid rgba(140,122,90,0.2)" }}>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-2">
              {summerMode ? "Étapes (ordre ombre ☀️)" : "Étapes"}
            </p>
            {displaySteps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 py-1">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                  style={{ background: s.id === activeStep.id ? "#8c4b00" : "#cdbf9e" }}
                >
                  {summerMode ? (i + 1) : Math.floor(s.order)}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-xs block truncate ${s.id === activeStep.id ? "text-primary font-bold" : "text-on-surface-variant"}`}>
                    {s.title}
                  </span>
                  {summerMode && s.shadedFrom && (
                    <span className="text-[9px] text-amber-600">ombre dès {s.shadedFrom}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recenter */}
      <button onClick={recenter}
        className="absolute right-4 bottom-60 z-10 w-12 h-12 rounded-full flex items-center justify-center tap-scale"
        style={{ background: "rgba(255,249,237,0.95)", border: "1px solid rgba(140,122,90,0.3)", boxShadow: "0 2px 12px rgba(44,26,0,0.15)" }}
      >
        <Icon name="my_location" className="text-primary" size={22} />
      </button>

      {/* Bottom sheet étape active */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-28 pt-4 rounded-t-3xl"
        style={{ background: "rgba(255,249,237,0.97)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(140,122,90,0.2)", boxShadow: "0 -4px 24px rgba(44,26,0,0.1)" }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: "rgba(140,122,90,0.3)" }} />

        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-secondary mb-0.5">Étape active</p>
            <h3 className="font-headline font-bold text-on-surface text-base leading-tight">{activeStep.title}</h3>
            <p className="text-on-surface-variant text-[11px] mt-0.5">{activeStep.lieu}</p>
            {etaMinutes !== null && (
              <div className="flex items-center gap-1.5 mt-1">
                <Icon name="directions_walk" className="text-secondary" size={13} />
                <span className="text-secondary text-[11px] font-bold">
                  {etaMinutes <= 1 ? "< 1 min" : `~${etaMinutes} min à pied`}
                </span>
              </div>
            )}
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {currentIndex + 1} / {mainSteps.length}
          </span>
        </div>

        <div className="h-1.5 w-full rounded-full bg-surface-container-high overflow-hidden mb-4">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>

        <button
          onClick={() => router.push(`/enigma/${activeStep.id}`)}
          className="w-full py-3.5 rounded-xl cta-gradient font-headline font-bold text-white tap-scale flex items-center justify-center gap-2"
        >
          <Icon name="extension" size={18} />
          Ouvrir l&apos;étape
        </button>
      </div>

      {/* Géofencing popup */}
      {activeEvent && (
        <GeofencePopup
          event={activeEvent}
          onDismiss={dismissEvent}
          onAction={activeEvent.zone.type !== "photo"
            ? () => { dismissEvent(); router.push(`/enigma/${activeEvent.zone.id}`); }
            : undefined
          }
          actionLabel={activeEvent.zone.type !== "photo" ? "Résoudre l'énigme" : undefined}
        />
      )}

      <BottomNav />
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="h-dvh w-full bg-background" />}>
      <MapContent />
    </Suspense>
  );
}
