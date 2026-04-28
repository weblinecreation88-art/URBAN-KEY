"use client";

import { useState, useRef, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";

interface Lieu {
  id: string;
  titre: string;
  adresse: string;
  mapsUrl: string;
  image: string;
  enigmeRef: string;
  description: string[];
  anecdote: string;
  epoque: string;
  tags: string[];
}

const LIEUX: Lieu[] = [
  {
    id: "bab-mansour",
    titre: "Bab Mansour — La Porte Triomphale",
    adresse: "Place Lahdim, Médina de Meknès, Maroc",
    mapsUrl: "https://maps.google.com/?q=Bab+Mansour+Meknes+Maroc",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Bab_Mansour_Meknes.jpg/1280px-Bab_Mansour_Meknes.jpg",
    enigmeRef: "Étape 1 — Porte des Secrets",
    description: [
      "Édifiée entre 1672 et 1732 sous le règne du sultan Moulay Ismaïl, Bab Mansour est considérée comme la plus belle porte monumentale du Maroc et l'une des plus remarquables du monde arabo-musulman.",
      "Son nom vient de l'architecte chrétien converti à l'islam, El Mansour, qui la conçut. Paradoxe saisissant : deux colonnes romaines antiques, pillées à Volubilis, soutiennent ses arcs trilobés et ses zelliges polychromes.",
      "Elle ne servait pas d'entrée principale mais de porte de parade, symbole de la puissance impériale. Les ambassadeurs étrangers la franchissaient pour être intimidés avant même d'atteindre le palais.",
    ],
    anecdote: "Les colonnes de marbre proviennent du site romain de Volubilis, à 30 km de Meknès — Moulay Ismaïl les fit transporter à dos d'hommes.",
    epoque: "Règne de Moulay Ismaïl · 1672 – 1727",
    tags: ["Architecture", "Époque impériale", "Classé UNESCO"],
  },
  {
    id: "heri-souani",
    titre: "Heri es-Souani — Les Greniers Royaux",
    adresse: "Heri es-Souani, Meknès, Maroc",
    mapsUrl: "https://maps.google.com/?q=Heri+es-Souani+Meknes",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Heri_es-Souani_Meknes.jpg/1280px-Heri_es-Souani_Meknes.jpg",
    enigmeRef: "Étape 3 — Les Provisions du Sultan",
    description: [
      "Ces gigantesques greniers et écuries royales pouvaient accueillir 12 000 chevaux et stocker des tonnes de céréales pour alimenter l'immense armée de Moulay Ismaïl, estimée à 150 000 hommes.",
      "Le génie du lieu réside dans son système de ventilation naturelle : des puits de lumière et des conduits d'air maintenaient une température fraîche en été. Un véritable exploit d'ingénierie du 17e siècle.",
      "Un tremblement de terre en 1755, le même qui détruisit Lisbonne, effondra une partie des voûtes. Les ruines conservent une atmosphère mystérieuse, avec leurs arcs répétitifs qui s'enfoncent dans l'obscurité.",
    ],
    anecdote: "On dit que Moulay Ismaïl inspectait ses greniers à cheval : les allées étaient assez larges pour que sa monture puisse y galoper.",
    epoque: "17e siècle · Règne de Moulay Ismaïl",
    tags: ["Architecture", "Patrimoine", "Ruines"],
  },
  {
    id: "moulay-ismail",
    titre: "Mausolée de Moulay Ismaïl",
    adresse: "Médina de Meknès, Maroc",
    mapsUrl: "https://maps.google.com/?q=Mausolee+Moulay+Ismail+Meknes",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Meknes_Mausoleum_interior.jpg/1280px-Meknes_Mausoleum_interior.jpg",
    enigmeRef: "Étape 4 — Le Repos du Sultan",
    description: [
      "Seul mausolée royal du Maroc ouvert aux non-musulmans, il abrite la tombe du sultan Moulay Ismaïl ibn Chérif, fondateur de la ville impériale et personnage le plus puissant de son époque en Afrique du Nord.",
      "Son intérieur est un chef-d'œuvre de l'art hispano-mauresque : zelliges multicolores jusqu'à mi-hauteur, stuc sculpté en arabesques végétales, plafond en cèdre de l'Atlas peint et doré.",
      "Le sultan, décédé en 1727 à l'âge de 80 ans, aurait eu plus de 800 fils reconnus. Sa correspondance avec Louis XIV de France, dont il voulait épouser la fille, reste un épisode diplomatique fascinant.",
    ],
    anecdote: "Moulay Ismaïl écrivit à Louis XIV pour demander la main de la Princesse de Conti. Louis XIV refusa poliment, craignant qu'elle ne soit contrainte d'embrasser l'islam.",
    epoque: "Construit vers 1703 · Restauré au 20e siècle",
    tags: ["Art islamique", "Royauté", "Patrimoine vivant"],
  },
  {
    id: "place-lahdim",
    titre: "Place el-Hedim — L'Agora de Meknès",
    adresse: "Place el-Hedim, Médina de Meknès, Maroc",
    mapsUrl: "https://maps.google.com/?q=Place+Lahdim+Meknes",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Place_El_Hedim_Meknes.jpg/1280px-Place_El_Hedim_Meknes.jpg",
    enigmeRef: "Étape 2 — La Place des Murmures",
    description: [
      "Son nom signifie littéralement « Place de la Démolition » : Moulay Ismaïl fit raser ici une ancienne médina pour créer cette vaste esplanade face à Bab Mansour, théâtre de ses parades militaires.",
      "Véritable Djemaa el-Fna de Meknès, la place s'anime chaque soir de conteurs, musiciens gnaouas, charmeurs de serpents et herboristes. Une tradition orale vivante qui remonte au 17e siècle.",
      "Sous ses pavés, des fouilles archéologiques ont révélé des vestiges mérinides datant du 14e siècle, rappelant que Meknès était déjà une ville florissante bien avant Moulay Ismaïl.",
    ],
    anecdote: "La place servait jadis de lieu d'exécution publique. Les têtes des condamnés étaient exposées sur des piques le long des remparts pour intimider les opposants.",
    epoque: "17e siècle · Réaménagée au 20e siècle",
    tags: ["Culture populaire", "Histoire urbaine", "Vie locale"],
  },
  {
    id: "dar-jamai",
    titre: "Palais Dar Jamai — Musée des Arts",
    adresse: "Place el-Hedim, Médina de Meknès, Maroc",
    mapsUrl: "https://maps.google.com/?q=Dar+Jamai+Meknes",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Dar_Jamai_Meknes.jpg/1280px-Dar_Jamai_Meknes.jpg",
    enigmeRef: "Étape 5 — Le Palais des Vizirs",
    description: [
      "Construit en 1882 par le vizir Mohammed Ben Larbi Jamai, ce palais mêle architecture andalouse, hispano-mauresque et ottomane dans un syncrétisme rare. Ses jardins andalous, avec leur bassin central, offrent une halte apaisante en plein cœur de la médina.",
      "Transformé en hôpital militaire par les Français en 1912, puis en musée en 1920, il abrite aujourd'hui l'une des plus belles collections d'arts et traditions populaires du Maroc : broderies fassis, poteries, bijoux berbères, instruments de musique.",
      "La famille Jamai, qui y vécut jusqu'au début du Protectorat, fut l'une des plus influentes du royaume. Leur chute brutale lors de l'arrivée française reste l'un des épisodes les plus tragiques de cette période.",
    ],
    anecdote: "Le vizir Jamai fut exilé à Mogador (Essaouira) par les Français en 1912 et mourut en disgrâce. Son palais devint un symbole du renversement de l'ordre ancien.",
    epoque: "Construit en 1882 · Musée depuis 1920",
    tags: ["Arts décoratifs", "Architecture andalouse", "Musée"],
  },
  {
    id: "agdal",
    titre: "Bassin de l'Agdal — Le Lac du Sultan",
    adresse: "Agdal, Meknès, Maroc",
    mapsUrl: "https://maps.google.com/?q=Agdal+Basin+Meknes",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Bassin_de_l%27Agdal_Mekn%C3%A8s.jpg/1280px-Bassin_de_l%27Agdal_Mekn%C3%A8s.jpg",
    enigmeRef: "Étape 6 — Les Eaux Secrètes",
    description: [
      "Ce lac artificiel de 4 hectares fut creusé sur ordre de Moulay Ismaïl pour irriguer les jardins royaux et constituer une réserve d'eau en cas de siège. Un réseau de seguias (canaux) de 70 km l'alimentait depuis le Moyen Atlas.",
      "Le Sultan y organisait des régates et des fêtes nautiques, invitant ambassadeurs et dignitaires à contempler le reflet des palais sur l'eau immobile. Une mise en scène calculée du pouvoir et du luxe.",
      "Aujourd'hui encore, les pêcheurs de la ville y lancent leurs lignes à l'aube, perpétuant une tradition vieille de trois siècles dans un cadre qui n'a guère changé.",
    ],
    anecdote: "Le bassin est encore alimenté par le même réseau de seguias du 17e siècle, l'un des rares systèmes hydrauliques préindustriels encore fonctionnels au Maroc.",
    epoque: "17e siècle · Moulay Ismaïl",
    tags: ["Hydraulique", "Jardins royaux", "Patrimoine vivant"],
  },
];

function getLieuDuJour(): Lieu {
  const idx = new Date().getDay() % LIEUX.length;
  return LIEUX[idx];
}

export default function DecouvretePage() {
  const lieu = getLieuDuJour();
  const [speaking, setSpeaking] = useState(false);
  const [showAnecdote, setShowAnecdote] = useState(false);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  function toggleAudio() {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const text = [lieu.titre, ...lieu.description].join(". ");
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "fr-FR";
    utt.rate = 0.92;
    utt.onend = () => setSpeaking(false);
    synthRef.current = utt;
    window.speechSynthesis.speak(utt);
    setSpeaking(true);
  }

  return (
    <div className="min-h-dvh bg-background pb-24">
      {/* Header */}
      <header
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 flex items-center justify-between px-5 h-14"
        style={{
          background: "rgba(255,249,237,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(140,122,90,0.15)",
        }}
      >
        <div className="flex items-center gap-2">
          <Icon name="travel_explore" filled className="text-primary" size={20} />
          <h1 className="text-base font-black text-primary tracking-tight font-headline">
            Lieu du jour
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: "rgba(140,75,0,0.1)", color: "#8c4b00" }}>
            {lieu.enigmeRef}
          </span>
        </div>
      </header>

      <main className="pt-14">
        {/* Hero image */}
        <div className="relative w-full h-60 overflow-hidden">
          <img
            src={lieu.image}
            alt={lieu.titre}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://res.cloudinary.com/db2ljqpdt/image/upload/v1776024577/e2df93b4-1115-4922-b854-4870a826e92a_kdc11h.png";
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }}
          />
          {/* Tags overlay */}
          <div className="absolute bottom-3 left-4 flex gap-1.5 flex-wrap">
            {lieu.tags.map((tag) => (
              <span key={tag}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white/90"
                style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="px-5 pt-4 pb-2">
          {/* Titre + bouton audio */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <h2 className="text-xl font-headline font-bold text-on-background leading-tight flex-1">
              {lieu.titre}
            </h2>
            <button
              onClick={toggleAudio}
              className="flex-none w-11 h-11 rounded-full flex items-center justify-center shadow-md tap-scale transition-all"
              style={{
                background: speaking ? "#8c4b00" : "rgba(255,249,237,1)",
                border: "1px solid rgba(140,122,90,0.3)",
                color: speaking ? "#fff" : "#8c4b00",
              }}
              aria-label={speaking ? "Arrêter la lecture" : "Écouter la description"}
            >
              <Icon name={speaking ? "stop_circle" : "volume_up"} filled={speaking} size={22} />
            </button>
          </div>

          {/* Époque */}
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color: "#296767" }}>
            {lieu.epoque}
          </p>

          {/* Adresse cliquable */}
          <a
            href={lieu.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm mb-5 group"
            style={{ color: "#8c4b00" }}
          >
            <Icon name="location_on" size={14} className="flex-none" />
            <span className="underline underline-offset-2 group-hover:no-underline transition-all">
              {lieu.adresse}
            </span>
          </a>

          {/* Description */}
          <div className="flex flex-col gap-4 mb-6">
            {lieu.description.map((para, i) => (
              <p key={i} className="text-[15px] text-on-surface leading-relaxed">
                {para}
              </p>
            ))}
          </div>

          {/* Anecdote */}
          <div className="rounded-2xl overflow-hidden mb-6"
            style={{ border: "1px solid rgba(140,122,90,0.2)" }}>
            <button
              onClick={() => setShowAnecdote(!showAnecdote)}
              className="w-full flex items-center justify-between px-4 py-3 tap-scale"
              style={{ background: "rgba(140,75,0,0.07)" }}
            >
              <div className="flex items-center gap-2">
                <Icon name="auto_stories" filled className="text-primary" size={18} />
                <span className="text-sm font-bold text-primary">Le saviez-vous ?</span>
              </div>
              <Icon
                name={showAnecdote ? "expand_less" : "expand_more"}
                className="text-primary"
                size={20}
              />
            </button>
            {showAnecdote && (
              <div className="px-4 py-3" style={{ background: "rgba(255,249,237,0.6)" }}>
                <p className="text-sm text-on-surface leading-relaxed italic">
                  {lieu.anecdote}
                </p>
              </div>
            )}
          </div>

          {/* Carousel des autres lieux */}
          <div className="mb-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-3">
              Autres lieux du parcours
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar -mx-5 px-5">
              {LIEUX.filter((l) => l.id !== lieu.id).map((l) => (
                <a
                  key={l.id}
                  href={l.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-none w-32 rounded-xl overflow-hidden shadow-sm tap-scale"
                  style={{ border: "1px solid rgba(140,122,90,0.18)" }}
                >
                  <div className="relative h-20">
                    <img
                      src={l.image}
                      alt={l.titre}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://res.cloudinary.com/db2ljqpdt/image/upload/v1776024577/e2df93b4-1115-4922-b854-4870a826e92a_kdc11h.png";
                      }}
                    />
                    <div className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)" }} />
                  </div>
                  <div className="px-2 py-1.5" style={{ background: "rgba(255,249,237,1)" }}>
                    <p className="text-[9px] font-black uppercase tracking-widest"
                      style={{ color: "#296767" }}>
                      {l.enigmeRef.split("—")[0].trim()}
                    </p>
                    <p className="text-[11px] font-bold text-on-background leading-tight line-clamp-2">
                      {l.titre.split("—")[0].trim()}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
