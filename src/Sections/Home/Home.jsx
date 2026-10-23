/*
 * Home — Milestone 4: Full-viewport presentation hero.
 * --------------------------------------------------------------------------
 * The presentation banner rendered inside `<section id="banner">` above the
 * global split layout (see `App.jsx`). It carries the editorial "above the
 * fold" story: a role eyebrow, the main `<h1>` name/title, an introductory
 * paragraph on front-end + back-end craftsmanship, and a call-to-action
 * that smooth-scrolls down to the Projects section.
 *
 * Session rules honored:
 *   - Standard function declaration first; `export default Home;` strictly
 *     at the very bottom.
 *   - All imperative DOM access is guarded with
 *     `typeof window !== 'undefined'` / `typeof document !== 'undefined'`.
 *   - The CTA uses `scrollIntoView({ behavior: 'smooth' })` wrapped in a
 *     non-blocking try/catch with a native `window.scrollTo` fallback.
 *   - Zero inline layout CSS — all layout lives in `Home.scss` (BEM) using
 *     tokens from `Styles/variables.scss`.
 */

/*
 * Vertical offset applied to the fallback scroll target. Mirrors the fixed
 * site header height (70px) so the Projects heading lands flush beneath it
 * after navigation.
 */
import './Home.scss';

const SCROLL_OFFSET = 70;

function Home() {
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

  return (
    <div className="home-section">
      <div className="home-section__content">
        <p className="home-section__eyebrow">Salut, je suis</p>

        <h1 className="home-section__title">
          <span className="home-section__name">Alexandru Dumitru</span>
          <span className="home-section__role">Full-Stack Developer</span>
        </h1>

        <p className="home-section__subtitle">
          I craft performant, accessible web experiences end to end — from
          pixel-perfect, responsive front-end interfaces built with React and
          modern CSS architecture, to secure Node.js & MongoDB back-ends
          with clean REST APIs. Every project is an exercise in engineering
          craftsmanship: measured, optimized, and built to last.
        </p>

        <button
          type="button"
          className="home-section__cta"
          onClick={handleExploreProjects}
        >
          Découvrir mes projets
        </button>
      </div>

      <div className="home-section__signature" aria-hidden="true">
        <span className="home-section__signature-line" />
        <span className="home-section__signature-text">Scroll to explore</span>
      </div>
    </div>
  );
}

export default Home;