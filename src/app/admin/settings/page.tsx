"use client";

import Icon from "@/components/Icon";

const ENV_VARS = [
  { key: "NEXT_PUBLIC_FIREBASE_API_KEY", label: "Firebase API Key", status: "ok" },
  { key: "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", label: "Google Maps API Key", status: "check" },
  { key: "GOOGLE_GENAI_API_KEY", label: "Gemini (Genkit) API Key", status: "check" },
  { key: "STRIPE_SECRET_KEY", label: "Stripe Secret Key", status: "check" },
  { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", label: "Stripe Publishable Key", status: "check" },
];

const ROADMAP = [
  { sprint: "Sprint 1", label: "Circuit pilote", done: true },
  { sprint: "Sprint 2", label: "Gameplay core (énigmes, timers, hints, scoring)", done: true },
  { sprint: "Sprint 3", label: "Carte GPS + géofencing + anti-spoofing", done: true },
  { sprint: "Sprint 4", label: "Paiements Stripe + CMS back-office", done: true },
  { sprint: "Sprint 5", label: "QR check-in OTA + PDF corporate", done: false },
  { sprint: "Sprint 6", label: "QA terrain, AR markers, NPS, publication stores", done: false },
];

export default function AdminSettings() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-[10px] uppercase font-bold tracking-widest text-secondary mb-1">Configuration</p>
        <h1 className="font-headline font-bold text-2xl text-primary">Paramètres</h1>
      </div>

      {/* Variables d'environnement */}
      <div className="parchment-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(140,122,90,0.15)" }}>
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Variables d&apos;environnement</p>
        </div>
        <div className="divide-y" style={{ borderColor: "rgba(140,122,90,0.1)" }}>
          {ENV_VARS.map(v => (
            <div key={v.key} className="flex items-center gap-4 px-5 py-3">
              <Icon
                name={v.status === "ok" ? "check_circle" : "radio_button_unchecked"}
                size={16}
                style={{ color: v.status === "ok" ? "#296767" : "#c97a00" }}
                filled
              />
              <div className="flex-1 min-w-0">
                <p className="text-on-surface font-medium text-sm">{v.label}</p>
                <code className="text-on-surface-variant text-[10px]">{v.key}</code>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                style={{
                  background: v.status === "ok" ? "rgba(41,103,103,0.12)" : "rgba(201,122,0,0.1)",
                  color: v.status === "ok" ? "#296767" : "#c97a00"
                }}>
                {v.status === "ok" ? "Configuré" : "À configurer"}
              </span>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 text-xs text-on-surface-variant" style={{ borderTop: "1px solid rgba(140,122,90,0.15)" }}>
          Configurez ces variables dans <code className="bg-surface-container-high px-1 rounded">.env.local</code> à la racine du projet.
        </div>
      </div>

      {/* Roadmap */}
      <div className="parchment-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(140,122,90,0.15)" }}>
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Roadmap — 14 semaines</p>
        </div>
        <div className="divide-y">
          {ROADMAP.map(r => (
            <div key={r.sprint} className="flex items-center gap-4 px-5 py-3">
              <Icon
                name={r.done ? "check_circle" : "radio_button_unchecked"}
                size={16}
                filled={r.done}
                style={{ color: r.done ? "#296767" : "#9a7a50" }}
              />
              <div className="flex-1">
                <span className="text-[10px] font-bold text-on-surface-variant mr-2">{r.sprint}</span>
                <span className="text-sm text-on-surface">{r.label}</span>
              </div>
              {r.done && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(41,103,103,0.12)", color: "#296767" }}>Terminé</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* App info */}
      <div className="parchment-card rounded-2xl p-5 space-y-3">
        <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Informations app</p>
        {[
          ["Application", "UrbanKey"],
          ["Version", "0.1.0 (MVP)"],
          ["Framework", "Next.js 16.2 + Firebase App Hosting"],
          ["Repo GitHub", "weblinecreation88-art/URBAN-KEY"],
          ["Firebase Project", "urban-key2"],
          ["Design system", "The Ancient Explorer (Parchment / Ocre)"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between items-center text-sm">
            <span className="text-on-surface-variant">{k}</span>
            <span className="font-medium text-on-surface">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
