"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";

export default function MapPage() {
  const router = useRouter();
  const [layersOpen, setLayersOpen] = useState(false);
  const [poiToggle, setPoiToggle] = useState(true);
  const [pathToggle, setPathToggle] = useState(true);

  return (
    <div className="h-dvh w-full flex flex-col bg-background overflow-hidden relative">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 h-16 flex items-center justify-between px-6 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-primary tap-scale p-2 rounded-full hover:bg-surface-container-high transition-colors">
            <Icon name="arrow_back" />
          </button>
          <h1 className="font-headline font-bold text-primary text-xl">Urban Escape</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLayersOpen(true)}
            className="text-primary tap-scale p-2 rounded-full hover:bg-surface-container-high transition-colors"
          >
            <Icon name="layers" />
          </button>
          <button className="text-primary tap-scale p-2 rounded-full hover:bg-surface-container-high transition-colors">
            <Icon name="search" />
          </button>
        </div>
      </header>

      {/* Map canvas */}
      <main className="relative flex-1 w-full overflow-hidden pt-16 pb-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(8,20,34,0.4), rgba(8,20,34,0.8)), url('https://images.unsplash.com/photo-1548345680-f5475ea5df84?w=800&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* SVG paths */}
          <svg className="absolute inset-0 w-full h-full opacity-60 pointer-events-none" viewBox="0 0 400 800">
            <path
              d="M80,320 L180,340 L240,280 L320,400 L340,560"
              fill="none"
              stroke="#f0be72"
              strokeWidth="3"
              strokeDasharray="8 8"
              className="drop-shadow-[0_0_8px_rgba(240,190,114,0.8)]"
            />
            <path d="M60,160 L120,200 L180,340" fill="none" stroke="#a2cfce" strokeWidth="2" opacity="0.4" />
          </svg>

          {/* Active enigma marker (pulsing) */}
          <div className="absolute top-[42%] left-[45%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-12 h-12 bg-secondary/30 rounded-full animate-ping" />
              <div className="relative w-10 h-10 bg-secondary rounded-full flex items-center justify-center shadow-[0_0_15px_#f0be72] border-2 border-on-secondary">
                <Icon name="extension" filled className="text-on-secondary" size={22} />
              </div>
            </div>
            <div
              className="mt-2 px-3 py-1 rounded-lg text-secondary font-bold text-xs uppercase tracking-widest"
              style={{ background: "rgba(32,43,58,0.9)", border: "1px solid rgba(240,190,114,0.2)" }}
            >
              Énigme Active
            </div>
          </div>

          {/* Historical site marker */}
          <div className="absolute top-[20%] left-[30%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-[0_0_10px_#a2cfce] border border-on-primary">
              <Icon name="castle" filled className="text-on-primary" size={18} />
            </div>
            <div
              className="mt-1 px-2 py-0.5 rounded-md text-[10px] text-primary-fixed uppercase font-semibold"
              style={{ background: "rgba(21,32,47,0.7)", backdropFilter: "blur(8px)" }}
            >
              Bab Mansour
            </div>
          </div>

          {/* Locked marker */}
          <div className="absolute top-[60%] left-[80%] -translate-x-1/2 -translate-y-1/2 opacity-60">
            <div className="w-8 h-8 bg-surface-variant rounded-full flex items-center justify-center border border-outline-variant">
              <Icon name="lock" className="text-on-surface-variant" size={18} />
            </div>
          </div>

          {/* Map controls */}
          <div className="absolute top-6 right-4 flex flex-col gap-3">
            <button
              onClick={() => setLayersOpen(true)}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-primary tap-scale"
              style={{ background: "rgba(21,32,47,0.7)", backdropFilter: "blur(16px)", border: "1px solid rgba(162,207,206,0.1)" }}
            >
              <Icon name="layers" />
            </button>
            <button
              className="w-11 h-11 rounded-xl flex items-center justify-center text-secondary tap-scale"
              style={{ background: "rgba(21,32,47,0.7)", backdropFilter: "blur(16px)", border: "1px solid rgba(240,190,114,0.1)" }}
            >
              <Icon name="my_location" />
            </button>
          </div>
        </div>

        {/* Quest status bottom sheet */}
        <div className="absolute bottom-4 left-4 right-4 z-40">
          <div
            className="p-5 rounded-2xl overflow-hidden relative"
            style={{ background: "rgba(21,32,47,0.9)", backdropFilter: "blur(16px)", borderLeft: "4px solid #f0be72" }}
          >
            <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-secondary/10 to-transparent pointer-events-none" />
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded text-[9px] font-black uppercase tracking-tighter">
                    Quête en cours
                  </span>
                  <span className="text-on-surface-variant text-xs font-medium">Étape 3 / 6</span>
                </div>
                <h2 className="font-headline text-base font-bold text-on-surface leading-tight">
                  Meknès : Le Secret du Sultan
                </h2>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-secondary font-bold text-sm">350 m</span>
                <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">
                  Prochain indice
                </span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden mb-4">
              <div className="h-full bg-secondary w-1/2 shadow-[0_0_8px_#f0be72]" />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/enigma/vieux-quartier")}
                className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 font-headline font-bold text-on-primary text-sm tap-scale cta-gradient"
              >
                <Icon name="near_me" size={18} />
                ITINÉRAIRE
              </button>
              <button className="w-11 h-11 rounded-xl flex items-center justify-center text-secondary tap-scale"
                style={{ background: "rgba(32,43,58,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(240,190,114,0.2)" }}
              >
                <Icon name="help" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Layers side panel */}
      <div
        className={`fixed top-0 right-0 h-full w-72 z-[100] transition-transform duration-300 ease-in-out flex flex-col ${layersOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ background: "rgba(21,32,47,0.95)", backdropFilter: "blur(20px)", borderLeft: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="p-6 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h3 className="font-headline font-bold text-xl text-primary flex items-center gap-2">
            <Icon name="layers" /> Couches
          </h3>
          <button onClick={() => setLayersOpen(false)} className="text-on-surface-variant tap-scale">
            <Icon name="close" />
          </button>
        </div>
        <div className="flex-1 p-6 space-y-5 overflow-y-auto">
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/60">
            Visibilité
          </p>
          {[
            { label: "Points d'intérêt", sub: "Boutiques, cafés, sites", icon: "location_on", color: "text-primary bg-primary-container", state: poiToggle, toggle: setPoiToggle },
            { label: "Chemins historiques", sub: "Les routes du Sultan", icon: "route", color: "text-secondary bg-secondary-container", state: pathToggle, toggle: setPathToggle },
          ].map(({ label, sub, icon, color, state, toggle }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon name={icon} size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">{label}</p>
                  <p className="text-[10px] text-on-surface-variant">{sub}</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={state} onChange={() => toggle(!state)} />
                <span className="slider" />
              </label>
            </div>
          ))}
        </div>
        <div className="p-5">
          <button
            onClick={() => setLayersOpen(false)}
            className="w-full py-3 rounded-xl font-headline font-bold text-sm tracking-wide tap-scale cta-gradient text-on-primary-fixed"
          >
            APPLIQUER
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
