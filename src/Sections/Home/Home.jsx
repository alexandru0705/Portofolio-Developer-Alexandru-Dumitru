/*
 * Home — Milestone 5: Full-viewport hero + "Parcours" discipline screens
 * (Milestone 9: fully bilingual via `useLanguage()`).
 * --------------------------------------------------------------------------
 * Two consecutive full-viewport screens (`min-height: 100vh` each):
 *   1. View 1 — the editorial presentation hero (`#banner` context):
 *      role eyebrow, main `<h1>` name/title, introductory paragraph, and a
 *      call-to-action that smooth-scrolls down to the Projects section.
 *      All hero copy is resolved locally from `useLanguage()` with
 *      bulletproof dotted-path lookups + hardcoded fallbacks, so the text
 *      always renders even if `t` or the dictionary is temporarily
 *      undefined during first hydration.
 *   2. View 2 — `#parcours`: the "Parcours & Création" screen highlighting
 *      the creative disciplines (plastic arts / painting and electronic
 *      music) with direct outbound links and scannable QR codes.
 *
 * Bilingual contract (Milestone 9):
 *   - All hero + parcours copy resolves through `useLanguage().t(path)`
 *     (FR by default, EN on demand) with guaranteed fallback strings —
 *     no hardcoded UI strings remain, no blank text is possible.
 *
 * Language switch contract: the FR | EN toggle is the single canonical
 * switcher and lives HERE, strictly inside the hero at the top right
 * (`.home-section__top-bar` → `.home-section__lang-switch`, directly above
 * `.home-section__content`). The top Header and the Navigation sidebar
 * carry NO language controls.
 *
 * Session rules honored:
 *   - Standard function declaration first; `export default Home;` strictly
 *     at the very bottom.
 *   - All imperative DOM access is guarded with
 *     `typeof window !== 'undefined'` / `typeof document !== 'undefined'`.
 *   - The CTA uses `scrollIntoView({ behavior: 'smooth' })` wrapped in a
 *     non-blocking try/catch with a native `window.scrollTo` fallback.
 *   - QR image sources resolve through the defensive Vite/GitHub Pages
 *     asset resolver (`resolveAssetUrl`) so `import.meta.env.BASE_URL`
 *     deployments (e.g. GitHub Pages project pages) work without 404s.
 *   - Zero inline layout CSS — all layout lives in `Home.scss` (BEM) using
 *     tokens from `Styles/variables.scss`.
 */
import { useLanguage } from '../../Context/LanguageContext';
import './Home.scss';

/*
 * Vertical offset applied to the fallback scroll target. Mirrors the fixed
 * site header height (70px) so the Projects heading lands flush beneath it
 * after navigation.
 */
const SCROLL_OFFSET = 70;

/*
 * Outbound creative-discipline profiles for the Parcours screen.
 * `qrPath` is a public asset path resolved at runtime through
 * `resolveAssetUrl` (Vite `BASE_URL` aware). Display copy keys
 * (`*Key`) address the centralized FR/EN dictionary via `useLanguage()`.
 */
const PARCOURS_ENTRIES = [
  {
    key: 'peinture',
    href: 'https://www.facebook.com/share/1cTU51yE7v/?mibextid=wwXIfr',
    qrPath: '/images/fb.png',
    qrAltKey: 'parcours.artScan',
    badgeKey: 'parcours.artBadge',
    titleKey: 'parcours.artTitle',
    descKey: 'parcours.artDesc',
    linkKey: 'parcours.artLink',
    captionKey: 'parcours.artScan',
  },
  {
    key: 'musique',
    href: 'https://soundcloud.com/chambre-quarante-six',
    qrPath: '/images/soundcloud.png',
    qrAltKey: 'parcours.musicScan',
    badgeKey: 'parcours.musicBadge',
    titleKey: 'parcours.musicTitle',
    descKey: 'parcours.musicDesc',
    linkKey: 'parcours.musicLink',
    captionKey: 'parcours.musicScan',
  },
];

/*
 * Defensive Vite/GitHub Pages asset resolver: prefixes public asset paths
 * with the configured `import.meta.env.BASE_URL` (normalized with a
 * trailing slash) so deployments under a sub-path (GitHub Pages project
 * pages) do not 404. Non-browser environments return the path as-is, and
 * non-string / empty input resolves to an empty string.
 *
 * @param {string} path - public asset path (e.g. `/images/fb.png`)
 * @returns {string} the base-URL-prefixed asset URL
 */
function resolveAssetUrl(path) {
  if (typeof path !== 'string' || path.length === 0) {
    return '';
  }
  if (typeof window === 'undefined') {
    return path;
  }
  const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};
  const basePath = typeof env.BASE_URL === 'string' && env.BASE_URL.length > 0
    ? env.BASE_URL
    : '/';
  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
  return `${normalizedBase}${path.startsWith('/') ? path.slice(1) : path}`;
}

