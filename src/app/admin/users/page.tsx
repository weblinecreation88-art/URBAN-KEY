"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Icon from "@/components/Icon";

interface UserDoc {
  id: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  createdAt?: { seconds: number };
  purchases?: unknown[];
}

export default function UsersAdmin() {
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as UserDoc)));
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = users.filter(u =>
    !search ||
    u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (u: UserDoc) => {
    const name = u.displayName ?? u.email ?? "?";
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (u: UserDoc) => {
    if (!u.createdAt?.seconds) return "—";
    return new Date(u.createdAt.seconds * 1000).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <p className="text-[10px] uppercase font-bold tracking-widest text-secondary mb-1">CMS</p>
        <h1 className="font-headline font-bold text-2xl text-primary">Utilisateurs</h1>
        <p className="text-on-surface-variant text-sm mt-1">{users.length} utilisateur(s) inscrit(s)</p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou email…"
          className="w-full bg-surface-container-low rounded-xl pl-10 pr-4 py-2.5 text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Icon name="progress_activity" className="text-primary animate-spin" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="parchment-card rounded-2xl p-10 text-center">
          <Icon name="group" className="text-on-surface-variant mx-auto mb-3" size={40} />
          <p className="font-headline font-bold text-on-surface mb-1">
            {search ? "Aucun résultat" : "Aucun utilisateur"}
          </p>
          <p className="text-on-surface-variant text-sm">
            {search ? "Modifiez votre recherche." : "Les utilisateurs apparaîtront ici après inscription."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => (
            <div key={u.id} className="parchment-card rounded-2xl px-5 py-3 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-white text-sm"
                style={{ background: "#8c4b00" }}>
                {initials(u)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-on-surface text-sm truncate">{u.displayName ?? "Sans nom"}</p>
                <p className="text-on-surface-variant text-[11px] truncate">{u.email ?? u.id}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-on-surface-variant">Inscrit le</p>
                <p className="text-xs font-medium text-on-surface">{formatDate(u)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
