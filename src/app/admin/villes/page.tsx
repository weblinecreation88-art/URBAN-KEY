"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Icon from "@/components/Icon";

interface Ville {
  id: string;
  name: string;
  country: string;
  status: "active" | "coming" | "archived";
  parcoursCount: number;
  lat: number;
  lng: number;
}

const STATUS_CONFIG = {
  active: { label: "Active", color: "#296767", bg: "rgba(41,103,103,0.12)" },
  coming: { label: "À venir", color: "#c97a00", bg: "rgba(201,122,0,0.1)" },
  archived: { label: "Archivée", color: "#9a7a50", bg: "rgba(154,122,80,0.12)" },
};

const SEED_VILLES = [
  { name: "Meknès", country: "Maroc", status: "active" as const, parcoursCount: 1, lat: 33.8953, lng: -5.5524 },
  { name: "Fès", country: "Maroc", status: "coming" as const, parcoursCount: 0, lat: 34.0181, lng: -5.0078 },
  { name: "Marrakech", country: "Maroc", status: "coming" as const, parcoursCount: 0, lat: 31.6295, lng: -7.9811 },
  { name: "Rabat", country: "Maroc", status: "coming" as const, parcoursCount: 0, lat: 33.9716, lng: -6.8498 },
];

export default function VillesAdmin() {
  const [villes, setVilles] = useState<Ville[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", country: "Maroc", lat: "", lng: "" });

  async function fetch() {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "villes"));
      setVilles(snap.docs.map(d => ({ id: d.id, ...d.data() } as Ville)));
    } finally { setLoading(false); }
  }

  useEffect(() => { fetch(); }, []);

  async function seed() {
    setSeeding(true);
    try {
      for (const v of SEED_VILLES) {
        await addDoc(collection(db, "villes"), { ...v, createdAt: serverTimestamp() });
      }
      await fetch();
    } finally { setSeeding(false); }
  }

  async function addVille() {
    if (!form.name) return;
    await addDoc(collection(db, "villes"), {
      name: form.name, country: form.country,
      lat: Number(form.lat), lng: Number(form.lng),
      status: "coming", parcoursCount: 0,
      createdAt: serverTimestamp(),
    });
    setForm({ name: "", country: "Maroc", lat: "", lng: "" });
    setShowForm(false);
    await fetch();
  }

  async function toggleStatus(v: Ville) {
    const next: Ville["status"] = v.status === "active" ? "coming" : v.status === "coming" ? "archived" : "active";
    await updateDoc(doc(db, "villes", v.id), { status: next });
    setVilles(prev => prev.map(x => x.id === v.id ? { ...x, status: next } : x));
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-secondary mb-1">CMS</p>
          <h1 className="font-headline font-bold text-2xl text-primary">Villes</h1>
          <p className="text-on-surface-variant text-sm mt-1">{villes.length} ville(s) configurée(s)</p>
        </div>
        <div className="flex gap-2">
          {villes.length === 0 && (
            <button onClick={seed} disabled={seeding}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm tap-scale"
              style={{ background: "rgba(41,103,103,0.12)", color: "#296767" }}>
              {seeding ? <Icon name="progress_activity" size={16} className="animate-spin" /> : <Icon name="download" size={16} />}
              Initialiser
            </button>
          )}
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl cta-gradient font-bold text-sm text-white tap-scale">
            <Icon name="add" size={16} />
            Ajouter
          </button>
        </div>
      </div>

      {showForm && (
        <div className="parchment-card rounded-2xl p-5 mb-5 space-y-3">
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Nouvelle ville</p>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Nom de la ville" className="bg-surface-container-low rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
            <input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
              placeholder="Pays" className="bg-surface-container-low rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
            <input type="number" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))}
              placeholder="Latitude" className="bg-surface-container-low rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
            <input type="number" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: e.target.value }))}
              placeholder="Longitude" className="bg-surface-container-low rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: "rgba(226,212,184,0.7)", color: "#5c3d1e" }}>Annuler</button>
            <button onClick={addVille} className="flex-1 py-2.5 rounded-xl cta-gradient font-bold text-sm text-white tap-scale">
              Ajouter
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Icon name="progress_activity" className="text-primary animate-spin" size={32} />
        </div>
      ) : villes.length === 0 ? (
        <div className="parchment-card rounded-2xl p-10 text-center">
          <Icon name="location_city" className="text-on-surface-variant mx-auto mb-3" size={40} />
          <p className="font-headline font-bold text-on-surface mb-1">Aucune ville</p>
          <p className="text-on-surface-variant text-sm mb-4">Initialisez la liste des villes pilote.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {villes.map(v => {
            const cfg = STATUS_CONFIG[v.status];
            return (
              <div key={v.id} className="parchment-card rounded-2xl px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(140,75,0,0.1)" }}>
                  <Icon name="location_city" className="text-primary" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-headline font-bold text-on-surface">{v.name}</p>
                  <p className="text-on-surface-variant text-[11px]">{v.country} · {v.parcoursCount} parcours · {v.lat?.toFixed(4)}, {v.lng?.toFixed(4)}</p>
                </div>
                <button onClick={() => toggleStatus(v)}
                  className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide"
                  style={{ background: cfg.bg, color: cfg.color }}>
                  {cfg.label}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
