"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  doc, getDoc, addDoc, updateDoc, collection, serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PARCOURS_MEKNES, type QuestStep, type StepType } from "@/data/parcours";
import Icon from "@/components/Icon";

type Tab = "infos" | "etapes" | "avance";

interface ParcoursForm {
  title: string;
  subtitle: string;
  city: string;
  duration: string;
  difficulty: "Facile" | "Moyen" | "Difficile";
  price: number;
  currency: string;
  description: string;
  status: "draft" | "ready" | "published" | "archived";
  steps: QuestStep[];
}

const DEFAULT_FORM: ParcoursForm = {
  title: "",
  subtitle: "",
  city: "",
  duration: "2h",
  difficulty: "Moyen",
  price: 100,
  currency: "MAD",
  description: "",
  status: "draft",
  steps: [],
};

const EMPTY_STEP: QuestStep = {
  id: "",
  order: 1,
  title: "",
  lieu: "",
  coords: { lat: 0, lng: 0 },
  qrCodePosition: "",
  enigme: "",
  reponse: "",
  type: "enigme",
  isBonus: false,
  scoreBase: 150,
};

export default function ParcoursEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === "new";
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("infos");
  const [form, setForm] = useState<ParcoursForm>(DEFAULT_FORM);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingStep, setEditingStep] = useState<QuestStep | null>(null);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isNew) return;
    async function load() {
      try {
        const snap = await getDoc(doc(db, "parcours", id));
        if (snap.exists()) {
          const data = snap.data() as ParcoursForm & { steps?: QuestStep[] };
          setForm({ ...DEFAULT_FORM, ...data });
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, isNew]);

  async function save() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        stepsCount: form.steps.length,
        updatedAt: serverTimestamp(),
      };
      if (isNew) {
        const ref = await addDoc(collection(db, "parcours"), { ...payload, createdAt: serverTimestamp() });
        router.replace(`/admin/parcours/${ref.id}`);
      } else {
        await updateDoc(doc(db, "parcours", id), payload);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  function set<K extends keyof ParcoursForm>(key: K, val: ParcoursForm[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function openStepEditor(step: QuestStep, index: number) {
    setEditingStep({ ...step });
    setEditingStepIndex(index);
  }

  function openNewStep() {
    const nextOrder = form.steps.length > 0 ? Math.max(...form.steps.map(s => Math.floor(s.order))) + 1 : 1;
    setEditingStep({ ...EMPTY_STEP, id: `step-${Date.now()}`, order: nextOrder });
    setEditingStepIndex(-1); // -1 = new
  }

  function saveStep() {
    if (!editingStep) return;
    if (editingStepIndex === -1) {
      setForm(f => ({ ...f, steps: [...f.steps, editingStep] }));
    } else if (editingStepIndex !== null) {
      setForm(f => {
        const steps = [...f.steps];
        steps[editingStepIndex] = editingStep;
        return { ...f, steps };
      });
    }
    setEditingStep(null);
    setEditingStepIndex(null);
  }

  function deleteStep(index: number) {
    setForm(f => ({ ...f, steps: f.steps.filter((_, i) => i !== index) }));
  }

  function importMeknesSteps() {
    setForm(f => ({ ...f, steps: PARCOURS_MEKNES.steps }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Icon name="progress_activity" className="text-primary animate-spin" size={32} />
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "infos", label: "Informations", icon: "info" },
    { id: "etapes", label: `Étapes (${form.steps.length})`, icon: "route" },
    { id: "avance", label: "Avancé", icon: "tune" },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl flex items-center justify-center tap-scale"
          style={{ background: "rgba(140,122,90,0.12)" }}>
          <Icon name="arrow_back" className="text-primary" size={18} />
        </button>
        <div className="flex-1">
          <p className="text-[10px] uppercase font-bold tracking-widest text-secondary mb-0.5">
            {isNew ? "Nouveau parcours" : "Éditer le parcours"}
          </p>
          <h1 className="font-headline font-bold text-xl text-primary leading-tight">
            {form.title || "Sans titre"}
          </h1>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl cta-gradient font-bold text-white text-sm tap-scale disabled:opacity-60"
        >
          {saving
            ? <Icon name="progress_activity" size={15} className="animate-spin" />
            : saved
            ? <Icon name="check" size={15} />
            : <Icon name="save" size={15} />}
          {saved ? "Enregistré !" : "Enregistrer"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-2xl" style={{ background: "rgba(140,122,90,0.1)" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: tab === t.id ? "#fff9ed" : "transparent", color: tab === t.id ? "#8c4b00" : "#5c3d1e",
              boxShadow: tab === t.id ? "0 1px 4px rgba(44,26,0,0.1)" : "none" }}>
            <Icon name={t.icon} size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Informations */}
      {tab === "infos" && (
        <div className="space-y-4">
          <div className="parchment-card rounded-2xl p-5 space-y-4">
            <Field label="Titre" value={form.title} onChange={v => set("title", v)} placeholder="ex: Secrets de la Cité Impériale" />
            <Field label="Sous-titre" value={form.subtitle} onChange={v => set("subtitle", v)} placeholder="ex: Meknès · 8 étapes + bonus" />
            <Field label="Ville" value={form.city} onChange={v => set("city", v)} placeholder="ex: Meknès" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Durée" value={form.duration} onChange={v => set("duration", v)} placeholder="2h30" />
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2">Difficulté</p>
                <select value={form.difficulty} onChange={e => set("difficulty", e.target.value as ParcoursForm["difficulty"])}
                  className="w-full bg-surface-container-low rounded-xl px-3 py-2.5 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/40">
                  <option>Facile</option>
                  <option>Moyen</option>
                  <option>Difficile</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Prix" value={String(form.price)} onChange={v => set("price", Number(v))} placeholder="100" type="number" />
              <Field label="Devise" value={form.currency} onChange={v => set("currency", v)} placeholder="MAD" />
            </div>
          </div>

          <div className="parchment-card rounded-2xl p-5">
            <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2">Description</p>
            <textarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              rows={4}
              placeholder="Décrivez le parcours, son ambiance, ses points forts…"
              className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          <div className="parchment-card rounded-2xl p-5">
            <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-3">Statut</p>
            <div className="grid grid-cols-2 gap-2">
              {(["draft", "ready", "published", "archived"] as const).map(s => (
                <button key={s} onClick={() => set("status", s)}
                  className="py-2.5 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: form.status === s ? "#8c4b00" : "rgba(140,122,90,0.1)",
                    color: form.status === s ? "#fff" : "#5c3d1e",
                  }}>
                  {{draft:"Brouillon", ready:"Prêt", published:"Publié", archived:"Archivé"}[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Étapes */}
      {tab === "etapes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-on-surface-variant">{form.steps.length} étape(s)</p>
            <div className="flex gap-2">
              <button onClick={importMeknesSteps}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold tap-scale"
                style={{ background: "rgba(41,103,103,0.12)", color: "#296767" }}>
                <Icon name="download" size={14} />
                Importer Meknès
              </button>
              <button onClick={openNewStep}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold cta-gradient text-white tap-scale">
                <Icon name="add" size={14} />
                Nouvelle étape
              </button>
            </div>
          </div>

          {form.steps.length === 0 ? (
            <div className="parchment-card rounded-2xl p-8 text-center">
              <Icon name="route" className="text-on-surface-variant mx-auto mb-2" size={36} />
              <p className="text-on-surface font-medium mb-1">Aucune étape</p>
              <p className="text-on-surface-variant text-sm">Ajoutez des étapes ou importez le parcours Meknès.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {form.steps.map((step, i) => (
                <div key={step.id} className="parchment-card rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                    style={{ background: step.isBonus ? "#c97a00" : "#8c4b00" }}>
                    {step.isBonus ? "B" : Math.floor(step.order)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-on-surface font-bold text-sm truncate">{step.title || "Sans titre"}</p>
                    <p className="text-on-surface-variant text-[11px] truncate">{step.lieu} · {step.type} · {step.scoreBase} pts</p>
                  </div>
                  <button onClick={() => openStepEditor(step, i)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center tap-scale"
                    style={{ background: "rgba(140,75,0,0.1)" }}>
                    <Icon name="edit" className="text-primary" size={14} />
                  </button>
                  <button onClick={() => deleteStep(i)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center tap-scale"
                    style={{ background: "rgba(186,26,26,0.08)" }}>
                    <Icon name="delete" className="text-error" size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Avancé */}
      {tab === "avance" && (
        <div className="parchment-card rounded-2xl p-5 space-y-4">
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Export / Import JSON</p>
          <button
            onClick={() => {
              const json = JSON.stringify(form, null, 2);
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${form.title || "parcours"}.json`;
              a.click();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm tap-scale w-full justify-center"
            style={{ background: "rgba(140,122,90,0.12)", color: "#5c3d1e" }}
          >
            <Icon name="file_download" size={16} />
            Exporter en JSON
          </button>
          <p className="text-on-surface-variant text-xs">
            L&apos;export contient toutes les étapes, coordonnées GPS, énigmes et réponses.
          </p>
        </div>
      )}

      {/* Step editor modal */}
      {editingStep && (
        <div className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(44,26,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-lg rounded-t-3xl p-6 overflow-y-auto max-h-[90dvh]"
            style={{ background: "#fff9ed", border: "1px solid rgba(140,122,90,0.2)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-headline font-bold text-primary text-lg">
                {editingStepIndex === -1 ? "Nouvelle étape" : "Éditer l'étape"}
              </h3>
              <button onClick={() => { setEditingStep(null); setEditingStepIndex(null); }}
                className="w-8 h-8 rounded-full flex items-center justify-center tap-scale"
                style={{ background: "rgba(140,122,90,0.12)" }}>
                <Icon name="close" className="text-primary" size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <StepField label="ID" value={editingStep.id} onChange={v => setEditingStep(s => s ? { ...s, id: v } : s)} placeholder="bab-mansour" />
                <StepField label="Ordre" value={String(editingStep.order)} onChange={v => setEditingStep(s => s ? { ...s, order: Number(v) } : s)} type="number" />
              </div>
              <StepField label="Titre" value={editingStep.title} onChange={v => setEditingStep(s => s ? { ...s, title: v } : s)} />
              <StepField label="Lieu" value={editingStep.lieu} onChange={v => setEditingStep(s => s ? { ...s, lieu: v } : s)} />
              <div className="grid grid-cols-2 gap-3">
                <StepField label="Latitude" value={String(editingStep.coords.lat)} onChange={v => setEditingStep(s => s ? { ...s, coords: { ...s.coords, lat: Number(v) } } : s)} type="number" />
                <StepField label="Longitude" value={String(editingStep.coords.lng)} onChange={v => setEditingStep(s => s ? { ...s, coords: { ...s.coords, lng: Number(v) } } : s)} type="number" />
              </div>
              <StepField label="Position QR Code" value={editingStep.qrCodePosition} onChange={v => setEditingStep(s => s ? { ...s, qrCodePosition: v } : s)} />

              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2">Énigme</p>
                <textarea value={editingStep.enigme} onChange={e => setEditingStep(s => s ? { ...s, enigme: e.target.value } : s)} rows={3}
                  className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
              </div>

              <StepField label="Réponse" value={editingStep.reponse ?? ""} onChange={v => setEditingStep(s => s ? { ...s, reponse: v || null } : s)} placeholder="Laisser vide si pas de réponse" />

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2">Type</p>
                  <select value={editingStep.type} onChange={e => setEditingStep(s => s ? { ...s, type: e.target.value as StepType } : s)}
                    className="w-full bg-surface-container-low rounded-xl px-3 py-2.5 text-on-surface text-sm outline-none">
                    <option value="enigme">Énigme</option>
                    <option value="popup">Popup</option>
                    <option value="photo">Photo</option>
                    <option value="collecte">Collecte</option>
                  </select>
                </div>
                <StepField label="Score" value={String(editingStep.scoreBase)} onChange={v => setEditingStep(s => s ? { ...s, scoreBase: Number(v) } : s)} type="number" />
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2">Bonus</p>
                  <button onClick={() => setEditingStep(s => s ? { ...s, isBonus: !s.isBonus } : s)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold"
                    style={{ background: editingStep.isBonus ? "rgba(201,122,0,0.15)" : "rgba(140,122,90,0.1)", color: editingStep.isBonus ? "#c97a00" : "#5c3d1e" }}>
                    {editingStep.isBonus ? "✓ Bonus" : "Principal"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setEditingStep(null); setEditingStepIndex(null); }}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-on-surface"
                style={{ background: "rgba(226,212,184,0.7)" }}>
                Annuler
              </button>
              <button onClick={saveStep}
                className="flex-1 py-3 rounded-xl cta-gradient font-bold text-sm text-white tap-scale">
                Enregistrer l&apos;étape
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2">{label}</p>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-on-surface-variant/40" />
    </div>
  );
}

function StepField({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1.5">{label}</p>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-surface-container-low rounded-xl px-3 py-2 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-on-surface-variant/40" />
    </div>
  );
}
