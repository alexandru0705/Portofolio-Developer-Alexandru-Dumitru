const projectsData = [
    {
        id: "booki",
        title: "Booki",
        category: "HTML & CSS / Responsive Design",
        description: "Responsive HTML/CSS prototype for a travel agency startup, focusing on pixel-perfect UI execution and fluid layout adaptation across devices.",
        images: [
            "/images/projects/booki-thumb.webp",
            "/images/projects/booki-logo.webp",
            "/images/projects/booki-tablet.webp",
            "/images/projects/booki-mobile.webp"
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
            "/images/projects/sophie-bluel-thumb.webp",
            "/images/projects/sophie-bluel-logo.webp",
            "/images/projects/sophie-bluel-login.webp",
            "/images/projects/sophie-bluel-desktop-edit.webp",
            "/images/projects/sophie-bluel-modals.webp"
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
            "/images/projects/nina-carducci-thumb.webp",      // Main card preview
            "/images/projects/nina-carducci-audit-before.webp", // Initial score (65 performance)
            "/images/projects/nina-carducci-audit-after.webp",  // Optimized 100/100 Lighthouse score
            "/images/projects/nina-carducci-seo.webp"         // Rich Results structured data validation
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
            "/images/projects/kasa-thumb.webp",      // Main card thumbnail[cite: 31]
            "/images/projects/kasa-home.webp",        // Desktop Home view[cite: 31]
            "/images/projects/kasa-fiche.webp",       // Desktop Rental Detail & Carousel[cite: 34]
            "/images/projects/kasa-about.webp",       // Desktop About page accordions[cite: 33]
            "/images/projects/kasa-404.webp",         // Custom 404 error page[cite: 32]
            "/images/projects/kasa-mobile-home.webp",   // Mobile Home view[cite: 30]
            "/images/projects/kasa-mobile-fiche.webp",  // Mobile Rental Detail view[cite: 29]
            "/images/projects/kasa-mobile-about.webp",  // Mobile About page view[cite: 28]
            "/images/projects/kasa-mobile-404.webp",    // Mobile 404 error view[cite: 27]
            "/images/projects/kasa-logo.webp"         // Brand Logo asset[cite: 35]
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
            "/images/projects/mon-vieux-grimoire-thumb.webp",  // Main card thumbnail & publication confirmation[cite: 39]
            "/images/projects/mon-vieux-grimoire-home.webp",   // Main library catalog view[cite: 36]
            "/images/projects/mon-vieux-grimoire-signup.webp", // Authentication / Sign up & login interface[cite: 38]
            "/images/projects/mon-vieux-grimoire-logo.webp"    // Brand logo asset[cite: 37]
        ],
        tags: ["Node.js", "Express", "MongoDB", "Mongoose", "JWT", "REST API"],
        githubUrl: "https://github.com/OpenClassrooms-Student-Center/P7-Dev-Web-livres.git"
    }
];

export { projectsData };