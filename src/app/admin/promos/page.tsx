"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Icon from "@/components/Icon";

interface PromoCode {
  id: string;
  code: string;
  discountType: "percent" | "fixed";
  discount: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt?: string;
}

export default function PromosAdmin() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "", discountType: "percent" as "percent" | "fixed",
    discount: "10", maxUses: "100", expiresAt: "",
  });

  async function fetch() {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "promoCodes"));
      setPromos(snap.docs.map(d => ({ id: d.id, ...d.data() } as PromoCode)));
    } finally { setLoading(false); }
  }

  useEffect(() => { fetch(); }, []);

  async function addPromo() {
    if (!form.code) return;
    await addDoc(collection(db, "promoCodes"), {
      code: form.code.toUpperCase(),
      discountType: form.discountType,
      discount: Number(form.discount),
      maxUses: Number(form.maxUses),
      usedCount: 0,
      active: true,
      expiresAt: form.expiresAt || null,
      createdAt: serverTimestamp(),
    });
    setForm({ code: "", discountType: "percent", discount: "10", maxUses: "100", expiresAt: "" });
    setShowForm(false);
    await fetch();
  }

  async function toggleActive(p: PromoCode) {
    await updateDoc(doc(db, "promoCodes", p.id), { active: !p.active });
    setPromos(prev => prev.map(x => x.id === p.id ? { ...x, active: !x.active } : x));
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-secondary mb-1">CMS</p>
          <h1 className="font-headline font-bold text-2xl text-primary">Codes promo</h1>
          <p className="text-on-surface-variant text-sm mt-1">{promos.length} code(s) configuré(s)</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl cta-gradient font-bold text-sm text-white tap-scale">
          <Icon name="add" size={16} />
          Nouveau code
        </button>
      </div>

      {showForm && (
        <div className="parchment-card rounded-2xl p-5 mb-5 space-y-3">
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Nouveau code promo</p>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="ex: MEKNES10" className="bg-surface-container-low rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 font-mono" />
            <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value as "percent" | "fixed" }))}
              className="bg-surface-container-low rounded-xl px-4 py-2.5 text-sm outline-none">
              <option value="percent">Pourcentage (%)</option>
              <option value="fixed">Montant fixe (MAD)</option>
            </select>
            <input type="number" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
              placeholder={form.discountType === "percent" ? "10 (%)" : "20 (MAD)"}
              className="bg-surface-container-low rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
            <input type="number" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
              placeholder="Utilisations max" className="bg-surface-container-low rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
            <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              className="col-span-2 bg-surface-container-low rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: "rgba(226,212,184,0.7)", color: "#5c3d1e" }}>Annuler</button>
            <button onClick={addPromo} className="flex-1 py-2.5 rounded-xl cta-gradient font-bold text-sm text-white tap-scale">
              Créer le code
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Icon name="progress_activity" className="text-primary animate-spin" size={32} />
        </div>
      ) : promos.length === 0 ? (
        <div className="parchment-card rounded-2xl p-10 text-center">
          <Icon name="local_offer" className="text-on-surface-variant mx-auto mb-3" size={40} />
          <p className="font-headline font-bold text-on-surface mb-1">Aucun code promo</p>
          <p className="text-on-surface-variant text-sm">Créez votre premier code de réduction.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {promos.map(p => (
            <div key={p.id} className="parchment-card rounded-2xl px-5 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-black text-primary text-base">{p.code}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: p.active ? "rgba(41,103,103,0.12)" : "rgba(154,122,80,0.12)", color: p.active ? "#296767" : "#9a7a50" }}>
                    {p.active ? "Actif" : "Inactif"}
                  </span>
                </div>
                <p className="text-on-surface-variant text-[11px]">
                  {p.discountType === "percent" ? `-${p.discount}%` : `-${p.discount} MAD`}
                  {" · "}{p.usedCount}/{p.maxUses} utilisations
                  {p.expiresAt ? ` · Expire le ${p.expiresAt}` : ""}
                </p>
              </div>
              <button onClick={() => toggleActive(p)}
                className="w-9 h-9 rounded-xl flex items-center justify-center tap-scale"
                style={{ background: p.active ? "rgba(186,26,26,0.08)" : "rgba(41,103,103,0.12)" }}>
                <Icon name={p.active ? "toggle_on" : "toggle_off"} size={18}
                  style={{ color: p.active ? "#ba1a1a" : "#296767" }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
