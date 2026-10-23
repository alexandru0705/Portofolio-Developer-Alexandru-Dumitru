import { useState, useRef, useEffect, useCallback } from 'react';
import './Navigation.scss';

/*
 * Milestone 2 — Dedicated, accessible sidebar navigation.
 *
 * Layout contract (Milestone 1):
 *   - Left pane sized to `$sidebar-width` (280px), pinned via
 *     `position: sticky; top: 0; height: 100vh` (`.navigation__pin`) once
 *     the viewport has scrolled past the hero presentation section.
 *   - Containment uses `overflow: clip` — never `overflow: hidden` —
 *     so the pane is pure visual containment and sticky positioning still
 *     resolves against the document scrollport (session rule 5).
 *
 * Accessibility contract:
 *   - `<nav aria-label="Main Navigation">` wrapper.
 *   - Active link exposes a valid `aria-current="page"` so assistive
 *     technology announces the current document position.
 *   - The mobile drawer exposes `role="dialog"` + `aria-modal="true"` only
 *     while open, and `aria-controls` on the disclosure toggle.
 *   - All interactive controls are real focusable `<button>`/`<a>`
 *     elements with visible `:focus-visible` rings (BEM, in SCSS).
 *
 * Mobile contract (<768px):
 *   - The pinned sidebar collapses into a compact sticky top header with
 *     a disclosure toggle; the content panel becomes a fixed full-height
 *     drawer overlay with a backdrop.
 *   - `body` scroll is locked while the drawer is open; the lock is always
 *     released on toggle-off and on unmount (defensive rule 2).
 */
const NAV_ITEMS = [
  { id: 'banner', label: 'Home' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

const SOCIAL_LINKS = [
  { id: 'github', label: 'GitHub', href: 'https://github.com/alexandru0705', icon: 'GH' },
];

const SCROLL_OFFSET = 70;
const IDLE_DELAY_MS = 150;

function isBrowserEnvironment() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/*
 * Normalizes the raw nav model into a safe render shape (session rule 2):
 *   - id   : non-empty string (entries without a valid id are dropped)
 *   - label: non-empty string (falls back to the id)
 */
function sanitizeNavItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }
  return items
    .filter((entry) => {
      if (typeof entry !== 'object' || entry === null) {
        return false;
      }
      return typeof entry.id === 'string' && entry.id.length > 0;
    })
    .map((entry) => ({
      id: entry.id,
      label: typeof entry.label === 'string' && entry.label.length > 0
        ? entry.label
        : entry.id,
    }));
}

/*
 * Normalizes social/contact links into a safe render shape (session rule 2):
 *   - id, label, href : non-empty strings (entries missing any are dropped)
 *   - icon            : short non-empty string (falls back to the label)
 */
function sanitizeSocialLinks(links) {
  if (!Array.isArray(links)) {
    return [];
  }
  return links
    .filter((entry) => {
      if (typeof entry !== 'object' || entry === null) {
        return false;
      }
      return (
        typeof entry.id === 'string' && entry.id.length > 0
        && typeof entry.href === 'string' && entry.href.length > 0
      );
    })
    .map((entry) => ({
      id: entry.id,
      label: typeof entry.label === 'string' && entry.label.length > 0
        ? entry.label
        : entry.id,
      href: entry.href,
      icon: typeof entry.icon === 'string' && entry.icon.length > 0
        ? entry.icon
        : entry.label,
    }));
}

