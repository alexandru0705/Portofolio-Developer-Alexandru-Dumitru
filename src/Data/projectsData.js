/*
 * Project portfolio data.
 * --------------------------------------------------------------------------
 * Image paths are root-relative (`/images/...`) and point at files inside
 * `public/images/`. At runtime they are resolved through the Vite base path
 * (`import.meta.env.BASE_URL`, see `resolveProjectImage` in
 * `Projects.jsx`) so the same build works at `/` or under any GitHub Pages
 * repository name. Session rule 3: no root-relative strings are hardcoded
 * in SCSS or emitted as raw literals in markup.
 *
 * IMPORTANT: every path below must match an exact existing filename in
 * `public/images/` (Milestone fix — the previous `/images/projects/...`
 * prefix and a handful of stale names no longer existed on disk).
 */
const projectsData = [
  {
    id: "booki",
    title: "Booki",
    category: "HTML & CSS / Responsive Design",
    description: "Responsive HTML/CSS prototype for a travel agency startup, focusing on pixel-perfect UI execution and fluid layout adaptation across devices.",
    images: [
      "/images/booki-thumb.webp",
      "/images/booki-logo.webp",
      "/images/booki-tablet.webp",
      "/images/booki-mobile.webp",
      "/images/booki-1.webp",
      "/images/booki-2.webp"
    ],
    tags: ["HTML5", "CSS3", "Responsive Design", "Git"],
    githubUrl: "https://github.com/OpenClassrooms-Student-Center/Booki_avec_Companion.git"
  },
  {
    id: "sophie-bluel",
    title: "Portfolio Architecte - Sophie Bluel",
    category: "JavaScript & DOM Manipulation",
    description: "Dynamic frontend application integrating an Express backend API with user authentication, media upload modals, and real-time DOM filtering.",
    images: [
      "/images/sophie-bluel-thumb.webp",
      "/images/sophie-bluel-logo.webp",
      "/images/sophie-bluel-login.webp",
      "/images/sophie-bluel-desktop.webp",
      "/images/sophie-bluel-modals.webp",
      "/images/sophie-bluel-1.webp"
    ],
    tags: ["JavaScript", "DOM", "Node.js", "Express", "REST API"],
    githubUrl: "https://github.com/OpenClassrooms-Student-Center/Portfolio-architecte-sophie-bluel.git"
  },
  {
    id: "nina-carducci",
    title: "Optimisation & SEO - Nina Carducci",
    category: "Performance Auditing & Accessibility",
    description: "Complete performance, SEO, and accessibility overhaul for a photographer's portfolio, driving Lighthouse metrics to optimal levels.",
    images: [
      "/images/nina-carducci-thumb.webp",
      "/images/nina-carducci-audit-before.webp",
      "/images/nina-carducci-audit-after.webp",
      "/images/nina-carducci.webp",
      "/images/nina-carducci-1.webp",
      "/images/nina-carducci-3.webp"
    ],
    tags: ["Lighthouse", "SEO", "Accessibility", "Image Optimization"],
    githubUrl: "https://github.com/OpenClassrooms-Student-Center/Nina-Carducci-Dev.git",
    liveUrl: "https://nina-carducci.github.io/"
  },
  {
    id: "kasa",
    title: "Kasa",
    category: "React & Component Architecture",
    description: "Modern single-page application built with React, React Router, and modular SASS, featuring dynamic data loading and custom collapsible components.",
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
    tags: ["React", "React Router", "SASS", "Responsive Design"],
    githubUrl: "https://github.com/OpenClassrooms-Student-Center/TesteurLogiciel_appli_location_immobiliere_React.git"
  },
  {
    id: "mon-vieux-grimoire",
    title: "Mon Vieux Grimoire",
    category: "Node.js & MongoDB Backend API",
    description: "Full-stack book rating and review application featuring a secure RESTful API built with Node.js, Express, and MongoDB, complete with JWT authentication and image processing.",
    images: [
      "/images/mon-vieux-grimoire-thumb.webp",
      "/images/mon-vieux-grimoire-1.webp",
      "/images/mon-vieux-grimoire-home.webp",
      "/images/mon-vieux-grimoire-signup.webp",
      "/images/mon-vieux-grimoire-logo.webp"
    ],
    tags: ["Node.js", "Express", "MongoDB", "Mongoose", "JWT", "REST API"],
    githubUrl: "https://github.com/OpenClassrooms-Student-Center/P7-Dev-Web-livres.git"
  }
];

export { projectsData };