"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";

const topPlayers = [
  { rank: 1, name: "VOID_WALKER", team: "Meknès", score: 128400, medals: 14 },
  { rank: 2, name: "NEON_GHOST", team: "Meknès", score: 115220, medals: 12 },
  { rank: 3, name: "SILVER_PULSE", team: "Meknès", score: 98050, medals: 9 },
];

const normalPlayers = [
  { rank: 4, name: "ECHO_REBEL", score: 84300 },
  { rank: 5, name: "CIPHER_01", score: 79150 },
];

const rankColors = ["#c97a30", "#296767", "#8b2a00"];

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"global" | "amis">("global");

  return (
    <div className="min-h-dvh bg-background text-on-background pb-24">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 flex justify-between items-center px-6 h-16"
        style={{ background: "rgba(255,249,237,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(140,122,90,0.15)" }}
      >
        <div className="flex items-center gap-2">
          <Icon name="explore" filled className="text-primary" size={22} />
          <h1 className="text-xl font-black text-primary tracking-tighter font-headline">UrbanKey</h1>
        </div>
        <Link href="/profile">
          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center" style={{ border: "1px solid rgba(140,122,90,0.3)" }}>
            <Icon name="person" className="text-primary" size={18} />
          </div>
        </Link>
      </header>

      <main className="pt-20 px-5">
        {/* User hero card */}
        <section className="mt-4 mb-6">
          <div className="parchment-card rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl" style={{ background: "rgba(201,122,48,0.1)" }} />
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-surface-container-high flex items-center justify-center" style={{ border: "2px solid rgba(140,75,0,0.3)" }}>
                  <Icon name="person" filled className="text-primary" size={28} />
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 bg-primary text-white px-1.5 py-0.5 rounded text-[9px] font-black">
                  LVL 1
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-0.5">Explorateur</p>
                <h2 className="text-lg font-headline font-bold text-on-surface leading-tight">OPERATOR_042</h2>
                <p className="text-on-surface-variant text-xs">Rang global : <span className="text-primary font-bold">#1 284</span></p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4" style={{ borderTop: "1px solid rgba(140,122,90,0.2)" }}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">Score total</p>
                <p className="text-lg font-headline font-bold text-on-surface">42 850 <span className="text-xs text-primary/60">XP</span></p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">Rang ville</p>
                <p className="text-lg font-headline font-bold text-primary">#12 <span className="text-[10px] text-on-surface-variant font-normal">Meknès</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs + filtre ville */}
        <div className="flex justify-between items-center gap-4 mb-5">
          <div className="flex p-1 rounded-xl gap-1" style={{ background: "rgba(226,212,184,0.6)" }}>
            <button
              onClick={() => setTab("global")}
              className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest tap-scale transition-all ${
                tab === "global" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"
              }`}
            >
              Global
            </button>
            <button
              onClick={() => setTab("amis")}
              className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest tap-scale transition-all ${
                tab === "amis" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"
              }`}
            >
              Amis
            </button>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-surface-container-high tap-scale" style={{ border: "1px solid rgba(140,122,90,0.25)" }}>
            <Icon name="location_on" className="text-primary" size={14} />
            <span className="text-xs font-bold uppercase tracking-tight text-on-surface">Meknès</span>
          </div>
        </div>

        {/* Top 3 */}
        <div className="flex flex-col gap-3 mb-2">
          {topPlayers.map((p, i) => (
            <div key={p.rank} className="parchment-card rounded-xl p-4 flex items-center justify-between"
              style={{ borderLeft: `3px solid ${rankColors[i]}` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-sm"
                  style={{ background: `linear-gradient(135deg, ${rankColors[i]}cc, ${rankColors[i]})` }}
                >
                  0{p.rank}
                </div>
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center" style={{ border: `1.5px solid ${rankColors[i]}50` }}>
                  <Icon name="person" filled className="text-on-surface-variant" size={20} />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-on-surface text-sm">{p.name}</h4>
                  <p className="text-[10px] text-on-surface-variant">{p.team} · {p.medals} médailles</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-headline font-bold text-on-surface text-sm">{p.score.toLocaleString()}</p>
                <p className="text-[10px] text-on-surface-variant">XP</p>
              </div>
            </div>
          ))}
        </div>

        {/* Rangs normaux */}
        <div className="flex flex-col gap-2 mt-2">
          {normalPlayers.map((p) => (
            <div key={p.rank} className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-container-low"
              style={{ border: "1px solid rgba(140,122,90,0.15)" }}
            >
              <div className="flex items-center gap-4">
                <span className="w-6 text-on-surface-variant font-black text-sm">0{p.rank}</span>
                <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center">
                  <Icon name="person" filled className="text-on-surface-variant" size={18} />
                </div>
                <span className="font-medium text-on-surface text-sm">{p.name}</span>
              </div>
              <p className="font-headline font-bold text-on-surface-variant text-sm">{p.score.toLocaleString()}</p>
            </div>
          ))}

          {/* Self */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl my-1 relative"
            style={{ background: "rgba(201,122,48,0.08)", border: "1.5px solid rgba(140,75,0,0.3)" }}
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-primary rounded-l-xl" />
            <div className="flex items-center gap-4">
              <span className="w-6 text-primary font-black text-sm">12</span>
              <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center" style={{ border: "2px solid rgba(140,75,0,0.4)" }}>
                <Icon name="person" filled className="text-primary" size={18} />
              </div>
              <div>
                <span className="font-bold text-primary text-sm">OPERATOR_042</span>
                <p className="text-[9px] uppercase font-bold text-on-surface-variant tracking-widest">Vous</p>
              </div>
            </div>
            <p className="font-headline font-bold text-primary">42 850</p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
