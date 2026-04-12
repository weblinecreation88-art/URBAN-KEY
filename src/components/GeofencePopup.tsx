"use client";

import Icon from "./Icon";
import type { GeofenceEvent } from "@/hooks/useGeofencing";

const typeConfig = {
  enigme: { icon: "extension", label: "Énigme débloquée", color: "text-primary", bg: "bg-primary/10" },
  popup:  { icon: "info",      label: "Point d'intérêt",   color: "text-secondary", bg: "bg-secondary/10" },
  photo:  { icon: "photo_camera", label: "Moment souvenir", color: "text-tertiary", bg: "bg-tertiary/10" },
  bonus:  { icon: "stars",     label: "Bonus découvert",   color: "text-primary", bg: "bg-primary/10" },
};

interface Props {
  event: GeofenceEvent;
  onDismiss: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

export default function GeofencePopup({ event, onDismiss, onAction, actionLabel }: Props) {
  const { zone } = event;
  const cfg = typeConfig[zone.type];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8" style={{ background: "rgba(44,26,0,0.4)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md rounded-3xl p-6 shadow-2xl animate-slide-up"
        style={{ background: "#fff9ed", border: "1px solid rgba(140,122,90,0.25)" }}
      >
        {/* Badge type */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${cfg.bg} mb-4`}>
          <Icon name={cfg.icon} filled className={cfg.color} size={14} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
        </div>

        {/* Distance */}
        <p className="text-on-surface-variant text-xs mb-1">
          Vous êtes à <span className="font-bold text-primary">{event.distance} m</span> de ce point
        </p>

        {/* Title */}
        <h2 className="font-headline font-bold text-xl text-on-surface mb-3 leading-snug">{zone.label}</h2>

        {/* Message */}
        <p className="text-on-surface-variant text-sm leading-relaxed mb-6">{zone.message}</p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {onAction && (
            <button
              onClick={onAction}
              className="w-full py-3.5 rounded-xl cta-gradient font-headline font-bold text-white tap-scale flex items-center justify-center gap-2"
            >
              <Icon name={cfg.icon} size={18} />
              {actionLabel ?? "Ouvrir"}
            </button>
          )}
          <button
            onClick={onDismiss}
            className="w-full py-3 rounded-xl font-headline font-semibold text-on-surface tap-scale text-sm"
            style={{ background: "rgba(226,212,184,0.7)", border: "1px solid rgba(140,122,90,0.2)" }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
