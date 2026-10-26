/*
 * Project portfolio data.
 * --------------------------------------------------------------------------
 * Image paths are root-relative (`/images/...`) and point at files inside
 * `public/images/`. At runtime they are resolved through the Vite base path
 * (`import.meta.env.BASE_URL`, see `resolveProjectImage` in `Projects.jsx`).
 *
 * Each project contains localized pitch copy for the showcase card
 * and structured deep-dive sections for `ProjectModal`.
 */

const projectsData = [
  {
    id: "booki",
    title: "Booki",
    category: "HTML & CSS / Responsive Design",
    description: {
      fr: "Intégration pixel-perfect d'une plateforme de réservation d'hébergements et d'activités selon les standards W3C. Architecture responsive fluide sous Flexbox avec adaptation mobile et desktop sans framework.",
      en: "Pixel-perfect responsive web integration for a travel booking platform built to strict W3C standards. Hand-crafted Flexbox architecture delivering fluid breakpoints across mobile, tablet, and desktop without frameworks."
    },
    modalDetails: {
      fr: {
        context: "Transformer une maquette Figma dense en un prototype web statique conforme aux normes d'accessibilité et de responsive design pour une start-up touristique.",
        architecture: [
          "Structuration sémantique HTML5 rigoureuse (header, nav, main, section, article) optimisée pour les technologies d'assistance.",
          "Design system modulaire articulé autour des variables CSS natives pour centraliser couleurs et espacements.",
          "Système de grille fluide Flexbox sans framework avec gestion dynamique du sens de lecture sur mobile et tablette."
        ],
        deliverables: "Validation W3C HTML5 et CSS3 à 0 erreur, code source modulaire versionné sous Git."
      },
      en: {
        context: "Transforming complex Figma mockups into a fully responsive, accessible static web prototype for a travel startup.",
        architecture: [
          "Semantic HTML5 structure engineered for assistive technologies and clean document hierarchy.",
          "Modular CSS variable design system centralizing palette and spatial tokens.",
          "Pure Flexbox fluid layouts adapting across all device viewports without third-party frameworks."
        ],
        deliverables: "Strict 100% valid W3C HTML5/CSS3 compliance, modular Git-tracked codebase."
      }
    },
    images: [
      "/images/booki-thumb.webp",
      "/images/booki-logo.webp",
      "/images/booki-tablet.webp",
      "/images/booki-mobile.webp",
      "/images/booki-1.webp",
      "/images/booki-2.webp"
    ],
    tags: ["HTML5", "CSS3", "Flexbox", "Responsive Design", "W3C", "Git"],
    githubUrl: "https://github.com/OpenClassrooms-Student-Center/Booki_avec_Companion.git"
  },
  {
    id: "sophie-bluel",
    title: "Portfolio Architecte - Sophie Bluel",
    category: "JavaScript & DOM Manipulation",
    description: {
      fr: "Application front-end dynamique communicant avec une API REST en JavaScript natif asynchrone. Interface d'administration avec authentification par Token, filtrage réactif du DOM et modale d'upload média sans rechargement de page.",
      en: "Dynamic front-end portfolio consuming a REST API using native asynchronous JavaScript. Token-authenticated admin dashboard featuring reactive DOM filtering and multi-step media upload modals with zero page refreshes."
    },
    modalDetails: {
      fr: {
        context: "Rendre dynamique un portfolio d'architecte d'intérieur statique pour lui permettre de gérer ses projets en direct via un panneau d'administration sécurisé.",
        architecture: [
          "Requêtes HTTP asynchrones (async/await, Fetch API) pour consommer l'API REST et synchroniser les opérations CRUD (POST / DELETE).",
          "Gestion d'authentification robuste avec persistance du token JWT dans localStorage et bascule d'interface (Mode Édition).",
          "Modale interactive à double affichage (suppression en grille et formulaire d'ajout) avec prévisualisation immédiate du fichier via l'API FileReader (Base64).",
          "Gestion défensive des erreurs de saisie (alertes, validation des formats) sans blocage d'exécution."
        ],
        deliverables: "Code Vanilla JavaScript modulaire et découplé, expérience utilisateur fluide sans rechargement de page."
      },
      en: {
        context: "Transforming an interior architect's static site into an interactive showcase with a protected administrative workflow.",
        architecture: [
          "Asynchronous HTTP operations (async/await, Fetch API) consuming REST endpoints for complete CRUD operations (POST / DELETE).",
          "JWT session management via localStorage with conditional rendering of the administrative edition bar.",
          "Multi-view modal component (gallery manager and upload form) featuring real-time image previews using the FileReader API (Base64).",
          "Defensive form validation and client error handling preventing application crashes."
        ],
        deliverables: "Clean, decoupled Vanilla JS codebase delivering an SPA-like user experience with immediate DOM updates."
      }
    },
    images: [
      "/images/sophie-bluel-thumb.webp",
      "/images/sophie-bluel-logo.webp",
      "/images/sophie-bluel-login.webp",
      "/images/sophie-bluel-desktop.webp",
      "/images/sophie-bluel-modals.webp",
      "/images/sophie-bluel-1.webp"
    ],
    tags: ["JavaScript ES6+", "DOM API", "Fetch / REST", "JWT", "Modals", "Node.js"],
    githubUrl: "https://github.com/OpenClassrooms-Student-Center/Portfolio-architecte-sophie-bluel.git"
  },
  {
    id: "nina-carducci",
    title: "Optimisation & SEO - Nina Carducci",
    category: "Performance Auditing & Accessibility",
    description: {
      fr: "Refonte technique et optimisation complète d'un portfolio photographe : score Google Lighthouse porté à 100/100. Résolution des bugs JavaScript de navigation, élimination des décalages de mise en page (CLS) et intégration Schema.org.",
      en: "Complete technical optimization and debugging of a photographer portfolio, achieving a 100/100 Lighthouse performance score. Resolved lightbox JS index bugs, eliminated layout shift (CLS), and implemented Schema.org structured data."
    },
    modalDetails: {
      fr: {
        context: "Reprendre une base de code existante ralentie par des assets lourds et des erreurs d'exécution pour maximiser le référencement naturel et la vitesse mobile.",
        architecture: [
          "Core Web Vitals : conversion systématique des images en WebP, spécification explicite des dimensions (éradication du CLS) et priorisation des ressources clés (fetchpriority=\"high\").",
          "Recette logicielle : correction des erreurs d'indexation de la modale lightbox pour assurer une boucle circulaire cohérente respectant la catégorie filtrée.",
          "SEO Technique : balises OpenGraph, Twitter Cards et microdonnées Schema.org (LocalBusiness) validées sur l'outil Google Rich Results.",
          "Accessibilité : correction des contrastes, hiérarchie sémantique des titres et attributs ARIA audités via l'outil WAVE."
        ],
        deliverables: "Score Google Lighthouse parfait (100 Perf / 96 Accessibilité / 96 Bonnes Pratiques / 100 SEO) et cahier de recette technique documenté."
      },
      en: {
        context: "Refactoring a photographer's portfolio burdened by uncompressed assets and runtime bugs to optimize speed and local search ranking.",
        architecture: [
          "Core Web Vitals: full WebP image conversion, explicit aspect-ratio constraints eliminating CLS, and key resource preloading (fetchpriority=\"high\").",
          "Debugging & QA: repaired lightbox gallery indexing to enforce safe circular looping filtered by active category.",
          "Technical SEO: Schema.org structured data (LocalBusiness), OpenGraph metadata, and Twitter Cards validated via Google Rich Results.",
          "Web Accessibility: WAVE audit compliance, contrast remediation, and accessible ARIA attributes across interactive triggers."
        ],
        deliverables: "Pristine Lighthouse audit (100 Performance, 96 Accessibility, 96 Best Practices, 100 SEO) accompanied by a formal QA test report."
      }
    },
    images: [
      "/images/nina-carducci-thumb.webp",
      "/images/nina-carducci-audit-before.webp",
      "/images/nina-carducci-audit-after.webp",
      "/images/nina-carducci.webp",
      "/images/nina-carducci-1.webp",
      "/images/nina-carducci-3.webp"
    ],
    tags: ["Lighthouse (100)", "WebP", "CLS Zero", "Schema.org", "WAVE A11y", "Debugging"],
    githubUrl: "https://github.com/OpenClassrooms-Student-Center/Nina-Carducci-Dev.git",
    liveUrl: "https://nina-carducci.github.io/"
  },
  {
    id: "kasa",
    title: "Kasa",
    category: "React & Component Architecture",
    description: {
      fr: "Refonte complète d'une infrastructure ASP.NET legacy vers une Single Page Application sous React 18, Vite et Sass modulaire (BEM). Routage dynamique, carrousel d'images à boucle infinie et composants accordéons polyvalents.",
      en: "Modernized a legacy ASP.NET backend into a high-performance React 18 SPA with Sass BEM architecture. Built with dynamic client-side routing, infinite looping gallery carousels, and reusable stateful accordion components."
    },
    modalDetails: {
      fr: {
        context: "Moderniser la plateforme de location immobilière Kasa en migrant l'architecture serveur vers une Single Page Application modulaire en composants React 18 autonomes.",
        architecture: [
          "Organisation découplée : séparation nette entre conteneurs de pages (pages/) et composants d'interface réutilisables (components/) avec SCSS dédié.",
          "Routage dynamique React Router v6 : extraction des paramètres d'URL (useParams) avec redirection défensive vers la page 404 (Navigate) sur identifiants invalides.",
          "Composant <Carrousel/> : navigation circulaire infinie (modulo), masquage automatique du compteur/flèches si photo unique, et support du défilement au clavier.",
          "Composant <Collapse/> : gestion d'état locale (useState) acceptant indifféremment du texte brut ou des tableaux de caractéristiques avec transitions CSS fluides."
        ],
        deliverables: "Application React 18 réactive, conforme aux maquettes Figma, sans dépendance tierce superflue et documentée."
      },
      en: {
        context: "Modernizing a rental platform by migrating legacy server-rendered views to a client-side React 18 component-driven SPA.",
        architecture: [
          "Decoupled directory layout cleanly isolating page containers from reusable UI elements paired with dedicated SCSS modules.",
          "Dynamic routing via React Router: route parameter parsing with fallback redirection to 404 for unknown listing IDs.",
          "Custom <Carrousel/>: infinite circular scrolling (modulo arithmetic), conditional hiding of controls for single images, and keyboard navigation.",
          "Polymorphic <Collapse/>: stateful accordion rendering raw strings or equipment lists with smooth CSS rotation transitions."
        ],
        deliverables: "Clean, responsive React 18 SPA adhering strictly to Figma specifications with zero redundant dependencies."
      }
    },
    images: [
      "/images/kasa-thumb.webp",
      "/images/kasa-1.webp",
      "/images/kasa-fiche.webp",
      "/images/kasa-about.webp",
      "/images/kasa-404.webp",
      "/images/kasa-mobile-home.webp",
      "/images/kasa-mobile-fiche.webp",
      "/images/kasa-mobile-about.webp",
      "/images/kasa-mobile-404.webp",
      "/images/kasa-logo.webp"
    ],
    tags: ["React 18", "React Router", "Sass (BEM)", "SPA", "Modularity", "Responsive"],
    githubUrl: "https://github.com/OpenClassrooms-Student-Center/TesteurLogiciel_appli_location_immobiliere_React.git"
  },
  {
    id: "mon-vieux-grimoire",
    title: "Mon Vieux Grimoire",
    category: "Node.js & MongoDB Backend API",
    description: {
      fr: "Conception d'une API REST sécurisée avec Node.js, Express et base NoSQL MongoDB Atlas. Authentification JWT chiffrée sous Bcrypt, traitement et compression d'images automatisés avec Multer et Sharp (« Green Code »).",
      en: "Secure REST API developed with Node.js, Express, and MongoDB Atlas NoSQL database. Implements Bcrypt hashing, JWT route-guard middlewares, and optimized media ingestion using Multer and Sharp ('Green Code')."
    },
    modalDetails: {
      fr: {
        context: "Développer l'intégralité du backend pour un site communautaire de notation de livres, en assurant la persistance sécurisée des données et la performance des requêtes.",
        architecture: [
          "Architecture MVC rigoureuse (Routes, Contrôleurs, Modèles Mongoose) séparant l'accès aux données des règles de gestion.",
          "Modélisation NoSQL : sous-documents Mongoose pour les avis individuels avec calcul dénormalisé de la note moyenne globale (averageRating).",
          "Pipeline média optimisé (« Green Code ») : interception des uploads multipart avec Multer, redimensionnement et conversion à la volée au format WebP ultra-léger avec Sharp.",
          "Sécurité renforcée : middleware d'authentification vérifiant le token JWT dans les en-têtes Authorization: Bearer, hachage salé Bcrypt, et contrôle strict des droits d'auteur (seul le créateur peut modifier/supprimer son livre)."
        ],
        deliverables: "API RESTful documentée avec opérations CRUD complètes, sécurité testée et réduction drastique de l'empreinte serveur des médias."
      },
      en: {
        context: "Developing the complete server-side backend and database architecture for a literary rating and book evaluation platform.",
        architecture: [
          "Strict MVC architecture separating REST routing, business controller logic, and Mongoose schema definitions.",
          "NoSQL document modeling: embedded rating sub-documents with automated average score aggregation.",
          "Optimized media pipeline ('Green Code'): multipart ingestion via Multer followed by automated Sharp resizing and WebP compression.",
          "Bulletproof authentication: custom JWT bearer middleware, salted password hashing via Bcrypt, and strict author ownership guards on update/delete endpoints."
        ],
        deliverables: "Fully documented REST API featuring resilient CRUD endpoints, certified data authorization, and minimized image payloads."
      }
    },
    images: [
      "/images/mon-vieux-grimoire-thumb.webp",
      "/images/mon-vieux-grimoire-1.webp",
      "/images/mon-vieux-grimoire-home.webp",
      "/images/mon-vieux-grimoire-signup.webp",
      "/images/mon-vieux-grimoire-logo.webp"
    ],
    tags: ["Node.js", "Express", "MongoDB", "Mongoose", "JWT", "Sharp / WebP", "REST API"],
    githubUrl: "https://github.com/OpenClassrooms-Student-Center/P7-Dev-Web-livres.git"
  }
];

export { projectsData };