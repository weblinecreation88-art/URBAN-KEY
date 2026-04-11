"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

type ARState = "scanning" | "detected" | "success";

export default function ARPage() {
  const router = useRouter();
  const [arState, setArState] = useState<ARState>("scanning");

  function simulate() {
    setArState("detected");
    setTimeout(() => setArState("success"), 1500);
  }

  return (
    <div className="h-dvh w-full bg-black relative overflow-hidden">
      {/* Simulated camera feed */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800&q=80"
          alt="Camera feed"
          className="w-full h-full object-cover opacity-70"
        />
      </div>

      {/* Header overlay */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 pt-12 pb-4"
        style={{ background: "linear-gradient(to bottom, rgba(8,20,34,0.8), transparent)" }}
      >
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full flex items-center justify-center tap-scale"
          style={{ background: "rgba(32,43,58,0.7)", backdropFilter: "blur(12px)" }}
        >
          <Icon name="arrow_back" className="text-primary" />
        </button>
        <div className="px-4 py-2 rounded-full flex items-center gap-2"
          style={{ background: "rgba(32,43,58,0.7)", backdropFilter: "blur(12px)" }}
        >
          <div className={`w-2 h-2 rounded-full ${arState === "success" ? "bg-primary" : "bg-secondary animate-pulse"}`} />
          <span className="text-on-surface text-xs font-bold uppercase tracking-wider">
            {arState === "scanning" ? "Scanner en cours…" : arState === "detected" ? "Marker détecté !" : "Objet trouvé !"}
          </span>
        </div>
        <button className="w-10 h-10 rounded-full flex items-center justify-center tap-scale"
          style={{ background: "rgba(32,43,58,0.7)", backdropFilter: "blur(12px)" }}
        >
          <Icon name="flash_off" className="text-primary" />
        </button>
      </header>

      {/* AR viewfinder */}
      {arState === "scanning" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-56 h-56">
            {/* Corner brackets */}
            {["top-left", "top-right", "bottom-left", "bottom-right"].map((pos) => (
              <div
                key={pos}
                className={`absolute w-8 h-8 border-secondary ${
                  pos === "top-left" ? "top-0 left-0 border-t-2 border-l-2" :
                  pos === "top-right" ? "top-0 right-0 border-t-2 border-r-2" :
                  pos === "bottom-left" ? "bottom-0 left-0 border-b-2 border-l-2" :
                  "bottom-0 right-0 border-b-2 border-r-2"
                }`}
              />
            ))}
            {/* Center crosshair */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-0.5 bg-secondary/60" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-0.5 h-4 bg-secondary/60" />
            </div>
          </div>
        </div>
      )}

      {/* Detected state — grid overlay */}
      {arState === "detected" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-72 h-72 relative">
            <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 100 100">
              {Array.from({ length: 6 }).map((_, i) =>
                Array.from({ length: 6 }).map((_, j) => (
                  <circle key={`${i}-${j}`} cx={10 + i * 16} cy={10 + j * 16} r="2" fill="#a2cfce" />
                ))
              )}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center glow-primary animate-pulse">
                <Icon name="qr_code_scanner" filled className="text-primary" size={36} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success overlay */}
      {arState === "success" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center glow-primary">
              <Icon name="check_circle" filled className="text-primary" size={56} />
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-6 bg-secondary rounded-full opacity-80"
                  style={{
                    height: `${8 + Math.random() * 20}px`,
                    animationDelay: `${i * 50}ms`,
                  }}
                />
              ))}
            </div>
            <span className="text-on-surface font-headline font-bold text-xl text-glow-secondary">
              Objet Trouvé !
            </span>
          </div>
        </div>
      )}

      {/* Instructions bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 px-6 pb-10 pt-6 flex flex-col gap-4"
        style={{ background: "linear-gradient(to top, rgba(8,20,34,0.95), transparent)" }}
      >
        {arState === "scanning" && (
          <>
            <p className="text-on-surface-variant text-center text-sm">
              Pointe ton téléphone vers le <span className="text-secondary font-bold">QR code</span> ou le <span className="text-primary font-bold">marker AR</span>
            </p>
            <button onClick={simulate} className="w-full py-4 rounded-xl cta-gradient font-headline font-bold text-on-primary-fixed tap-scale">
              Simuler la détection
            </button>
          </>
        )}
        {arState === "detected" && (
          <p className="text-primary text-center font-bold animate-pulse">Surface détectée — Marker reconnu…</p>
        )}
        {arState === "success" && (
          <button
            onClick={() => router.push("/enigma/vieux-quartier")}
            className="w-full py-4 rounded-xl cta-gradient font-headline font-bold text-on-primary-fixed tap-scale"
          >
            Valider et passer à l&apos;étape suivante
          </button>
        )}
      </div>
    </div>
  );
}
