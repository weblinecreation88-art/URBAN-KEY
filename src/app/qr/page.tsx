"use client";

import { useState, useEffect, useRef } from "react";
import { PARCOURS_MEKNES } from "@/data/parcours";
import Icon from "@/components/Icon";

// Dynamic import to avoid SSR issues with qrcode library
let QRCode: typeof import("qrcode") | null = null;

export default function QRGeneratorPage() {
  const [loaded, setLoaded] = useState(false);
  const [selectedStep, setSelectedStep] = useState(PARCOURS_MEKNES.steps[0]);
  const [baseUrl, setBaseUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setBaseUrl(window.location.origin);
    import("qrcode").then(m => {
      QRCode = m;
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded && selectedStep) generateQR();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, selectedStep, baseUrl]);

  async function generateQR() {
    if (!QRCode || !canvasRef.current) return;
    setGenerating(true);
    const url = `${baseUrl}/enigma/${selectedStep.id}`;
    await QRCode.toCanvas(canvasRef.current, url, {
      width: 280,
      margin: 2,
      color: { dark: "#2c1a00", light: "#fff9ed" },
      errorCorrectionLevel: "H",
    });
    setGenerating(false);
  }

  function downloadQR() {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `qr-${selectedStep.id}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }

  async function printAll() {
    if (!QRCode) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const steps = PARCOURS_MEKNES.steps;
    const items: string[] = [];

    for (const step of steps) {
      const url = `${baseUrl}/enigma/${step.id}`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 200, margin: 2,
        color: { dark: "#2c1a00", light: "#fff9ed" },
        errorCorrectionLevel: "H",
      });
      items.push(`
        <div style="break-inside:avoid;display:inline-block;border:1px solid #cdbf9e;border-radius:12px;padding:16px;margin:8px;text-align:center;background:#fff9ed;width:220px;vertical-align:top">
          <img src="${dataUrl}" style="width:180px;height:180px" />
          <p style="font-family:sans-serif;font-size:11px;font-weight:bold;color:#8c4b00;margin:8px 0 2px">${step.isBonus ? "BONUS" : `Étape ${Math.floor(step.order)}`}</p>
          <p style="font-family:sans-serif;font-size:13px;font-weight:900;color:#2c1a00;margin:0 0 4px">${step.title}</p>
          <p style="font-family:sans-serif;font-size:9px;color:#5c3d1e;margin:0">${step.lieu}</p>
          <p style="font-family:mono,monospace;font-size:8px;color:#9a7a50;margin:4px 0 0;word-break:break-all">${`${baseUrl}/enigma/${step.id}`.replace(baseUrl, "")}</p>
        </div>
      `);
    }

    printWindow.document.write(`
      <html><head><title>QR Codes — UrbanKey Meknès</title>
      <style>body{background:#f5ead6;padding:20px;text-align:center}h1{font-family:sans-serif;color:#8c4b00;margin-bottom:20px}@media print{body{background:white}}</style>
      </head><body>
      <h1>QR Codes — ${PARCOURS_MEKNES.title}</h1>
      <div>${items.join("")}</div>
      <script>window.onload=()=>window.print()</script>
      </body></html>
    `);
    printWindow.document.close();
  }

  const mainSteps = PARCOURS_MEKNES.steps.filter(s => !s.isBonus);
  const bonusSteps = PARCOURS_MEKNES.steps.filter(s => s.isBonus);

  return (
    <div className="min-h-dvh bg-background pb-10">
      {/* Header */}
      <header className="sticky top-0 z-10 px-5 py-4 flex items-center gap-3"
        style={{ background: "rgba(255,249,237,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(140,122,90,0.15)" }}>
        <div className="flex-1">
          <p className="text-[10px] uppercase font-bold tracking-widest text-secondary">Générateur QR</p>
          <h1 className="font-headline font-bold text-primary text-lg leading-tight">QR Codes parcours</h1>
        </div>
        <button onClick={printAll}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm tap-scale"
          style={{ background: "rgba(41,103,103,0.12)", color: "#296767" }}>
          <Icon name="print" size={16} />
          Imprimer tout
        </button>
      </header>

      <div className="px-5 mt-5 space-y-5">
        {/* Step selector */}
        <div className="parchment-card rounded-2xl p-4">
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-3">Sélectionner une étape</p>
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Étapes principales</p>
            {mainSteps.map(s => (
              <button key={s.id} onClick={() => setSelectedStep(s)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all"
                style={{ background: selectedStep.id === s.id ? "rgba(140,75,0,0.12)" : "transparent" }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                  style={{ background: selectedStep.id === s.id ? "#8c4b00" : "#cdbf9e" }}>
                  {Math.floor(s.order)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${selectedStep.id === s.id ? "text-primary" : "text-on-surface"}`}>{s.title}</p>
                  <p className="text-on-surface-variant text-[10px] truncate">{s.lieu}</p>
                </div>
                {selectedStep.id === s.id && <Icon name="check" className="text-primary shrink-0" size={16} />}
              </button>
            ))}
            <p className="text-[10px] font-bold text-secondary uppercase tracking-wider mt-3">Étapes bonus</p>
            {bonusSteps.map(s => (
              <button key={s.id} onClick={() => setSelectedStep(s)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all"
                style={{ background: selectedStep.id === s.id ? "rgba(201,122,0,0.12)" : "transparent" }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                  style={{ background: selectedStep.id === s.id ? "#c97a00" : "#cdbf9e" }}>
                  B
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${selectedStep.id === s.id ? "text-secondary" : "text-on-surface"}`}>{s.title}</p>
                  <p className="text-on-surface-variant text-[10px] truncate">{s.lieu}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* QR preview */}
        <div className="parchment-card rounded-2xl p-5 flex flex-col items-center gap-4">
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant self-start">Aperçu QR</p>

          <div className="p-4 rounded-2xl" style={{ background: "#fff9ed", border: "2px solid rgba(140,122,90,0.3)" }}>
            {generating || !loaded
              ? <div className="w-[280px] h-[280px] flex items-center justify-center">
                  <Icon name="progress_activity" className="text-primary animate-spin" size={32} />
                </div>
              : <canvas ref={canvasRef} className="rounded-xl" />
            }
          </div>

          <div className="text-center">
            <p className="font-headline font-bold text-on-surface">{selectedStep.title}</p>
            <p className="text-on-surface-variant text-xs mt-1">{selectedStep.lieu}</p>
            <p className="text-[10px] font-mono text-on-surface-variant/60 mt-1 break-all">
              {baseUrl}/enigma/{selectedStep.id}
            </p>
            {selectedStep.qrCodePosition && (
              <div className="mt-3 px-3 py-2 rounded-lg inline-flex items-center gap-2"
                style={{ background: "rgba(140,122,90,0.1)" }}>
                <Icon name="place" className="text-secondary" size={12} />
                <span className="text-[10px] text-on-surface-variant">{selectedStep.qrCodePosition}</span>
              </div>
            )}
          </div>

          <button onClick={downloadQR}
            className="w-full py-3.5 rounded-xl cta-gradient font-headline font-bold text-white tap-scale flex items-center justify-center gap-2">
            <Icon name="file_download" size={18} />
            Télécharger PNG
          </button>
        </div>

        {/* Info */}
        <div className="parchment-card rounded-2xl p-4 space-y-2">
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Instructions</p>
          {[
            "Imprimez chaque QR code et plastifiez-le pour la résistance aux intempéries.",
            "Fixez le QR code à l'emplacement indiqué dans la fiche terrain.",
            "Testez chaque code avec un smartphone avant la première session.",
            "Le check-in OTA utilise le token /checkin?token=uk-meknes-imperial",
          ].map((t, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0 mt-0.5"
                style={{ background: "#8c4b00" }}>{i + 1}</span>
              <p className="text-on-surface-variant text-xs leading-relaxed">{t}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
