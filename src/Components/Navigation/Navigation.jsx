import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../../Context/LanguageContext';
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
 * Scroll alignment contract:
 *   - Section anchors rely on the browser's native `scroll-margin-top`
 *     (1rem) set on the section containers in SCSS — no custom
 *     coordinate arithmetic in JS. `scrollIntoView({ block: 'start' })`
 *     honors it directly, so jumps to `#skills`/`#projects`/`#contact`
 *     land flush at the top of the split without sidebar jitter.
 *   - `#banner` (Home) always scrolls to the top of the document.
 *
 * Scroll-spy contract:
 *   - Sections are tracked by real-time viewport presence via
 *     `getBoundingClientRect()`. A section becomes active the moment its
 *     top reaches or passes a trigger line at 35% of the viewport height,
 *     measured from the TOP of the viewport (not the document). This keeps
 *     the highlight viewport-relative, so the last section (`#contact`)
 *     can never overshoot onto earlier sections while they are still
 *     being viewed.
 *   - The `scroll` listener is throttled through `requestAnimationFrame`
 *     (with the pending frame cancelled on unmount) and bound with
 *     `{ passive: true }` for fluid scrolling.
 *   - On link click the active state is locked to the clicked target
 *     immediately and scroll-spy is suspended until the smooth animation
 *     settles, so the pill snaps without drifting past intermediate
 *     sections during the animation.
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
 *
 * Bilingual contract (Milestone 9 refactor):
 *   - `useLanguage()` is consumed for localized copy only (brand role,
 *     nav labels, "Say hello"). The FR | EN language toggle is the single
 *     canonical switcher and lives EXCLUSIVELY in the Home hero
 *     (`Home.jsx`, `.home-section__lang-switch`) — this sidebar carries no
 *     language controls, and neither does the top Header.
 */
const NAV_ITEMS = [
  { id: 'banner', labelKey: 'home' },
  { id: 'skills', labelKey: 'skills' },
  { id: 'projects', labelKey: 'projects' },
  { id: 'contact', labelKey: 'contact' },
];

const SOCIAL_LINKS = [
  { id: 'github', label: 'GitHub', href: 'https://github.com/alexandru0705', icon: 'GH' },
];

const IDLE_DELAY_MS = 150;
const SCROLL_LOCK_MS = 750;
const TRIGGER_LINE_FRACTION = 0.35;

/*
 * Resolves the active section id from real-time viewport presence.
 *
 * A trigger line sits at `window.innerHeight * TRIGGER_LINE_FRACTION`
 * (35% down from the top of the viewport). Sections are tested from the
 * LAST to the FIRST; the first one whose top (`getBoundingClientRect().top`)
 * has reached or passed that line is the active section. Sections that
 * are entirely below the line (their top still under the 35% mark) can
 * never win, which is what prevents `#contact` from stealing the
 * highlight while `#projects` is still being viewed.
 *
 * @param {string[]} sectionIds - ordered section ids to test
 * @returns {string} the active section id ('banner' as the safe fallback)
 */
function getActiveSection(sectionIds) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return 'banner';
  }

  const threshold = window.innerHeight * TRIGGER_LINE_FRACTION;

  for (let i = sectionIds.length - 1; i >= 0; i -= 1) {
    const id = sectionIds[i];
    const el = document.getElementById(id);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= threshold) {
        return id;
      }
    }
  }

  return 'banner';
}

