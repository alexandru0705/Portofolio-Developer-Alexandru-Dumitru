/*
 * Banner — presentation hero stub.
 * --------------------------------------------------------------------------
 * A self-contained, accessible presentation banner used as the full-viewport
 * hero (`#banner`) above the global split layout. It is intentionally a
 * lightweight, drop-in stub: it renders a gradient presentation surface with
 * the developer's name and a call-to-action anchor into the Projects section.
 *
 * Project rules (session constraints):
 *   - Standard function declaration first; `export default Banner;` strictly
 *     at the very bottom.
 *   - Zero inline layout CSS — all layout lives in `Banner.scss` (BEM).
 *   - Defensive: any imperative DOM access is guarded with
 *     `typeof window !== 'undefined'` and wrapped in try/catch with a native
 *     fallback.
 *
 * Note: `App.jsx` currently renders `<Home />` for the `#banner` section.
 * This component is available as the drop-in replacement for that slot and
 * is kept standalone so the workspace lints cleanly.
 */

/*
 * Resolve the public-folder background image through the Vite base path so
 * the hero works at `/` or under any GitHub Pages repository name
 * (session rule 3). `public/` assets are served at the base path and are
 * fetched at runtime, so this resolves in any browser context and needs no
 * bundler import. Guarded for non-browser environments (session rule 2).
 */
function resolveBannerBackground() {
  if (typeof window === 'undefined') {
    return undefined;
  }
  const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};
  const basePath = typeof env.BASE_URL === 'string' && env.BASE_URL.length > 0
    ? env.BASE_URL
    : window.location.pathname;
  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
  return `${normalizedBase}images/banner-bg.webp`;
}
function Banner() {
  function handleExploreClick() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const element = document.getElementById('projects');
    if (!element) {
      return;
    }

    try {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (scrollError) {
      void scrollError;
      try {
        const targetTop = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      } catch (fallbackError) {
        void fallbackError;
      }
    }
  }

  const bannerBg = resolveBannerBackground();

  return (
    <div className="banner" style={bannerBg ? { '--banner-bg': `url(${bannerBg})` } : undefined}>
      <div className="banner__content">
        <p className="banner__eyebrow">Full-Stack Developer</p>
        <h1 className="banner__title">Alexandru Dumitru</h1>
        <p className="banner__subtitle">
          I design and build performant, accessible web experiences from the
          first pixel to the production deploy.
        </p>
        <button
          type="button"
          className="banner__cta"
          onClick={handleExploreClick}
        >
          Explore my work
        </button>
      </div>
    </div>
  );
}

export default Banner;