// Fiche de parcours officielle — UrbanKey Meknès
// Source : fiche terrain v1

export type StepType = "enigme" | "popup" | "photo" | "collecte";
export type StepStatus = "locked" | "active" | "completed";

export interface QuestStep {
  id: string;
  order: number;
  title: string;
  lieu: string;
  coords: { lat: number; lng: number };
  plusCode?: string;
  qrCodePosition: string;
  enigme: string;
  reponse: string | null;
  type: StepType;
  isBonus: boolean;
  scoreBase: number;
  // Champs optionnels enrichissement
  choices?: string[];           // QCM : liste de choix à afficher
  indices?: string[];           // Indices statiques pré-écrits (révélés un par un)
  descriptionLongue?: string;   // Texte complet du monument (bouton "Voir plus")
  videoUrl?: string;            // URL YouTube embed optionnelle
}

export interface Quest {
  id: string;
  title: string;
  subtitle: string;
  city: string;
  duration: string;
  difficulty: "Facile" | "Moyen" | "Difficile";
  price: number;
  currency: string;
  steps: QuestStep[];
}

export const PARCOURS_MEKNES: Quest = {
  id: "meknes-imperial",
  title: "Secrets de la Cité Impériale",
  subtitle: "Meknès · 8 étapes + bonus",
  city: "Meknès",
  duration: "2h30",
  difficulty: "Moyen",
  price: 100,
  currency: "MAD",
  steps: [
    {
      id: "bab-mansour",
      order: 1,
      title: "Bab Mansour",
      lieu: "Bab Mansour",
      coords: { lat: 33.8953, lng: -5.5524 },
      plusCode: "VCVP+24",
      qrCodePosition: "Face nord-est, plaque fixée directement au mur",
      enigme:
        "Commandée par un Sultan Alaouite pour orner Meknès, je porte le nom de celui qui m'a façonnée : un chrétien converti, surnommé « le Victorieux Renégat ». Bien que débutée par Moulay Ismaïl, mon chef-d'œuvre fut achevé par son fils Moulay Abdellah en 1732. Qui suis-je ?",
      reponse: "Bab Mansour Laleej",
      type: "enigme",
      isBonus: false,
      scoreBase: 150,
      indices: [
        "Je suis une porte monumentale, l'une des plus belles du Maroc. Mon nom vient de l'artisan qui m'a construite.",
        "Mon constructeur s'appelait Mansour Laleej — un esclave chrétien devenu musulman. Son surnom « le Victorieux Renégat » est la clé.",
      ],
      descriptionLongue:
        "Bab Mansour est la porte la plus majestueuse de Meknès et l'une des plus imposantes du Maroc. Construite au début du XVIIIe siècle sous le règne de Moulay Ismaïl, elle fut achevée par son fils Moulay Abdellah en 1732. Son nom rend hommage à Mansour Laleej, un esclave chrétien converti à l'islam qui supervisa sa construction. La porte est ornée de mosaïques de zellige, de colonnes corinthiennes récupérées sur le site antique de Volubilis et d'inscriptions coraniques. Elle marque l'entrée principale de la ville impériale.",
    },
    {
      id: "lalla-aouda",
      order: 2,
      title: "Place Lalla Aouda",
      lieu: "Place Lalla Aouda",
      coords: { lat: 33.8945, lng: -5.5510 },
      plusCode: "VCRP+XCQ",
      qrCodePosition: "Sur un pilier ou panneau, début de la place",
      enigme:
        "Au sud de Bab Mansour, mon esprit veille sur le méchouar où la garde noire de Moulay Ismaïl défilait autrefois. Qui suis-je ?",
      reponse: "Lalla Aouda",
      type: "enigme",
      isBonus: false,
      scoreBase: 150,
      indices: [
        "Je suis une place publique nommée en l'honneur d'une femme proche du Sultan Moulay Ismaïl.",
        "Mon nom signifie « la Noble Dame » en arabe. Elle était l'une des épouses préférées du Sultan.",
      ],
      descriptionLongue:
        "La Place Lalla Aouda est l'une des grandes places de la médina de Meknès. Elle tire son nom de Lalla Aouda, une épouse du Sultan Moulay Ismaïl particulièrement vénérée. Le méchouar — l'esplanade où se déroulaient les cérémonies officielles et les défilés de la garde noire — s'étendait autrefois jusqu'à cette place. Aujourd'hui lieu de vie et de promenade, elle reste le cœur historique de la ville impériale.",
    },
    {
      id: "mausolee",
      order: 3,
      title: "Mausolée Moulay Ismaïl",
      lieu: "Mausolée Moulay Ismaïl",
      coords: { lat: 33.8920, lng: -5.5490 },
      plusCode: "VCRP+7P",
      qrCodePosition: "Plaque plexiglass à droite du portail d'entrée",
      enigme:
        "Je suis le Sultan Moulay Ismaïl, commandeur de l'empire Chérifien. Sauras-tu me donner le nom de mon descendant actuel ?",
      reponse: "Mohammed VI",
      type: "enigme",
      isBonus: false,
      scoreBase: 150,
      choices: ["Mohammed VI", "Hassan II", "Mohammed V", "Youssef Ibn Tachfine"],
      indices: [
        "La dynastie Alaouite règne sur le Maroc depuis le XVIIe siècle et continue de nos jours.",
        "Le roi actuel du Maroc porte un prénom arabe très répandu, suivi du chiffre romain « VI ».",
      ],
      descriptionLongue:
        "Le Mausolée Moulay Ismaïl est l'un des rares sites sacrés du Maroc ouvert aux non-musulmans. Moulay Ismaïl (1645–1727) fut le sultan le plus puissant de la dynastie Alaouite. Il fit de Meknès sa capitale impériale et y bâtit une ville grandiose rivalisant avec Versailles. Son mausolée, richement décoré de zellige, de stucs et de bois sculpté, abrite son tombeau ainsi que ceux de deux de ses épouses. Le roi actuel du Maroc, Mohammed VI, est son descendant direct à la 12e génération.",
    },
    {
      id: "dar-lakbira",
      order: 4,
      title: "Dar Lakbira",
      lieu: "Dar Lakbira",
      coords: { lat: 33.8896, lng: -5.5600 },
      plusCode: "VCRQ+F7C",
      qrCodePosition: "Plaque plexiglass à droite de la porte d'entrée",
      enigme:
        "Je suis la gardienne des remparts dans mon costume noir et blanc. En darija on m'appelle Laklak en référence au son que j'émets. Qui suis-je ?",
      reponse: "Cigogne",
      type: "enigme",
      isBonus: true,
      scoreBase: 50,
      indices: [
        "Je suis un oiseau migrateur emblématique du Maroc, souvent perché sur les minarets et les remparts.",
        "Mon cri ressemble à un claquement de bec : « Laklak, laklak… »",
      ],
    },
    {
      id: "makhzen",
      order: 4.1,
      title: "Place du Makhzen",
      lieu: "Place du Makhzen",
      coords: { lat: 33.8900, lng: -5.5605 },
      plusCode: "VCPW+58X",
      qrCodePosition: "Pop-up automatique par géofencing",
      enigme:
        "Ici est la demeure officielle du Roi du Maroc Mohammed VI quand il séjourne à Meknès. La garde royale que vous apercevez sera ravie de vous accueillir au plus proche de la porte d'entrée pour une photo souvenir. Le respect de l'autorité royale est de mise — avancez-vous pour éviter les clichés incluant la garde royale.",
      reponse: null,
      type: "photo",
      isBonus: true,
      scoreBase: 50,
    },
    {
      id: "hri-souani",
      order: 5,
      title: "Hri Souani",
      lieu: "Hri Souani — Greniers royaux",
      coords: { lat: 33.8831, lng: -5.5605 },
      plusCode: "VCJR+6W2",
      qrCodePosition: "Plaque plexiglass à droite de la porte d'entrée",
      enigme:
        "Je suis les greniers royaux de Moulay Ismaïl, conçus pour nourrir son armée et ses chevaux. Quelle est ma superficie approximative ?",
      reponse: null,
      type: "enigme",
      isBonus: false,
      scoreBase: 150,
      indices: [
        "Ma superficie est impressionnante — on parle de plusieurs hectares pour stocker les provisions de toute une armée.",
        "Les panneaux informatifs à l'entrée indiquent ma superficie exacte. Regarde autour de toi !",
      ],
      descriptionLongue:
        "Les Hri Souani sont les immenses greniers et écuries royaux construits par Moulay Ismaïl pour approvisionner son armée de 150 000 hommes et ses 12 000 chevaux. Ces vastes salles voûtées s'étendent sur plus de 4 hectares et constituent l'un des plus grands complexes de stockage de l'époque. Le système de ventilation et d'irrigation souterrain permettait de maintenir une température fraîche été comme hiver. Aujourd'hui, une partie des greniers est restaurée et accessible aux visiteurs.",
    },
    {
      id: "sarij-souani",
      order: 6,
      title: "Sarij Souani",
      lieu: "Sarij Souani — Bassin royal",
      coords: { lat: 33.8831, lng: -5.5608 },
      plusCode: "VCJR+CJ8",
      qrCodePosition: "Panneau ou borne",
      enigme:
        "Je ne sers pas à noyer mes ennemis mais je suis impressionnant par ma taille. As-tu retenu mes dimensions ?",
      reponse: null,
      type: "enigme",
      isBonus: false,
      scoreBase: 150,
      indices: [
        "Je suis un bassin artificiel construit pour irriguer les jardins royaux et alimenter les greniers en eau.",
        "Les panneaux sur place indiquent mes dimensions. Cherche les informations autour du bassin !",
      ],
      descriptionLongue:
        "Le Sarij Souani est un immense bassin de rétention d'eau construit par Moulay Ismaïl pour irriguer ses jardins royaux et alimenter les écuries et greniers en eau. Avec ses dimensions impressionnantes (environ 400m × 200m), il était alimenté par un aqueduc venant des collines environnantes. Aujourd'hui partiellement asséché, il offre une vue panoramique sur les remparts et les greniers voisins. Des barques de promenade permettent de le traverser en saison.",
    },
    {
      id: "caleche",
      order: 6.1,
      title: "Calèche royale",
      lieu: "Près du Sarij Souani",
      coords: { lat: 33.8831, lng: -5.5606 },
      plusCode: "",
      qrCodePosition: "Pop-up automatique par géofencing",
      enigme:
        "Que serait Meknès sans ses calèches ? Laissez-vous tenter par un retour jusqu'au Pavillon des Ambassadeurs en calèche !",
      reponse: null,
      type: "photo",
      isBonus: true,
      scoreBase: 50,
    },
    {
      id: "prison-qara",
      order: 7,
      title: "Prison de Qara & Pavillon des Ambassadeurs",
      lieu: "Pavillon des Ambassadeurs",
      coords: { lat: 33.8920, lng: -5.5524 },
      plusCode: "VCRP+F5X",
      qrCodePosition: "Plaque plexiglass à droite de la porte d'entrée du pavillon",
      enigme:
        "Mes entrailles parcourent Meknès et ses environs, on ne peut m'échapper ! Combien de kilomètres font mes galeries ?",
      reponse: null,
      type: "enigme",
      isBonus: false,
      scoreBase: 150,
      indices: [
        "Je suis un réseau souterrain construit par Moulay Ismaïl pour relier les différentes parties de sa ville impériale.",
        "Les guides locaux parlent de dizaines de kilomètres de galeries. La réponse est affichée à l'entrée du pavillon.",
      ],
      descriptionLongue:
        "La Prison de Qara est un vaste réseau de souterrains et de cachots creusés sous la ville impériale de Moulay Ismaïl. Elle pouvait accueillir des milliers de prisonniers chrétiens qui travaillaient à la construction de la ville. Les galeries souterraines s'étendent sur plusieurs dizaines de kilomètres sous Meknès, reliant les différents quartiers impériaux. Le Pavillon des Ambassadeurs, juste au-dessus, servait à recevoir les délégations étrangères venues négocier la libération des captifs.",
    },
    {
      id: "finale",
      order: 8,
      title: "Collecte des clés & Comptage des points",
      lieu: "Point de retour — Bab Mansour",
      coords: { lat: 33.8953, lng: -5.5524 },
      plusCode: "",
      qrCodePosition: "Point de collecte final",
      enigme:
        "Tu as traversé la Cité Impériale et percé ses secrets. Présente tes clés au maître du jeu pour révéler ton score final !",
      reponse: null,
      type: "collecte",
      isBonus: false,
      scoreBase: 0,
    },
  ],
};

// Étapes principales (sans bonus) dans l'ordre
export const MAIN_STEPS = PARCOURS_MEKNES.steps.filter(
  (s) => !s.isBonus && Number.isInteger(s.order)
);

// Score maximum possible
export const MAX_SCORE = MAIN_STEPS.reduce((acc, s) => acc + s.scoreBase, 0);
