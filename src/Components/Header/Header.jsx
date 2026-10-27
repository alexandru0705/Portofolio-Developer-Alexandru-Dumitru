import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../Context/LanguageContext';
import './Header.scss';

/* ==========================================================================
   Header Component — Architectural Specification & Execution Blueprint
   ==========================================================================
   Role & Layout Context:
     - Sits pinned at the top edge of the browser viewport (`z-index: 100`).
     - Coordinates visibility with the `#banner` presentation hero element:
       when the user is in the hero section, the header is fully opaque and
       accessible. As the split viewport takes over on desktop, this bar hides
       symmetrically so the pinned sidebar navigation can claim interaction focus.
     - On mobile screens (<= 768px), this component serves as the CANONICAL
       application navigation anchor. The desktop sidebar is completely
       suppressed via media query (`display: none !important`), leaving this
       header to manage the primary responsive menu.

   Mobile Drawer Interaction & Stacking Context Isolation:
     - Implements a right-aligned sliding drawer overlay for mobile screens.
     - Utilizes `createPortal(..., document.body)` to mount the modal backdrop
       and sliding navigation drawer directly to the root document body.
       This directly circumvents the CSS specification behavior where
       ancestors using `-webkit-backdrop-filter` or `backdrop-filter` establish
       a local containing block that traps `position: fixed` descendants.
     - Body scroll locking is defensively toggled via `document.body.style.overflow`
       with guaranteed restoration in `useEffect` unmount cleanup routines.

   Bilingual State & Social Links Integration:
     - Integrates language dispatch (`fr` / `en`) driven by `LanguageContext`.
     - Houses external social destination targets (`GitHub`) configured with
       strict `rel="noopener noreferrer"` defensive standards.
     - Houses direct contact action link (`mailto:`) for prompt messaging.

   Engineering Integrity Standards Honored:
     - Standard functional declaration pattern ending with default export.
     - Complete runtime environment checks (`typeof window !== 'undefined'`)
       before calling browser layout engines, listeners, or DOM nodes.
     - Strict non-blocking fallback strategy: DOM queries and scroll requests
       are safely wrapped in `try/catch` handlers.
     - Symmetric listener attachment and teardown across component lifecycles.
     - Zero inline styling applied to JSX nodes; appearance is strictly governed
       by BEM class assignments in `Header.scss`.
   ========================================================================== */

/**
 * Defensive runtime check verifying whether browser window and document
 * globals are safely reachable. Prevents fatal evaluation exceptions during
 * static site pre-rendering, headless testing suites, or SSR passes.
 *
 * @returns {boolean} True if the current runtime environment is a browser.
 */
function isBrowserEnvironment() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Executes a smooth scroll movement toward a given DOM section target.
 *
 * Defensive resilience strategy:
 * 1. Validates input parameter type and browser execution context.
 * 2. Attempts native `Element.scrollIntoView({ behavior: 'smooth', block: 'start' })`.
 * 3. Falls back to coordinate arithmetic via `window.scrollTo` if the native
 *    API is unavailable or throws due to layout bounding context anomalies.
 * 4. Fails completely silently without impeding other execution threads if
 *    the targeted element does not exist in the active DOM tree.
 *
 * @param {string} sectionId - Target element ID (without the '#' hash prefix).
 * @returns {void}
 */
function scrollToSection(sectionId) {
  if (!isBrowserEnvironment() || typeof sectionId !== 'string' || !sectionId) {
    return;
  }

  try {
    const targetElement = document.getElementById(sectionId);
    if (!targetElement) {
      return;
    }

    if (typeof targetElement.scrollIntoView === 'function') {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const elementRect = targetElement.getBoundingClientRect();
      const currentScrollTop =
        window.pageYOffset || document.documentElement.scrollTop || 0;
      const targetOffsetTop = elementRect.top + currentScrollTop;

      window.scrollTo({
        top: targetOffsetTop,
        behavior: 'smooth',
      });
    }
  } catch (primaryScrollError) {
    try {
      const fallbackTarget = document.getElementById(sectionId);
      if (fallbackTarget) {
        window.scrollTo(0, fallbackTarget.offsetTop || 0);
      }
    } catch (secondaryScrollError) {
      void secondaryScrollError;
    }
    void primaryScrollError;
  }
}

