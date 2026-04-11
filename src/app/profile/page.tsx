"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";

const purchases = [
  { date: "08 Avr 2026", name: "Vieux quartier — Meknès", amount: "100 MAD", status: "Terminé" },
  { date: "05 Avr 2026", name: "Porte de Bab Mansour", amount: "150 MAD", status: "En cours" },
  { date: "01 Avr 2026", name: "Secrets du Souk", amount: "120 MAD", status: "Terminé" },
];

export default function ProfilePage() {
  const router = useRouter();
  const [lang, setLang] = useState("FR");
  const [tts, setTts] = useState(false);
  const [contrast, setContrast] = useState(false);
  const [fontSize, setFontSize] = useState(50);

  return (
    <div className="min-h-dvh bg-background text-on-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background flex items-center justify-between px-6 h-16">
        <h1 className="font-headline font-bold text-xl text-primary">Mon Profil</h1>
        <button className="tap-scale text-primary p-1">
          <Icon name="settings" size={22} />
        </button>
      </header>

      <main className="px-5 space-y-6">
        {/* Profile card */}
        <section className="bg-surface-container-high rounded-xl p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-highest flex items-center justify-center ring-2 ring-secondary/40">
            <Icon name="person" filled className="text-secondary" size={32} />
          </div>
          <div className="flex-1">
            <h2 className="font-headline font-bold text-xl text-on-surface">OPERATOR_042</h2>
            <p className="text-on-surface-variant text-sm">operator042@urbankey.ma</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded text-[10px] font-bold uppercase tracking-tighter">
                Niveau 24
              </span>
              <span className="text-[10px] text-on-surface-variant">42 850 XP</span>
            </div>
          </div>
          <button className="tap-scale text-primary p-1">
            <Icon name="edit" size={20} />
          </button>
        </section>

        {/* Mes parcours */}
        <section>
          <h3 className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-3">
            Mes parcours
          </h3>
          <div className="space-y-3">
            {purchases.map((p) => (
              <div key={p.name} className="bg-surface-container-high rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-on-surface text-sm leading-tight">{p.name}</p>
                  <p className="text-on-surface-variant text-xs mt-1">{p.date}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    p.status === "Terminé"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary/10 text-secondary"
                  }`}>
                    {p.status}
                  </span>
                  <span className="text-on-surface-variant text-xs">{p.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Préférences */}
        <section>
          <h3 className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-3">
            Préférences
          </h3>
          <div className="bg-surface-container-high rounded-xl overflow-hidden divide-y divide-outline-variant/10">
            {/* Langue */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name="language" className="text-primary" size={20} />
                <span className="text-on-surface text-sm font-medium">Langue</span>
              </div>
              <div className="flex gap-1.5">
                {["FR", "EN", "AR"].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-3 py-1 rounded-full text-xs font-bold tap-scale ${
                      lang === l
                        ? "bg-secondary-container text-on-secondary-container"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {/* TTS */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name="record_voice_over" className="text-primary" size={20} />
                <div>
                  <p className="text-on-surface text-sm font-medium">Lecture audio (TTS)</p>
                  <p className="text-on-surface-variant text-[10px]">Textes lus à voix haute</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={tts} onChange={() => setTts(!tts)} />
                <span className="slider" />
              </label>
            </div>
            {/* Contraste */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name="contrast" className="text-primary" size={20} />
                <div>
                  <p className="text-on-surface text-sm font-medium">Contraste élevé</p>
                  <p className="text-on-surface-variant text-[10px]">Accessibilité visuelle</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={contrast} onChange={() => setContrast(!contrast)} />
                <span className="slider" />
              </label>
            </div>
            {/* Font size */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Icon name="text_fields" className="text-primary" size={20} />
                <p className="text-on-surface text-sm font-medium">Taille de police</p>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: "#f0be72" }}
              />
              <div className="flex justify-between text-[10px] text-on-surface-variant mt-1">
                <span>Petite</span><span>Moyenne</span><span>Grande</span>
              </div>
            </div>
          </div>
        </section>

        {/* Support + déconnexion */}
        <section>
          <div className="bg-surface-container-high rounded-xl overflow-hidden divide-y divide-outline-variant/10">
            <button className="w-full p-4 flex items-center gap-3 tap-scale hover:bg-surface-container-highest transition-colors">
              <Icon name="help" className="text-primary" size={20} />
              <span className="text-on-surface text-sm font-medium">Support & FAQ</span>
              <Icon name="chevron_right" className="text-on-surface-variant ml-auto" size={18} />
            </button>
            <button
              onClick={() => router.push("/onboarding")}
              className="w-full p-4 flex items-center gap-3 tap-scale hover:bg-error-container/20 transition-colors"
            >
              <Icon name="logout" className="text-error" size={20} />
              <span className="text-error text-sm font-medium">Se déconnecter</span>
            </button>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
