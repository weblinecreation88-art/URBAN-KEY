"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PARCOURS_MEKNES } from "@/data/parcours";
import Icon from "@/components/Icon";

type ParcoursStatus = "draft" | "ready" | "published" | "archived";

interface ParcoursDoc {
  id: string;
  title: string;
  city: string;
  difficulty: string;
  duration: string;
  price: number;
  status: ParcoursStatus;
  stepsCount: number;
  createdAt?: { seconds: number };
}

const STATUS_CONFIG: Record<ParcoursStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "Brouillon", color: "#8c4b00", bg: "rgba(140,75,0,0.1)" },
  ready: { label: "Prêt", color: "#c97a00", bg: "rgba(201,122,0,0.1)" },
  published: { label: "Publié", color: "#296767", bg: "rgba(41,103,103,0.12)" },
  archived: { label: "Archivé", color: "#9a7a50", bg: "rgba(154,122,80,0.12)" },
};

export default function ParcoursAdmin() {
  const router = useRouter();
  const [parcoursList, setParcoursList] = useState<ParcoursDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [filter, setFilter] = useState<ParcoursStatus | "all">("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  async function fetchParcours() {
    setLoading(true);
    try {
      const q = query(collection(db, "parcours"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setParcoursList(snap.docs.map(d => ({ id: d.id, ...d.data() } as ParcoursDoc)));
    } catch {
      setParcoursList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchParcours(); }, []);

  async function importFromCode() {
    setImporting(true);
    try {
      await addDoc(collection(db, "parcours"), {
        title: PARCOURS_MEKNES.title,
        city: PARCOURS_MEKNES.city,
        difficulty: PARCOURS_MEKNES.difficulty,
        duration: PARCOURS_MEKNES.duration,
        price: PARCOURS_MEKNES.price,
        currency: PARCOURS_MEKNES.currency,
        status: "published" as ParcoursStatus,
        stepsCount: PARCOURS_MEKNES.steps.length,
        steps: PARCOURS_MEKNES.steps,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await fetchParcours();
    } finally {
      setImporting(false);
    }
  }

  async function updateStatus(id: string, status: ParcoursStatus) {
    await updateDoc(doc(db, "parcours", id), { status, updatedAt: serverTimestamp() });
    setParcoursList(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  }

  async function deleteParcours(id: string) {
    await deleteDoc(doc(db, "parcours", id));
    setParcoursList(prev => prev.filter(p => p.id !== id));
    setDeleteConfirm(null);
  }

  const filtered = filter === "all" ? parcoursList : parcoursList.filter(p => p.status === filter);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-secondary mb-1">CMS</p>
          <h1 className="font-headline font-bold text-2xl text-primary">Parcours</h1>
          <p className="text-on-surface-variant text-sm mt-1">{parcoursList.length} parcours au total</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={importFromCode}
            disabled={importing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm tap-scale"
            style={{ background: "rgba(41,103,103,0.12)", color: "#296767", border: "1px solid rgba(41,103,103,0.2)" }}
          >
            {importing
              ? <Icon name="progress_activity" size={16} className="animate-spin" />
              : <Icon name="download" size={16} />}
            Importer Meknès
          </button>
          <button
            onClick={() => router.push("/admin/parcours/new")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white tap-scale cta-gradient"
          >
            <Icon name="add" size={16} />
            Nouveau
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(["all", "draft", "ready", "published", "archived"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
            style={{
              background: filter === f ? "#8c4b00" : "rgba(140,122,90,0.1)",
              color: filter === f ? "#fff" : "#5c3d1e",
            }}
          >
            {f === "all" ? "Tous" : STATUS_CONFIG[f].label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Icon name="progress_activity" className="text-primary animate-spin" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="parchment-card rounded-2xl p-10 text-center">
          <Icon name="map" className="text-on-surface-variant mx-auto mb-3" size={40} />
          <p className="font-headline font-bold text-on-surface mb-1">Aucun parcours</p>
          <p className="text-on-surface-variant text-sm mb-4">Importez le parcours Meknès ou créez-en un nouveau.</p>
          <button onClick={importFromCode} disabled={importing}
            className="px-5 py-2.5 rounded-xl cta-gradient font-bold text-white text-sm tap-scale inline-flex items-center gap-2">
            <Icon name="download" size={16} />
            Importer Meknès
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.draft;
            return (
              <div key={p.id} className="parchment-card rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(140,75,0,0.1)" }}>
                    <Icon name="map" className="text-primary" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-headline font-bold text-on-surface text-base">{p.title}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide"
                        style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-on-surface-variant flex-wrap">
                      <span className="flex items-center gap-1"><Icon name="location_on" size={11} />{p.city}</span>
                      <span className="flex items-center gap-1"><Icon name="schedule" size={11} />{p.duration}</span>
                      <span className="flex items-center gap-1"><Icon name="signal_cellular_alt" size={11} />{p.difficulty}</span>
                      <span className="flex items-center gap-1"><Icon name="route" size={11} />{p.stepsCount} étapes</span>
                      <span className="flex items-center gap-1"><Icon name="payments" size={11} />{p.price} MAD</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Status change */}
                    <select
                      value={p.status}
                      onChange={(e) => updateStatus(p.id, e.target.value as ParcoursStatus)}
                      className="text-[11px] font-bold rounded-lg px-2 py-1 outline-none cursor-pointer"
                      style={{ background: cfg.bg, color: cfg.color, border: "none" }}
                    >
                      <option value="draft">Brouillon</option>
                      <option value="ready">Prêt</option>
                      <option value="published">Publié</option>
                      <option value="archived">Archivé</option>
                    </select>

                    <button
                      onClick={() => router.push(`/admin/parcours/${p.id}`)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center tap-scale"
                      style={{ background: "rgba(140,75,0,0.1)" }}
                      title="Éditer"
                    >
                      <Icon name="edit" className="text-primary" size={15} />
                    </button>

                    <button
                      onClick={() => setDeleteConfirm(p.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center tap-scale"
                      style={{ background: "rgba(186,26,26,0.08)" }}
                      title="Supprimer"
                    >
                      <Icon name="delete" className="text-error" size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(44,26,0,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="parchment-card rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <Icon name="warning" className="text-error mb-3" size={32} />
            <h3 className="font-headline font-bold text-on-surface text-lg mb-2">Supprimer ce parcours ?</h3>
            <p className="text-on-surface-variant text-sm mb-5">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-on-surface"
                style={{ background: "rgba(226,212,184,0.7)" }}>
                Annuler
              </button>
              <button onClick={() => deleteParcours(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white"
                style={{ background: "#ba1a1a" }}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
