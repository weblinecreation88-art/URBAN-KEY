"use client";

import { useState } from "react";
import { PARCOURS_MEKNES } from "@/data/parcours";
import Icon from "@/components/Icon";

interface TeamResult {
  teamName: string;
  score: number;
  time: string;
  hintsUsed: number;
  stepsCompleted: number;
}

const DEMO_RESULTS: TeamResult[] = [
  { teamName: "Équipe Atlas", score: 820, time: "1h58", hintsUsed: 1, stepsCompleted: 7 },
  { teamName: "Les Explorateurs", score: 750, time: "2h12", hintsUsed: 2, stepsCompleted: 7 },
  { teamName: "Meknès Crew", score: 680, time: "2h30", hintsUsed: 3, stepsCompleted: 6 },
];

export default function ExportPage() {
  const [eventName, setEventName] = useState("Team Building — " + new Date().toLocaleDateString("fr-FR"));
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [teams, setTeams] = useState<TeamResult[]>(DEMO_RESULTS);
  const [generating, setGenerating] = useState(false);

  function addTeam() {
    setTeams(t => [...t, { teamName: `Équipe ${t.length + 1}`, score: 0, time: "—", hintsUsed: 0, stepsCompleted: 0 }]);
  }

  function updateTeam(i: number, key: keyof TeamResult, val: string | number) {
    setTeams(t => t.map((x, idx) => idx === i ? { ...x, [key]: val } : x));
  }

  function removeTeam(i: number) {
    setTeams(t => t.filter((_, idx) => idx !== i));
  }

  async function generatePDF() {
    setGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const W = 210;
      const ocre = [140, 75, 0] as [number, number, number];
      const teal = [41, 103, 103] as [number, number, number];
      const cream = [255, 249, 237] as [number, number, number];
      const brown = [44, 26, 0] as [number, number, number];

      // Background
      pdf.setFillColor(...cream);
      pdf.rect(0, 0, W, 297, "F");

      // Header band
      pdf.setFillColor(...ocre);
      pdf.rect(0, 0, W, 40, "F");

      // Title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.text("UrbanKey — Rapport Corporate", W / 2, 18, { align: "center" });

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(PARCOURS_MEKNES.title, W / 2, 27, { align: "center" });

      pdf.setFontSize(9);
      pdf.text(eventName, W / 2, 35, { align: "center" });

      // Meta info
      pdf.setTextColor(...brown);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      let y = 52;
      const infoItems = [
        ["Date", new Date(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })],
        ["Parcours", PARCOURS_MEKNES.title],
        ["Ville", PARCOURS_MEKNES.city],
        ["Durée nominale", PARCOURS_MEKNES.duration],
        ["Équipes", String(teams.length)],
        ["Étapes totales", String(PARCOURS_MEKNES.steps.filter(s => !s.isBonus).length)],
      ];
      infoItems.forEach(([k, v]) => {
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...ocre);
        pdf.text(k + " :", 15, y);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...brown);
        pdf.text(v, 55, y);
        y += 7;
      });

      // Divider
      y += 4;
      pdf.setDrawColor(...ocre);
      pdf.setLineWidth(0.5);
      pdf.line(15, y, W - 15, y);
      y += 8;

      // Classement
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...ocre);
      pdf.text("Classement des équipes", 15, y);
      y += 8;

      // Table header
      const cols = [15, 70, 110, 140, 165];
      const headers = ["Équipe", "Score", "Temps", "Indices", "Étapes"];
      pdf.setFillColor(...ocre);
      pdf.setTextColor(255, 255, 255);
      pdf.rect(14, y - 5, W - 28, 8, "F");
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      headers.forEach((h, i) => pdf.text(h, cols[i], y));
      y += 6;

      // Sort by score desc
      const sorted = [...teams].sort((a, b) => b.score - a.score);
      sorted.forEach((t, i) => {
        const isEven = i % 2 === 0;
        if (isEven) {
          pdf.setFillColor(245, 234, 214);
          pdf.rect(14, y - 4, W - 28, 7, "F");
        }
        pdf.setTextColor(...brown);
        pdf.setFont("helvetica", i === 0 ? "bold" : "normal");
        pdf.setFontSize(9);

        // Medal for top 3
        const medal = i === 0 ? "🥇 " : i === 1 ? "🥈 " : i === 2 ? "🥉 " : `${i + 1}. `;
        pdf.text(`${i + 1}. ${t.teamName}`, cols[0], y);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...(i === 0 ? ocre : teal));
        pdf.text(String(t.score), cols[1], y);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...brown);
        pdf.text(t.time, cols[2], y);
        pdf.text(String(t.hintsUsed), cols[3], y);
        pdf.text(`${t.stepsCompleted}/${PARCOURS_MEKNES.steps.filter(s => !s.isBonus).length}`, cols[4], y);
        y += 7;
      });

      y += 10;
      // Winner highlight
      if (sorted.length > 0) {
        const winner = sorted[0];
        pdf.setFillColor(140, 75, 0, 15);
        pdf.setFillColor(252, 243, 220);
        pdf.rect(14, y - 5, W - 28, 18, "F");
        pdf.setDrawColor(...ocre);
        pdf.setLineWidth(0.3);
        pdf.rect(14, y - 5, W - 28, 18, "S");

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...ocre);
        pdf.text("Félicitations à l'équipe gagnante !", W / 2, y + 2, { align: "center" });
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...brown);
        pdf.text(winner.teamName, W / 2, y + 10, { align: "center" });
        y += 24;
      }

      // Steps summary
      y += 4;
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...ocre);
      pdf.text("Résumé des étapes", 15, y);
      y += 8;

      PARCOURS_MEKNES.steps.filter(s => !s.isBonus).forEach(step => {
        if (y > 270) {
          pdf.addPage();
          pdf.setFillColor(...cream);
          pdf.rect(0, 0, W, 297, "F");
          y = 20;
        }
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...teal);
        pdf.text(`Étape ${Math.floor(step.order)} — ${step.title}`, 15, y);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...brown);
        const wrapped = pdf.splitTextToSize(step.lieu + " · " + step.type, W - 30);
        pdf.text(wrapped, 15, y + 4);
        y += 4 + wrapped.length * 5 + 3;
      });

      // Footer
      const totalPages = pdf.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        pdf.setFontSize(7);
        pdf.setTextColor(154, 122, 80);
        pdf.text(`UrbanKey — ${PARCOURS_MEKNES.city} · Rapport généré le ${new Date().toLocaleDateString("fr-FR")} · Page ${p}/${totalPages}`, W / 2, 292, { align: "center" });
      }

      pdf.save(`urbankey-rapport-${date}.pdf`);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <p className="text-[10px] uppercase font-bold tracking-widest text-secondary mb-1">Export</p>
        <h1 className="font-headline font-bold text-2xl text-primary">Rapport Corporate PDF</h1>
        <p className="text-on-surface-variant text-sm mt-1">Génère un rapport de débrief pour les sessions team building.</p>
      </div>

      {/* Event info */}
      <div className="parchment-card rounded-2xl p-5 space-y-4 mb-5">
        <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Informations de la session</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2">Nom de l&apos;événement</p>
            <input value={eventName} onChange={e => setEventName(e.target.value)}
              className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2">Date</p>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
        </div>
      </div>

      {/* Teams */}
      <div className="parchment-card rounded-2xl overflow-hidden mb-5">
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(140,122,90,0.15)" }}>
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Équipes & résultats</p>
          <button onClick={addTeam}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cta-gradient text-white tap-scale">
            <Icon name="add" size={14} />
            Ajouter
          </button>
        </div>
        <div className="p-4 space-y-3">
          {teams.map((t, i) => (
            <div key={i} className="grid grid-cols-5 gap-2 items-center">
              <input value={t.teamName} onChange={e => updateTeam(i, "teamName", e.target.value)}
                placeholder="Nom équipe" className="col-span-2 bg-surface-container-low rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
              <input type="number" value={t.score} onChange={e => updateTeam(i, "score", Number(e.target.value))}
                placeholder="Score" className="bg-surface-container-low rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 text-center" />
              <input value={t.time} onChange={e => updateTeam(i, "time", e.target.value)}
                placeholder="Temps" className="bg-surface-container-low rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 text-center" />
              <button onClick={() => removeTeam(i)}
                className="w-9 h-9 rounded-xl flex items-center justify-center tap-scale justify-self-center"
                style={{ background: "rgba(186,26,26,0.08)" }}>
                <Icon name="delete" className="text-error" size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button onClick={generatePDF} disabled={generating}
        className="w-full py-4 rounded-xl cta-gradient font-headline font-bold text-white tap-scale flex items-center justify-center gap-2 disabled:opacity-60">
        {generating
          ? <Icon name="progress_activity" size={18} className="animate-spin" />
          : <Icon name="picture_as_pdf" size={18} />}
        {generating ? "Génération en cours…" : "Générer le PDF de débrief"}
      </button>
    </div>
  );
}
