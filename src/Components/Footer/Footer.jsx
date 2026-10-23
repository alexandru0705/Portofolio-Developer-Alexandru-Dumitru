import './Footer.scss';

/*
 * Footer — Milestone 7
 * --------------------------------------------------------------------------
 * Minimal, editorial site footer rendered at the bottom of the right
 * content stream (see `App.jsx`). Carries the identity/copyright line,
 * a build/hosting colophon, a "Retour en haut" smooth-scroll CTA, and
 * quick links to the GitHub profile and a direct mailto.
 *
 * Session rules honored:
 *   - `typeof window !== 'undefined'` guard around the imperative scroll.
 *   - Non-blocking try/catch with a native fallback so a failed
 *     `scrollTo` never throws.
 *   - Zero inline layout CSS — all layout in `Footer.scss` (BEM) using
 *     tokens from `Styles/variables.scss`.
 *   - Standard function declaration first; `export default Footer;`
 *     strictly at the very bottom.
 */
const GITHUB_PROFILE = 'https://github.com/alexandru0705';
const EMAIL_ADDRESS = 'alexandru0705@gmail.com';

function Footer() {
  function handleBackToTop() {
    if (typeof window === 'undefined') {
      return;
    }

    /*
     * Imperative scroll wrapped in try/catch with a non-blocking fallback
     * (session rule 2): if `window.scrollTo` with options throws in a
     * legacy engine, fall back to the synchronous `window.scrollTo(0, 0)`.
     */
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (scrollError) {
      void scrollError;
      try {
        window.scrollTo(0, 0);
      } catch (fallbackError) {
        void fallbackError;
      }
    }
  }

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__identity">
          <p className="site-footer__copyright">
            &copy; 2026 Alexandru Dumitru. Tous droits réservés.
          </p>
          <p className="site-footer__colophon">
            Conçu &amp; développé avec React, Vite &amp; SCSS — Hébergé sur GitHub Pages.
          </p>
        </div>

        <div className="site-footer__actions">
          <ul className="site-footer__links" aria-label="Quick links">
            <li className="site-footer__link-item">
              <a
                href={GITHUB_PROFILE}
                target="_blank"
                rel="noopener noreferrer"
                className="site-footer__link"
                aria-label="Visit GitHub profile (opens in a new tab)"
              >
                GitHub
              </a>
            </li>
            <li className="site-footer__link-item">
              <a
                href={`mailto:${EMAIL_ADDRESS}`}
                className="site-footer__link"
                aria-label="Open your email client"
              >
                Email
              </a>
            </li>
          </ul>

          <button
            type="button"
            className="site-footer__top"
            onClick={handleBackToTop}
            aria-label="Back to top"
          >
            Retour en haut ↑
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;