function isBrowserEnvironment() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/*
 * Normalizes the raw nav model into a safe render shape (session rule 2):
 *   - id      : non-empty string (entries without a valid id are dropped)
 *   - labelKey: non-empty translation key (falls back to the id)
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
      labelKey: typeof entry.labelKey === 'string' && entry.labelKey.length > 0
        ? entry.labelKey
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
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('banner');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeSectionRef = useRef('banner');
  const idleTimerRef = useRef(null);
  const lockTimerRef = useRef(null);
  const scrollLockedRef = useRef(false);
  const rafIdRef = useRef(null);
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

  const clearLockTimer = useCallback(() => {
    if (lockTimerRef.current !== null) {
      if (isBrowserEnvironment()) {
        window.clearTimeout(lockTimerRef.current);
      }
      lockTimerRef.current = null;
    }
  }, []);

  /*
   * Suspends scroll-spy updates for a short window after a link click so
   * the active pill stays locked to the clicked target while the smooth
   * animation crosses intermediate sections. The lock is always released
   * on unmount via cleanup (defensive rule 2).
   */
  const lockScrollSpy = useCallback((delayMs) => {
    clearLockTimer();
    scrollLockedRef.current = true;
    if (!isBrowserEnvironment()) {
      return;
    }
    lockTimerRef.current = window.setTimeout(() => {
      lockTimerRef.current = null;
      scrollLockedRef.current = false;
    }, delayMs);
  }, [clearLockTimer]);

  /*
   * Scroll-spy (scroll-spy contract): sections are evaluated by their
   * real-time viewport presence via `getBoundingClientRect()` against a
   * trigger line at 35% of the viewport height. The high-frequency
   * `scroll` listener is bound with `{ passive: true }`, throttled
   * through `requestAnimationFrame` (at most one measurement per frame,
   * keeping scrolling fluid), and the pending frame is cancelled in the
   * symmetric unmount cleanup (session rule 2). All DOM/window access is
   * guarded and the measurement runs inside a try/catch so a transient
   * failure can never break the scroll loop.
   */
  useEffect(() => {
    if (!isBrowserEnvironment()) {
      return undefined;
    }

    const validIds = navItems.map((entry) => entry.id);

    function updateActiveSection() {
      if (scrollLockedRef.current) {
        return;
      }
      try {
        const current = getActiveSection(validIds);
        if (current !== activeSectionRef.current) {
          setActiveSection(current);
        }
      } catch (measurementError) {
        /* Non-blocking: a failed measurement keeps the previous state. */
        void measurementError;
      }
    }

    function handleScroll() {
      scheduleIdleReset(IDLE_DELAY_MS);
      if (rafIdRef.current !== null) {
        return;
      }
      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null;
        updateActiveSection();
      });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      clearIdleTimer();
      clearLockTimer();
      scrollLockedRef.current = false;
    };
  }, [navItems, scheduleIdleReset, clearIdleTimer, clearLockTimer]);

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

  /*
   * Section jump handler (scroll alignment contract):
   *   1. Immediately lock the active section to the clicked target (both
   *      state and ref) and suspend scroll-spy for a short window, so the
   *      pill snaps to the target without drifting while the smooth
   *      animation crosses intermediate sections.
   *   2. `#banner` scrolls to the top of the document cleanly.
   *   3. In-split sections (`#skills`, `#projects`, `#contact`) use the
   *      standard `scrollIntoView({ block: 'start' })`, which natively
   *      honors the `scroll-margin-top: 1rem` set on the section
   *      containers — no custom coordinate arithmetic. Guarded native
   *      `window.scrollTo` fallback if `scrollIntoView` throws
   *      (e.g. a `display: none` ancestor) (session rule 2).
   */
  function handleNavClick(targetId) {
    if (typeof targetId !== 'string' || targetId.length === 0) {
      return;
    }
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    setActiveSection(targetId);
    activeSectionRef.current = targetId;
    lockScrollSpy(SCROLL_LOCK_MS);
    setDrawerOpen(false);
    scheduleIdleReset(IDLE_DELAY_MS);

    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    try {
      if (targetId === 'banner') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (scrollError) {
      void scrollError;
      try {
        const top = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: 'smooth' });
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

  const asideClass = drawerOpen
    ? 'navigation navigation--open'
    : 'navigation';

  const panelClass = drawerOpen
    ? 'navigation__panel navigation__panel--open'
    : 'navigation__panel';

  const backdropClass = drawerOpen
    ? 'navigation__backdrop navigation__backdrop--open'
    : 'navigation__backdrop';

  const navDictionary = t('nav') || {};
  const sayHello = (typeof navDictionary.sayHello === 'string' && navDictionary.sayHello.length > 0)
    ? navDictionary.sayHello
    : 'Say hello →';

  return (
    <aside className={asideClass} aria-label="Site navigation">
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
              <span className="navigation__role">{typeof t('hero.role') === 'string' ? t('hero.role') : 'Full-Stack Developer'}</span>
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
                    {typeof navDictionary[entry.labelKey] === 'string' ? navDictionary[entry.labelKey] : entry.labelKey}
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
              {sayHello}
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