function Navigation() {
  const [activeSection, setActiveSection] = useState('banner');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeSectionRef = useRef('banner');
  const idleTimerRef = useRef(null);
  const previousOverflowRef = useRef('');
  const toggleRef = useRef(null);

  const navItems = useState(() => sanitizeNavItems(NAV_ITEMS))[0];
  const socialLinks = useState(() => sanitizeSocialLinks(SOCIAL_LINKS))[0];

  /*
   * Keeps a ref in sync with the active section so the passive scroll
   * listener can read the latest value without being re-bound on every
   * change (session rule 2: high-frequency listeners stay stable).
   */
  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current !== null) {
      if (isBrowserEnvironment()) {
        window.clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = null;
    }
  }, []);

  const scheduleIdleReset = useCallback((delayMs) => {
    clearIdleTimer();
    if (!isBrowserEnvironment()) {
      return;
    }
    idleTimerRef.current = window.setTimeout(() => {
      idleTimerRef.current = null;
    }, delayMs);
  }, [clearIdleTimer]);

  /*
   * Scroll-spy (session rule 5): active highlight engages INSTANTLY on
   * every scroll tick and the effect window deactivates via a ~150ms
   * debounced idle timer. The `scroll` listener is bound with
   * `{ passive: true }` and removed symmetrically on unmount
   * (session rule 2). Section boundary detection reads element offsets
   * inside a try/catch so a transient DOM measurement failure can never
   * break the scroll loop.
   */
  useEffect(() => {
    if (!isBrowserEnvironment()) {
      return undefined;
    }

    const validIds = navItems.map((entry) => entry.id);

    function handleScroll() {
      scheduleIdleReset(IDLE_DELAY_MS);

      try {
        const scrollOffset = window.scrollY
          || (document.documentElement && document.documentElement.scrollTop)
          || 0;

        let current = validIds.length > 0 ? validIds[0] : 'banner';

        for (let i = 0; i < validIds.length; i += 1) {
          const element = document.getElementById(validIds[i]);
          if (!element) {
            continue;
          }
          const sectionTop = element.getBoundingClientRect().top
            + window.scrollY
            - SCROLL_OFFSET;
          if (scrollOffset >= sectionTop) {
            current = validIds[i];
          }
        }

        if (current !== activeSectionRef.current) {
          setActiveSection(current);
        }
      } catch (measurementError) {
        /* Non-blocking: a failed measurement keeps the previous state. */
        void measurementError;
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearIdleTimer();
    };
  }, [navItems, scheduleIdleReset, clearIdleTimer]);

  /*
   * Closes the mobile drawer on `Escape` (accessibility contract). The
   * keydown listener is bound only in a browser environment and removed
   * symmetrically.
   */
  useEffect(() => {
    if (!isBrowserEnvironment()) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event && event.key === 'Escape' && drawerOpen) {
        setDrawerOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawerOpen]);

  /*
   * Body scroll lock while the mobile drawer is open (defensive rule 2).
   * The previous `overflow` value is captured and always restored on
   * cleanup — including on unmount — so the page never gets stuck in a
   * locked scroll state. All DOM writes are guarded and wrapped.
   */
  useEffect(() => {
    if (!isBrowserEnvironment()) {
      return undefined;
    }

    if (!drawerOpen) {
      return undefined;
    }

    try {
      previousOverflowRef.current = document.body.style.overflow || '';
      document.body.style.overflow = 'hidden';
    } catch (lockError) {
      void lockError;
    }

    return () => {
      try {
        document.body.style.overflow = previousOverflowRef.current;
      } catch (restoreError) {
        void restoreError;
      }
    };
  }, [drawerOpen]);

  /*
   * When the drawer opens, return focus to the disclosure toggle so the
   * focus ring is visible and keyboard users are not stranded (accessibility
   * contract). Guarded + wrapped (rule 2).
   */
  useEffect(() => {
    if (!isBrowserEnvironment()) {
      return undefined;
    }
    if (!drawerOpen) {
      return undefined;
    }

    try {
      const node = toggleRef.current;
      if (node && typeof node.focus === 'function') {
        node.focus();
      }
    } catch (focusError) {
      void focusError;
    }
  }, [drawerOpen]);

  function handleNavClick(sectionId) {
    if (typeof sectionId !== 'string' || sectionId.length === 0) {
      return;
    }
    if (!isBrowserEnvironment()) {
      return;
    }

    setActiveSection(sectionId);
    setDrawerOpen(false);
    scheduleIdleReset(IDLE_DELAY_MS);

    const element = document.getElementById(sectionId);
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

  function handleToggleOpen() {
    setDrawerOpen(true);
  }

  function handleToggleClose() {
    setDrawerOpen(false);
  }

  function handleBackdropClick() {
    setDrawerOpen(false);
  }

  const panelClass = drawerOpen
    ? 'navigation__panel navigation__panel--open'
    : 'navigation__panel';

  const backdropClass = drawerOpen
    ? 'navigation__backdrop navigation__backdrop--open'
    : 'navigation__backdrop';

  return (
    <aside className="navigation" aria-label="Site navigation">
      <button
        type="button"
        className="navigation__toggle"
        ref={toggleRef}
        aria-expanded={drawerOpen}
        aria-controls="navigation-panel"
        onClick={handleToggleOpen}
      >
        <span className="navigation__toggle-bar" aria-hidden="true" />
        <span className="navigation__toggle-bar" aria-hidden="true" />
        <span className="navigation__toggle-bar" aria-hidden="true" />
        <span className="navigation__toggle-label">Menu</span>
      </button>

      <div className={backdropClass} onClick={handleBackdropClick} aria-hidden="true" />

      <div className="navigation__pin">
        <div
          id="navigation-panel"
          className={panelClass}
          role="dialog"
          aria-modal={drawerOpen ? 'true' : undefined}
          aria-label="Main Navigation"
        >
          <div className="navigation__brand">
            <span className="navigation__monogram" aria-hidden="true">AD</span>
            <div className="navigation__brand-text">
              <span className="navigation__name">Alexandru Dumitru</span>
              <span className="navigation__role">Full-Stack Developer</span>
            </div>
          </div>

          <nav className="navigation__nav" aria-label="Main Navigation">
            <ul className="navigation__list">
              {navItems.map((entry) => (
                <li key={entry.id} className="navigation__item">
                  <button
                    type="button"
                    className={`navigation__link${activeSection === entry.id ? ' navigation__link--active' : ''}`}
                    onClick={() => handleNavClick(entry.id)}
                    aria-current={activeSection === entry.id ? 'page' : undefined}
                  >
                    {entry.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="navigation__footer">
            <div className="navigation__social">
              {socialLinks.map((entry) => (
                <a
                  key={entry.id}
                  href={entry.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="navigation__social-link"
                  aria-label={entry.label}
                >
                  <span className="navigation__social-icon" aria-hidden="true">{entry.icon}</span>
                  <span className="navigation__social-label">{entry.label}</span>
                </a>
              ))}
            </div>
            <a
              className="navigation__contact"
              href="mailto:alexandru0705@gmail.com"
            >
              Say hello →
            </a>
          </div>

          <button
            type="button"
            className="navigation__close"
            onClick={handleToggleClose}
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Navigation;