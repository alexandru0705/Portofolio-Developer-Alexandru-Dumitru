/*
 * translations.js — Centralized bilingual dictionary (FR / EN).
 * --------------------------------------------------------------------------
 * Zero-dependency i18n source of truth consumed by `LanguageContext`
 * (see `src/Context/LanguageContext.jsx`). Every user-facing string in the
 * portfolio is addressed through a stable `section.key` path; the provider
 * exposes `t(path)` accessors so components never hardcode UI copy.
 *
 * Contract:
 *   - `fr` is the DEFAULT language (the site renders French first).
 *   - Both locales mirror the same key tree — adding a key in one locale
 *     requires the same key in the other (single point of maintenance).
 */
export const translations = {
  fr: {
    nav: {
      home: "Accueil",
      skills: "Compétences",
      projects: "Projets",
      parcours: "Parcours",
      contact: "Contact",
      sayHello: "Say hello →"
    },
    hero: {
      role: "Développeur Full-Stack",
      pitch: "Développeur passionné à 50 ans, j'aborde le code comme un artisanat d'ingénierie où chaque détail compte. Après des années à explorer les structures visuelles et sonores, j'investis aujourd'hui toute cette exigence dans le développement web moderne. De l'écosystème React aux APIs REST sous Node.js & MongoDB, je livre des solutions performantes, sobres et fiables, guidé par une curiosité intacte et une discipline éprouvée.",
      cta: "Découvrir mes projets"
    },
    parcours: {
      title: "Parcours & Création",
      subtitle: "Entre rigueur de code, équilibre plastique et architecture sonore.",
      artBadge: "2007 — 2020",
      artTitle: "Arts Plastiques & Peinture",
      artDesc: "Plus d'une décennie consacrée aux textures, aux équilibres formels et aux compositions graphiques. Ce travail visuel nourrit aujourd'hui directement mon exigence d'ergonomie, de hiérarchie et de sensibilité dans le développement front-end.",
      artLink: "Voir la galerie Facebook ↗",
      artScan: "Scanner le profil",
      musicBadge: "Depuis 2015 — En continu",
      musicTitle: "Musique Électronique",
      musicDesc: "Composition et jeu instrumental axés sur la synthèse et les séquenceurs matériels (DAW-less). Une pratique minutieuse d'architecture sonore, de polyrythmies et de traitement de signal en temps réel qui fait écho à la logique du code.",
      musicLink: "Écouter sur SoundCloud (Chambre 46) ↗",
      musicScan: "Scanner le SoundCloud"
    },
    contact: {
      title: "Contact",
      intro: "Vous avez un projet en tête, une opportunité à pourvoir ou simplement envie d’échanger ? Envoyez-moi un message et je vous répondrai dès que possible.",
      openMail: "Ouvrir directement votre messagerie",
      nameLabel: "NOM",
      namePlaceholder: "Votre nom",
      emailLabel: "EMAIL",
      emailPlaceholder: "vous@exemple.com",
      subjectLabel: "SUJET",
      subjectPlaceholder: "De quoi s'agit-il ?",
      messageLabel: "MESSAGE",
      messagePlaceholder: "Parlez-moi de votre projet...",
      sendBtn: "Envoyer le message",
      sendingBtn: "Envoi en cours..."
    },
    projects: {
      title: "Projets",
      allFilter: "Tous",
      detailsBtn: "Détails",
      empty: "Aucun projet dans cette catégorie.",
      projectSingular: "projet",
      projectPlural: "projets",
      modalContext: "Contexte & Objectifs",
      modalArchitecture: "Architecture & Réalisations Clés",
      modalDeliverables: "Livrables & Valeur Métier",
      modalClose: "Fermer la modale"
    }
  },
  en: {
    nav: {
      home: "Home",
      skills: "Skills",
      projects: "Projects",
      parcours: "Journey",
      contact: "Contact",
      sayHello: "Say hello →"
    },
    hero: {
      role: "Full-Stack Developer",
      pitch: "A passionate software builder at 50, I approach web development as a disciplined engineering craft where every architectural decision matters. Bringing decades of creative rigor into full-stack development, I build end-to-end applications across React, Node.js, and MongoDB. What I offer isn't just modern syntax, but perspective: uncompromising standards, deep self-direction, and a tireless drive to solve complex problems cleanly.",
      cta: "Explore my work"
    },
    parcours: {
      title: "Journey & Creative Background",
      subtitle: "Bridging software engineering, visual arts, and sonic architecture.",
      artBadge: "2007 — 2020",
      artTitle: "Fine Arts & Painting",
      artDesc: "Over a decade dedicated to tactile textures, spatial balances, and graphic compositions. This visual discipline directly informs my standard for interface hierarchy, UI ergonomics, and visual restraint.",
      artLink: "View Facebook Gallery ↗",
      artScan: "Scan Facebook Profile",
      musicBadge: "Since 2015 — Ongoing",
      musicTitle: "Electronic Music",
      musicDesc: "Composition and live performance centered on hardware synthesis and grooveboxes (DAW-less). A meticulous craft of signal flow, polyrhythms, and real-time audio engineering that parallels clean code logic.",
      musicLink: "Listen on SoundCloud (Chambre 46) ↗",
      musicScan: "Scan SoundCloud"
    },
    contact: {
      title: "Contact",
      intro: "Have a project in mind, a role to fill, or just want to say hello? Drop me a message and I'll get back to you as soon as I can.",
      openMail: "Open default mail client",
      nameLabel: "NAME",
      namePlaceholder: "Your name",
      emailLabel: "EMAIL",
      emailPlaceholder: "you@example.com",
      subjectLabel: "SUBJECT",
      subjectPlaceholder: "What is this about?",
      messageLabel: "MESSAGE",
      messagePlaceholder: "Tell me about your project...",
      sendBtn: "Send message",
      sendingBtn: "Sending..."
    },
    projects: {
      title: "Projects",
      allFilter: "Tous",
      detailsBtn: "Details",
      empty: "No projects in this category.",
      projectSingular: "project",
      projectPlural: "projects",
      modalContext: "Context & Objectives",
      modalArchitecture: "Architecture & Key Highlights",
      modalDeliverables: "Deliverables & Business Value",
      modalClose: "Close modal"
    }
  }
};