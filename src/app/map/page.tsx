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
import { useAuth } from "@/context/AuthContext";

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

// Styles des markers selon leur état
function getMarkerStyle(status: "completed" | "active" | "next" | "locked", order: number) {
  switch (status) {
    case "completed":
      return {
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 13, fillColor: "#16a34a", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2 },
        label: { text: "✓", color: "#fff", fontWeight: "bold", fontSize: "12px" },
        zIndex: 5,
      };
    case "active":
      return {
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 18, fillColor: "#8c4b00", fillOpacity: 1, strokeColor: "#c9a96e", strokeWeight: 3 },
        label: { text: String(Math.floor(order)), color: "#fff", fontWeight: "bold", fontSize: "13px" },
        zIndex: 10,
      };
    case "next":
      return {
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 12, fillColor: "#9a7a50", fillOpacity: 0.95, strokeColor: "#fff9ed", strokeWeight: 2 },
        label: { text: String(Math.floor(order)), color: "#fff", fontWeight: "bold", fontSize: "11px" },
        zIndex: 4,
      };
    default: // locked
      return {
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 9, fillColor: "#cdbf9e", fillOpacity: 0.6, strokeColor: "#fff9ed", strokeWeight: 1 },
        label: { text: String(Math.floor(order)), color: "rgba(255,255,255,0.7)", fontWeight: "bold", fontSize: "10px" },
        zIndex: 2,
      };
  }
}

function MapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const completedPolylineRef = useRef<google.maps.Polyline | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markerMapRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const walkingPolylineRef = useRef<google.maps.Polyline | null>(null);
  const lastRouteRequestRef = useRef<number>(0);
  const isFirstMount = useRef(true);

  const [layersOpen, setLayersOpen] = useState(false);
  const [showPath, setShowPath] = useState(true);
  const [summerMode, setSummerMode] = useState(false);
  const [satelliteMode, setSatelliteMode] = useState(true); // satellite par défaut
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

  // Cache parcours offline
  useEffect(() => {
    try {
      localStorage.setItem("urbankey_parcours_cache",
        JSON.stringify(PARCOURS_MEKNES.steps.map(s => ({
          id: s.id, title: s.title, lieu: s.lieu,
          coords: s.coords, isBonus: s.isBonus, order: s.order, type: s.type,
        })))
      );
    } catch { /* quota */ }
  }, []);

  // Online/offline
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  // Init Google Maps — satellite par défaut
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "AIzaSyDvm3X_xExGFimV8z7pkAXzYe7tVs8cv6o";
    if (!apiKey) { setMapError("Clé API Google Maps manquante."); return; }

    setOptions({ key: apiKey, v: "weekly" });

    importLibrary("maps").then(() => {
      if (!mapRef.current) return;

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: activeStep.coords.lat, lng: activeStep.coords.lng },
        zoom: 17,
        disableDefaultUI: true,
        mapTypeId: "hybrid", // satellite par défaut
        styles: [],
      });
      mapInstanceRef.current = map;

      // Créer tous les markers et les stocker dans markerMapRef
      PARCOURS_MEKNES.steps.filter(s => !s.isBonus).forEach((step) => {
        const status = step.id === activeStep.id ? "active"
          : step.order === activeStep.order + 1 ? "next"
          : step.order < activeStep.order ? "completed"
          : "locked";

        const style = getMarkerStyle(status, step.order);
        const marker = new google.maps.Marker({
          position: { lat: step.coords.lat, lng: step.coords.lng },
          map,
          title: step.title,
          label: style.label,
          icon: style.icon,
          zIndex: style.zIndex,
        });

        const infoContent = `<div style="background:#fff9ed;color:#5c3d1e;padding:8px 12px;border-radius:8px;font-family:sans-serif;font-size:12px;font-weight:bold;border:1px solid rgba(140,122,90,0.3)">${step.title}</div>`;
        const infoWindow = new google.maps.InfoWindow({ content: infoContent });
        marker.addListener("click", () => {
          setActiveStep(step);
          infoWindow.open(map, marker);
        });

        markerMapRef.current.set(step.id, marker);
      });

      // Clustering en dézoom
      const allMarkers = Array.from(markerMapRef.current.values());
      clustererRef.current = new MarkerClusterer({
        map,
        markers: allMarkers,
        algorithmOptions: { maxZoom: 14 },
        renderer: {
          render({ count, position }) {
            return new google.maps.Marker({
              position,
              label: { text: String(count), color: "#fff9ed", fontWeight: "bold", fontSize: "11px" },
              icon: { path: google.maps.SymbolPath.CIRCLE, scale: 18, fillColor: "#9a7a50", fillOpacity: 0.9, strokeColor: "#fff9ed", strokeWeight: 2 },
              zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
            });
          },
        },
      });

      // Tracé aperçu parcours (pointillé)
      const mainSteps = PARCOURS_MEKNES.steps.filter(s => !s.isBonus && Number.isInteger(s.order));
      polylineRef.current = new google.maps.Polyline({
        path: mainSteps.map(s => ({ lat: s.coords.lat, lng: s.coords.lng })),
        geodesic: true,
        strokeColor: "#c9a96e",
        strokeOpacity: 0.45,
        strokeWeight: 2,
        icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 }, offset: "0", repeat: "14px" }],
        map: showPath ? map : null,
      });

      // Tracé étapes réalisées (ligne verte pleine)
      completedPolylineRef.current = new google.maps.Polyline({
        path: [],
        geodesic: true,
        strokeColor: "#16a34a",
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map,
        zIndex: 3,
      });

      return () => { clustererRef.current?.clearMarkers(); };
    }).catch((e: unknown) => { console.error(e); setMapError("Impossible de charger Google Maps."); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mise à jour dynamique des markers + polyline verte quand l'étape active change
  useEffect(() => {
    if (!mapInstanceRef.current || markerMapRef.current.size === 0) return;

    const mainSteps = PARCOURS_MEKNES.steps.filter(s => !s.isBonus && Number.isInteger(s.order));

    markerMapRef.current.forEach((marker, stepId) => {
      const step = mainSteps.find(s => s.id === stepId);
      if (!step) return;

      const status: "completed" | "active" | "next" | "locked" =
        step.id === activeStep.id ? "active"
        : step.order < activeStep.order ? "completed"
        : step.order === activeStep.order + 1 ? "next"
        : "locked";

      const style = getMarkerStyle(status, step.order);
      marker.setIcon(style.icon);
      marker.setLabel(style.label);
      marker.setZIndex(style.zIndex);
    });

    // Polyline verte sur les étapes complétées
    if (completedPolylineRef.current) {
      const completedSteps = mainSteps.filter(s => s.order <= activeStep.order);
      completedPolylineRef.current.setPath(
        completedSteps.map(s => ({ lat: s.coords.lat, lng: s.coords.lng }))
      );
    }

    // Pan vers l'étape active (sauf au premier mount)
    if (!isFirstMount.current) {
      mapInstanceRef.current.panTo({ lat: activeStep.coords.lat, lng: activeStep.coords.lng });
    }
    isFirstMount.current = false;
  }, [activeStep]);

  // Mode été — couleur polyline aperçu
  useEffect(() => {
    if (!polylineRef.current) return;
    polylineRef.current.setOptions({
      strokeColor: summerMode ? "#2563eb" : "#c9a96e",
      strokeOpacity: summerMode ? 0.7 : 0.45,
    });
  }, [summerMode]);

  // Vue satellite / parchement
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (satelliteMode) {
      mapInstanceRef.current.setMapTypeId("hybrid");
      mapInstanceRef.current.setOptions({ styles: [] });
    } else {
      mapInstanceRef.current.setMapTypeId("roadmap");
      mapInstanceRef.current.setOptions({ styles: MAP_STYLES });
    }
  }, [satelliteMode]);

  // Visibilité polyline aperçu
  useEffect(() => {
    if (!polylineRef.current || !mapInstanceRef.current) return;
    polylineRef.current.setMap(showPath ? mapInstanceRef.current : null);
  }, [showPath]);

  // Marker position utilisateur
  useEffect(() => {
    if (!userPos || !mapInstanceRef.current) return;
    if (!userMarkerRef.current) {
      userMarkerRef.current = new google.maps.Marker({
        position: userPos,
        map: mapInstanceRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 11,
          fillColor: "#2563eb",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 3,
        },
        title: "Vous êtes ici",
        zIndex: 999,
      });
    } else {
      userMarkerRef.current.setPosition(userPos);
    }
  }, [userPos]);

  // Polyline piéton via Routes API v2 → itinéraire à pied vers étape active
  const fetchWalkingRoute = useCallback(async (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ) => {
    if (!mapInstanceRef.current) return;
    if (Date.now() - lastRouteRequestRef.current < 30000) return;
    lastRouteRequestRef.current = Date.now();

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "AIzaSyDvm3X_xExGFimV8z7pkAXzYe7tVs8cv6o";

    try {
      const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "routes.polyline.encodedPolyline",
        },
        body: JSON.stringify({
          origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
          destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
          travelMode: "WALK",
        }),
      });

      if (!res.ok) throw new Error("routes_api_error");
      const data = await res.json() as { routes?: Array<{ polyline?: { encodedPolyline?: string } }> };
      const encoded = data.routes?.[0]?.polyline?.encodedPolyline;
      if (!encoded) throw new Error("no_polyline");

      const { encoding } = await importLibrary("geometry") as { encoding: { decodePath: (s: string) => google.maps.LatLng[] } };
      const path = encoding.decodePath(encoded);

      walkingPolylineRef.current?.setMap(null);
      walkingPolylineRef.current = new google.maps.Polyline({
        path,
        geodesic: false,
        strokeColor: "#f59e0b",
        strokeOpacity: 0.9,
        strokeWeight: 5,
        map: mapInstanceRef.current,
        zIndex: 6,
        icons: [{
          icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2.5, strokeColor: "#d97706" },
          offset: "50%",
          repeat: "80px",
        }],
      });
    } catch {
      walkingPolylineRef.current?.setMap(null);
      if (!mapInstanceRef.current) return;
      walkingPolylineRef.current = new google.maps.Polyline({
        path: [origin, destination],
        geodesic: true,
        strokeColor: "#f59e0b",
        strokeOpacity: 0.7,
        strokeWeight: 4,
        map: mapInstanceRef.current,
        zIndex: 6,
        icons: [{
          icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 },
          offset: "0",
          repeat: "10px",
        }],
      });
    }
  }, []);

  useEffect(() => {
    if (!userPos || !mapInstanceRef.current) return;
    lastRouteRequestRef.current = 0; // forcer recalcul quand étape change
    fetchWalkingRoute(userPos, { lat: activeStep.coords.lat, lng: activeStep.coords.lng });
    return () => { walkingPolylineRef.current?.setMap(null); };
  }, [userPos, activeStep, fetchWalkingRoute]);

  function recenter() {
    if (!mapInstanceRef.current) return;
    const target = userPos ?? { lat: activeStep.coords.lat, lng: activeStep.coords.lng };
    mapInstanceRef.current.panTo(target);
    mapInstanceRef.current.setZoom(18);
  }

  const mainSteps = mainStepsAll;
  const currentIndex = mainSteps.findIndex(s => s.id === activeStep.id);
  const progress = Math.round(((currentIndex + 1) / mainSteps.length) * 100);

  const etaMinutes = useMemo(() => {
    if (!userPos) return null;
    const dist = haversine(userPos.lat, userPos.lng, activeStep.coords.lat, activeStep.coords.lng);
    return Math.ceil(dist / 80);
  }, [userPos, activeStep]);

  const displaySteps = useMemo(() => {
    if (!summerMode) return mainSteps;
    return [...mainSteps].sort((a, b) => {
      const toMin = (t?: string) => { if (!t) return 999; const [h, m] = t.split(":").map(Number); return h * 60 + m; };
      return toMin(a.shadedFrom) - toMin(b.shadedFrom);
    });
  }, [mainSteps, summerMode]);

  return (
    <div className="h-dvh w-full bg-background relative overflow-hidden">
      <div ref={mapRef} className="absolute inset-0 w-full h-full" />

      {mapError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/95 px-8">
          <Icon name="map_off" className="text-on-surface-variant" size={48} />
          <p className="text-on-surface text-sm text-center font-medium">{mapError}</p>
        </div>
      )}

      {/* Bannière anti-spoof */}
      {spoofDetected && (
        <div className="absolute top-28 left-4 right-4 z-30 px-4 py-2 rounded-xl flex items-center gap-2"
          style={{ background: spoofLevel === 3 ? "rgba(186,26,26,0.95)" : "rgba(186,100,26,0.9)", backdropFilter: "blur(8px)" }}
        >
          <Icon name="gps_off" className="text-white" size={16} />
          <span className="text-white text-xs font-bold">
            {spoofLevel === 3 ? "GPS falsifié — progression bloquée"
              : spoofLevel === 2 ? "Alerte GPS — comportement suspect répété"
              : "Position GPS suspecte détectée"}
          </span>
        </div>
      )}

      {/* Bannière hors-ligne */}
      {!isOnline && (
        <div className={`absolute left-4 right-4 z-20 px-4 py-2 rounded-xl flex items-center gap-2 ${spoofDetected ? "top-40" : "top-28"}`}
          style={{ background: "rgba(60,60,60,0.88)", backdropFilter: "blur(8px)" }}
        >
          <Icon name="wifi_off" className="text-white" size={16} />
          <span className="text-white text-xs font-bold">Mode hors-ligne — carte en cache</span>
        </div>
      )}

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 pt-12 pb-4"
        style={{ background: "linear-gradient(to bottom, rgba(10,20,40,0.85), transparent)" }}
      >
        <button onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center tap-scale"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <Icon name="arrow_back" className="text-white" />
        </button>

        <div className="px-4 py-2 rounded-full flex items-center gap-2"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <div className={`w-2 h-2 rounded-full animate-pulse ${userPos ? "bg-green-400" : "bg-white/40"}`} />
          <span className="text-white text-xs font-bold uppercase tracking-wide">
            {userPos ? "GPS Actif" : "En attente GPS…"}
          </span>
        </div>

        <button onClick={() => setLayersOpen(!layersOpen)}
          className="w-10 h-10 rounded-full flex items-center justify-center tap-scale"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <Icon name="layers" className="text-white" />
        </button>
      </header>

      {/* Légende markers */}
      <div className="absolute top-28 left-4 z-10 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
        >
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-white text-[10px] font-bold">Réalisée</span>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
        >
          <div className="w-3 h-3 rounded-full bg-amber-700" />
          <span className="text-white text-[10px] font-bold">Active</span>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
        >
          <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,220,150,0.5)" }} />
          <span className="text-white text-[10px] font-bold">À venir</span>
        </div>
      </div>

      {/* Layers panel */}
      {layersOpen && (
        <div className="absolute top-28 right-4 z-20 w-56 rounded-2xl p-4 space-y-3"
          style={{ background: "rgba(10,20,40,0.92)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
        >
          <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-2">Couches</p>

          {[
            { label: "Tracé parcours", icon: "route", state: showPath, set: setShowPath },
            { label: "Vue satellite", icon: "satellite_alt", state: satelliteMode, set: setSatelliteMode },
            { label: "Mode été", icon: "wb_sunny", state: summerMode, set: setSummerMode },
          ].map(({ label, icon, state, set }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name={icon} size={15} className="text-white/70" />
                <span className="text-white text-xs font-medium">{label}</span>
              </div>
              <label className="toggle-switch scale-75">
                <input type="checkbox" checked={state} onChange={() => set(!state)} />
                <span className="slider" />
              </label>
            </div>
          ))}

          <div className="pt-2 mt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">
              {summerMode ? "Ordre ombre ☀️" : "Étapes"}
            </p>
            {displaySteps.map((s) => {
              const isCompleted = s.order < activeStep.order;
              const isActive = s.id === activeStep.id;
              return (
                <div key={s.id} className="flex items-center gap-2 py-1">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0"
                    style={{ background: isCompleted ? "#16a34a" : isActive ? "#8c4b00" : "rgba(255,255,255,0.15)" }}
                  >
                    {isCompleted ? "✓" : Math.floor(s.order)}
                  </div>
                  <span className={`text-xs truncate ${isActive ? "text-amber-400 font-bold" : isCompleted ? "text-green-400" : "text-white/50"}`}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recenter */}
      <button onClick={recenter}
        className="absolute right-4 bottom-60 z-10 w-12 h-12 rounded-full flex items-center justify-center tap-scale"
        style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.25)", boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }}
      >
        <Icon name="my_location" className="text-white" size={22} />
      </button>

      {/* Bottom sheet étape active */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-28 pt-4 rounded-t-3xl"
        style={{ background: "rgba(10,20,40,0.92)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 -4px 24px rgba(0,0,0,0.4)" }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: "rgba(255,255,255,0.2)" }} />

        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-amber-400 mb-0.5">Étape active</p>
            <h3 className="font-headline font-bold text-white text-base leading-tight">{activeStep.title}</h3>
            <p className="text-white/60 text-[11px] mt-0.5">{activeStep.lieu}</p>
            {etaMinutes !== null && (
              <div className="flex items-center gap-1.5 mt-1">
                <Icon name="directions_walk" className="text-amber-400" size={13} />
                <span className="text-amber-400 text-[11px] font-bold">
                  {etaMinutes <= 1 ? "< 1 min" : `~${etaMinutes} min à pied`}
                </span>
              </div>
            )}
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-amber-400" style={{ background: "rgba(201,169,110,0.15)", border: "1px solid rgba(201,169,110,0.3)" }}>
            {currentIndex + 1} / {mainSteps.length}
          </span>
        </div>

        {/* Barre de progression avec étapes */}
        <div className="flex items-center gap-1 mb-4">
          {mainSteps.map((s, i) => (
            <div key={s.id} className="flex-1 h-1.5 rounded-full transition-all"
              style={{
                background: s.order < activeStep.order ? "#16a34a"
                  : s.id === activeStep.id ? "#c9a96e"
                  : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>

        <button
          onClick={() => router.push(`/enigma/${activeStep.id}`)}
          className="w-full py-3.5 rounded-xl cta-gradient font-headline font-bold text-white tap-scale flex items-center justify-center gap-2"
        >
          <Icon name="extension" size={18} />
          Ouvrir l&apos;étape
        </button>
      </div>

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