function Home() {
  const { language, setLanguage, t } = useLanguage();

  /*
   * Bulletproof hero copy resolution (Milestone 9 fix):
   * `t` is a dotted-path resolver (`t('hero.role')`), never an object, so
   * the previous `t('hero').role` access silently returned `undefined`
   * and blanked the hero. Every string below is resolved directly through
   * `t` with a hardcoded fallback, so the hero text always renders even
   * if `t` or `translations[language]` is temporarily undefined during
   * first hydration.
   */
  const isFr = language === 'fr';
  const heroRole = t?.('hero.role') || (isFr ? 'Développeur Full-Stack' : 'Full-Stack Developer');
  const heroPitch = t?.('hero.pitch')
    || (isFr
      ? 'Je conçois des expériences web performantes et accessibles de bout en bout.'
      : 'I craft performant, accessible web experiences end to end.');
  const heroCta = t?.('hero.cta') || (isFr ? 'Découvrir mes projets' : 'Explore my work');
  const heroEyebrow = t?.('hero.eyebrow') || (isFr ? 'Salut, je suis' : 'Hi, I am');

  const parcours = {
    title: t?.('parcours.title') || (isFr ? 'Parcours & Création' : 'Journey & Creative Background'),
    subtitle: t?.('parcours.subtitle') || (isFr
      ? 'Entre rigueur de code, équilibre plastique et architecture sonore.'
      : 'Bridging software engineering, visual arts, and sonic architecture.'),
  };
  const parcoursAria = isFr
    ? 'Parcours et démarche artistique'
    : 'Journey and artistic approach';

  function handleExploreProjects() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const element = document.getElementById('projects');
    if (!element) {
      return;
    }

    /*
     * Imperative scroll wrapped in try/catch with a native fallback
     * (session rule 2): if `scrollIntoView` throws (e.g. a `display: none`
     * ancestor), fall back to `window.scrollTo`.
     */
    try {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (scrollError) {
      void scrollError;
      try {
        const targetTop = element.getBoundingClientRect().top
          + window.scrollY
          - SCROLL_OFFSET;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      } catch (fallbackError) {
        void fallbackError;
      }
    }
  }

  function handleQrImageError(event) {
    /*
     * Non-blocking graceful degradation: if a QR asset 404s, hide the
     * broken `<img>` so the card caption remains and the card never shows
     * a broken-image glyph. Guarded (session rule 2).
     */
    try {
      if (event && event.currentTarget) {
        event.currentTarget.style.display = 'none';
      }
    } catch (imageError) {
      void imageError;
    }
  }

  return (
    <>
      <div className="home-section">
        <div className="home-section__top-bar">
          <div className="home-section__lang-switch" role="group" aria-label="Language selector">
            <button
              type="button"
              className={`home-section__lang-btn ${language === 'fr' ? 'home-section__lang-btn--active' : ''}`}
              onClick={() => setLanguage('fr')}
              aria-pressed={language === 'fr'}
            >
              FR
            </button>
            <span className="home-section__lang-divider" aria-hidden="true">|</span>
            <button
              type="button"
              className={`home-section__lang-btn ${language === 'en' ? 'home-section__lang-btn--active' : ''}`}
              onClick={() => setLanguage('en')}
              aria-pressed={language === 'en'}
            >
              EN
            </button>
          </div>
        </div>

        <div className="home-section__content">
          <p className="home-section__eyebrow">{heroEyebrow}</p>

          <h1 className="home-section__title">
            <span className="home-section__name">Alexandru Dumitru</span>
            <span className="home-section__role">{heroRole}</span>
          </h1>

          <p className="home-section__subtitle">{heroPitch}</p>

          <button
            type="button"
            className="home-section__cta"
            onClick={handleExploreProjects}
          >
            {heroCta}
          </button>
        </div>
      </div>

      <section
        id="parcours"
        className="parcours-section"
        aria-label={parcoursAria}
      >
        <div className="parcours-section__container">
          <div className="parcours-section__header">
            <h2 className="parcours-section__title">{parcours.title}</h2>
            <p className="parcours-section__subtitle">
              {parcours.subtitle}
            </p>
          </div>

          <div className="parcours-section__grid">
            {PARCOURS_ENTRIES.map((entry) => (
              <article className="parcours-card" key={entry.key}>
                <div className="parcours-card__content">
                  <span className="parcours-card__badge">{t(entry.badgeKey)}</span>
                  <h3 className="parcours-card__title">{t(entry.titleKey)}</h3>
                  <p className="parcours-card__description">
                    {t(entry.descKey)}
                  </p>
                  <a
                    href={entry.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="parcours-card__link"
                  >
                    {t(entry.linkKey)}
                  </a>
                </div>
                <div className="parcours-card__qr-wrapper">
                  <img
                    src={resolveAssetUrl(entry.qrPath)}
                    alt={t(entry.qrAltKey)}
                    className="parcours-card__qr"
                    loading="lazy"
                    width={130}
                    height={130}
                    onError={handleQrImageError}
                  />
                  <span className="parcours-card__qr-caption">
                    {t(entry.captionKey)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;