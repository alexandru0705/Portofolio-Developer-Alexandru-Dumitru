import { useEffect, useState } from 'react';
import { useLanguage } from '../../Context/LanguageContext';
import './Header.scss';

/*
 * Header — floating, glassmorphic top navigation bar.
 *
 * Sits fixed across the top of the viewport (z-index 100) above the
 * `#banner` hero. When the hero leaves the viewport and the sidebar
 * <Navigation /> takes over, the header smoothly transitions out.
 * Scrolling back up into the hero restores it.
 *
 * Layout contract (Milestone 9 refactor):
 *   - Left: brand ("Alexandru Dumitru").
 *   - Right: nav links only (`skills`, `projects`, `contact`).
 *   - The FR | EN language toggle lives EXCLUSIVELY in the Home hero
 *     <Home /> (`.home-section__lang-switch`, top right) — this header and
 *     the sidebar <Navigation /> carry no language controls.
 *
 * Bilingual contract (Milestone 9):
 *   - The nav links are fully data-driven through `useLanguage()`
 *     (FR by default, EN on demand).
 *
 * Session rules honored:
 *   - Standard function declaration; `export default Header;` at the bottom.
 *   - Every browser API is guarded with `typeof window !== 'undefined'`
 *     / `typeof document !== 'undefined'` and observers are disconnected
 *     symmetrically on unmount.
 */

/**
 * Smoothly scroll the element with the given DOM id into view.
 * Guarded: no-op if `window`/`document` are unavailable or the
 * target element does not exist.
 *
 * @param {string} sectionId - DOM id of the target section (without `#`).
 */
function scrollToSection(sectionId) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  const element = document.getElementById(sectionId);
  if (element && typeof element.scrollIntoView === 'function') {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

function Header() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);

  /*
   * Observe the hero `#banner`: when the hero is in view, the top
   * header is visible. As soon as the hero scrolls out of view,
   * the header hides so it never clashes with the sidebar navigation.
   */
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    const heroElement = document.getElementById('banner');
    if (!heroElement || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Visible as long as at least some of the hero is on screen
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1
      }
    );

    observer.observe(heroElement);
    return () => observer.disconnect();
  }, []);

  const navDictionary = t('nav') || {};
  const navLinks = [
    { id: 'skills', labelKey: 'skills' },
    { id: 'projects', labelKey: 'projects' },
    { id: 'contact', labelKey: 'contact' },
  ];

  return (
    <header className={`site-header ${isVisible ? 'site-header--visible' : 'site-header--hidden'}`}>
      <div className="site-header__inner">
        <a
          className="site-header__brand"
          href="#banner"
          onClick={(event) => {
            event.preventDefault();
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
              {typeof navDictionary[link.labelKey] === 'string' ? navDictionary[link.labelKey] : link.labelKey}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;