/**
 * Static registry of external social channels rendered in the mobile navigation drawer.
 * Sealed immutably to prevent runtime pollution.
 */
const RAW_SOCIAL_LINKS = Object.freeze([
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/alexandru0705',
    icon: 'GH',
  },
]);

/**
 * Direct contact mailto configuration.
 */
const MAILTO_CONFIG = Object.freeze({
  href: 'mailto:contact@alexandrudumitru.dev',
  labelKey: 'contactMe',
  fallbackLabel: 'Me contacter',
});

/**
 * Internal section navigation routing descriptors.
 * Mapped to i18n dictionary lookup keys.
 */
const RAW_NAV_LINKS = Object.freeze([
  { id: 'skills', labelKey: 'skills' },
  { id: 'projects', labelKey: 'projects' },
  { id: 'contact', labelKey: 'contact' },
]);

/**
 * Main application Header component.
 *
 * @returns {import('react').JSX.Element} Fully mounted header structure.
 */
function Header() {
  const { language, setLanguage, t } = useLanguage();

  const [isVisible, setIsVisible] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const previousOverflowRef = useRef('');

  const navLinks = Array.isArray(RAW_NAV_LINKS)
    ? RAW_NAV_LINKS.filter(
        (item) =>
          item &&
          typeof item.id === 'string' &&
          typeof item.labelKey === 'string'
      )
    : [];

  const socialLinks = Array.isArray(RAW_SOCIAL_LINKS)
    ? RAW_SOCIAL_LINKS.filter(
        (item) =>
          item &&
          typeof item.id === 'string' &&
          typeof item.href === 'string'
      )
    : [];

  const navDictionary =
    typeof t === 'function' && t('nav') && typeof t('nav') === 'object'
      ? t('nav')
      : {};

  const handleToggleClose = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const handleToggleOpen = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  useEffect(() => {
    if (!isBrowserEnvironment() || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    let bannerObserver = null;

    try {
      const heroElement = document.getElementById('banner');
      if (heroElement) {
        bannerObserver = new IntersectionObserver(
          ([entry]) => {
            if (entry) {
              setIsVisible(Boolean(entry.isIntersecting));
            }
          },
          { threshold: 0.1 }
        );
        bannerObserver.observe(heroElement);
      }
    } catch (observerError) {
      void observerError;
    }

    return () => {
      if (bannerObserver) {
        try {
          bannerObserver.disconnect();
        } catch (disconnectError) {
          void disconnectError;
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!isBrowserEnvironment()) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event && event.key === 'Escape' && drawerOpen) {
        handleToggleClose();
      }
    }

    try {
      window.addEventListener('keydown', handleKeyDown);
    } catch (addListenerError) {
      void addListenerError;
    }

    return () => {
      try {
        window.removeEventListener('keydown', handleKeyDown);
      } catch (removeListenerError) {
        void removeListenerError;
      }
    };
  }, [drawerOpen, handleToggleClose]);

  useEffect(() => {
    if (!isBrowserEnvironment() || !document.body) {
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
        if (document.body) {
          document.body.style.overflow = previousOverflowRef.current;
        }
      } catch (restoreError) {
        void restoreError;
      }
    };
  }, [drawerOpen]);

  function handleDrawerNavClick(sectionId) {
    handleToggleClose();
    scrollToSection(sectionId);
  }

  function handleLanguageSwitch(targetLanguage) {
    if (
      typeof setLanguage === 'function' &&
      (targetLanguage === 'fr' || targetLanguage === 'en')
    ) {
      try {
        setLanguage(targetLanguage);
      } catch (langMutationError) {
        void langMutationError;
      }
    }
  }

  const headerClass = `site-header ${
    isVisible ? 'site-header--visible' : 'site-header--hidden'
  }`;
  const drawerClass = drawerOpen
    ? 'site-header__drawer site-header__drawer--open'
    : 'site-header__drawer';
  const backdropClass = drawerOpen
    ? 'site-header__backdrop site-header__backdrop--open'
    : 'site-header__backdrop';

  const contactButtonText =
    typeof navDictionary[MAILTO_CONFIG.labelKey] === 'string'
      ? navDictionary[MAILTO_CONFIG.labelKey]
      : MAILTO_CONFIG.fallbackLabel;

  const modalContent =
    isBrowserEnvironment() && drawerOpen && document.body
      ? createPortal(
          <>
            <div
              className={backdropClass}
              onClick={handleToggleClose}
              aria-hidden="true"
            />
            <div
              id="site-header-drawer"
              className={drawerClass}
              role="dialog"
              aria-modal="true"
              aria-label="Main Navigation"
            >
              <button
                type="button"
                className="site-header__close"
                onClick={handleToggleClose}
                aria-label="Close navigation"
              >
                ✕
              </button>

              <div
                className="site-header__drawer-lang"
                role="group"
                aria-label="Language selector"
              >
                <button
                  type="button"
                  className={`site-header__drawer-lang-btn${
                    language === 'fr'
                      ? ' site-header__drawer-lang-btn--active'
                      : ''
                  }`}
                  onClick={() => handleLanguageSwitch('fr')}
                  aria-pressed={language === 'fr'}
                >
                  FR
                </button>
                <span
                  className="site-header__drawer-lang-divider"
                  aria-hidden="true"
                >
                  |
                </span>
                <button
                  type="button"
                  className={`site-header__drawer-lang-btn${
                    language === 'en'
                      ? ' site-header__drawer-lang-btn--active'
                      : ''
                  }`}
                  onClick={() => handleLanguageSwitch('en')}
                  aria-pressed={language === 'en'}
                >
                  EN
                </button>
              </div>

              <nav
                className="site-header__drawer-nav"
                aria-label="Mobile Navigation"
              >
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    type="button"
                    className="site-header__drawer-link"
                    onClick={() => handleDrawerNavClick(link.id)}
                  >
                    {typeof navDictionary[link.labelKey] === 'string'
                      ? navDictionary[link.labelKey]
                      : link.labelKey}
                  </button>
                ))}
              </nav>

              <div className="site-header__drawer-footer">
                <div className="site-header__drawer-social">
                  {socialLinks.map((item) => (
                    <a
                      key={item.id}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="site-header__drawer-social-link"
                      aria-label={item.label}
                    >
                      <span
                        className="site-header__drawer-social-icon"
                        aria-hidden="true"
                      >
                        {item.icon}
                      </span>
                      <span className="site-header__drawer-social-label">
                        {item.label}
                      </span>
                    </a>
                  ))}
                </div>

                <a
                  href={MAILTO_CONFIG.href}
                  className="site-header__drawer-contact-btn"
                  onClick={handleToggleClose}
                >
                  {contactButtonText}
                </a>
              </div>
            </div>
          </>,
          document.body
        )
      : null;

  return (
    <>
      <header className={headerClass}>
        <div className="site-header__inner">
          <a
            className="site-header__brand"
            href="#banner"
            onClick={(event) => {
              if (event && typeof event.preventDefault === 'function') {
                event.preventDefault();
              }
              scrollToSection('banner');
            }}
          >
            Alexandru Dumitru
          </a>

          <nav className="site-header__nav" aria-label="Primary">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                className="site-header__link"
                onClick={() => scrollToSection(link.id)}
              >
                {typeof navDictionary[link.labelKey] === 'string'
                  ? navDictionary[link.labelKey]
                  : link.labelKey}
              </button>
            ))}
          </nav>

          <button
            type="button"
            id="site-header-toggle"
            className="site-header__toggle"
            aria-expanded={drawerOpen}
            aria-controls="site-header-drawer"
            aria-label="Toggle navigation menu"
            onClick={handleToggleOpen}
          >
            <span className="site-header__toggle-bar" aria-hidden="true" />
            <span className="site-header__toggle-bar" aria-hidden="true" />
            <span className="site-header__toggle-bar" aria-hidden="true" />
            <span className="site-header__toggle-label">Menu</span>
          </button>
        </div>
      </header>
      {modalContent}
    </>
  );
}

export default Header;