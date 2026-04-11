"use client";

import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";

const topPlayers = [
  { rank: 1, name: "VOID_WALKER", team: "Shadow Division", score: 128400, medals: 14, gradient: "rank-gradient-1", border: "border-secondary/30" },
  { rank: 2, name: "NEON_GHOST", team: "Infiltration Spec", score: 115220, medals: 12, gradient: "rank-gradient-2", border: "border-primary/20" },
  { rank: 3, name: "SILVER_PULSE", team: "Data Scavenger", score: 98050, medals: 9, gradient: "rank-gradient-3", border: "border-tertiary/20" },
];

const normalPlayers = [
  { rank: 4, name: "ECHO_REBEL", score: 84300 },
  { rank: 5, name: "CIPHER_01", score: 79150 },
];

export default function LeaderboardPage() {
  return (
    <div className="min-h-dvh bg-surface text-on-surface pb-24 font-body">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-background flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-3">
          <Icon name="menu" className="text-primary cursor-pointer" />
          <h1 className="text-xl font-extrabold tracking-tighter text-primary uppercase font-headline drop-shadow-[0_0_8px_rgba(162,207,206,0.4)]">
            URBAN NOCTURNE
          </h1>
        </div>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center" style={{ border: "1px solid rgba(162,207,206,0.3)" }}>
          <Icon name="person" filled className="text-primary" size={18} />
        </div>
      </header>

      <main className="pt-20 px-4 max-w-md mx-auto">
        {/* User hero card */}
        <section className="mt-4 mb-8">
          <div className="bg-surface-container-high rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-secondary/50 p-0.5">
                  <div className="w-full h-full bg-surface-container-highest rounded-xl flex items-center justify-center">
                    <Icon name="person" filled className="text-secondary" size={30} />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-secondary text-on-secondary px-2 py-0.5 rounded text-[10px] font-bold tracking-tighter">
                  LVL 24
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Active Signal</span>
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                </div>
                <h2 className="text-xl font-black font-headline text-on-surface tracking-tight uppercase">
                  OPERATOR_042
                </h2>
                <p className="text-on-surface-variant text-sm">
                  Classement global : <span className="text-primary">#1 284</span>
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4" style={{ borderTop: "1px solid rgba(64,72,72,0.2)" }}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Score total</p>
                <p className="text-lg font-bold font-headline text-on-surface">42 850 <span className="text-xs text-primary/60">XP</span></p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Rang Ville</p>
                <p className="text-lg font-bold font-headline text-secondary">#12 <span className="text-[10px] text-on-surface-variant font-normal">Meknès</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs + filters */}
        <div className="flex justify-between items-center gap-4 mb-6">
          <div className="flex p-1 bg-surface-container-low rounded-lg gap-1">
            <button className="px-5 py-2 rounded-md bg-surface-container-highest text-secondary text-xs font-bold uppercase tracking-widest">
              Global
            </button>
            <button className="px-5 py-2 rounded-md text-on-surface-variant text-xs font-bold uppercase tracking-widest">
              Amis
            </button>
          </div>
          <div
            className="flex items-center px-4 py-2 rounded-full cursor-pointer"
            style={{ background: "rgba(32,43,58,1)" }}
          >
            <Icon name="location_on" className="text-primary" size={16} />
            <span className="text-xs font-bold uppercase tracking-tight text-on-surface ml-2">Meknès</span>
          </div>
        </div>

        {/* Top 3 */}
        <div className="flex flex-col gap-3 mb-2">
          {topPlayers.map((p) => (
            <div
              key={p.rank}
              className={`flex items-center justify-between p-4 bg-surface-container rounded-xl hover:scale-[1.01] transition-transform cursor-pointer`}
              style={{ borderLeft: `4px solid ${p.rank === 1 ? "#f0be72" : p.rank === 2 ? "#a2cfce" : "#a3caf6"}` }}
            >
              <div className="flex items-center gap-4">
                <div className={`${p.gradient} w-10 h-10 rounded-lg flex items-center justify-center`}>
                  <span className="font-black text-on-secondary italic text-sm">0{p.rank}</span>
                </div>
                <div className="w-11 h-11 rounded-full bg-surface-container-highest flex items-center justify-center" style={{ border: `2px solid ${p.rank === 1 ? "rgba(240,190,114,0.3)" : "rgba(162,207,206,0.2)"}` }}>
                  <Icon name="person" filled className="text-on-surface-variant" size={20} />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-on-surface tracking-tight">{p.name}</h4>
                  <p className="text-[10px] uppercase font-medium text-on-surface-variant tracking-wider">{p.team}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-headline font-bold text-secondary text-base">{p.score.toLocaleString()}</p>
                <div className="flex items-center justify-end gap-1">
                  <Icon name="military_tech" filled className="text-primary" size={12} />
                  <span className="text-[10px] text-on-surface-variant font-bold">{p.medals} MÉDAILLES</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Normal ranks */}
        <div className="flex flex-col gap-2 mt-2">
          {normalPlayers.map((p) => (
            <div key={p.rank} className="flex items-center justify-between p-3 px-6 bg-surface-container-low/50 hover:bg-surface-container rounded-lg transition-colors">
              <div className="flex items-center gap-6">
                <span className="w-6 text-on-surface-variant font-black italic text-sm">0{p.rank}</span>
                <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center grayscale">
                  <Icon name="person" filled className="text-on-surface-variant" size={18} />
                </div>
                <span className="font-bold text-on-surface-variant/80 tracking-tight">{p.name}</span>
              </div>
              <p className="font-headline font-bold text-on-surface-variant/60">{p.score.toLocaleString()}</p>
            </div>
          ))}

          {/* Self rank */}
          <div className="flex items-center justify-between p-3 px-6 rounded-lg my-2 relative" style={{ background: "rgba(42,53,69,0.6)", border: "1px solid rgba(240,190,114,0.2)" }}>
            <div className="absolute left-0 top-0 h-full w-1 bg-secondary rounded-l-lg" />
            <div className="flex items-center gap-6">
              <span className="w-6 text-secondary font-black italic text-sm">12</span>
              <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center ring-2 ring-secondary ring-offset-2 ring-offset-surface">
                <Icon name="person" filled className="text-secondary" size={18} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-secondary tracking-tight">OPERATOR_042</span>
                <span className="text-[9px] uppercase font-bold text-on-surface-variant tracking-widest">Vous</span>
              </div>
            </div>
            <p className="font-headline font-bold text-secondary">42 850</p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
