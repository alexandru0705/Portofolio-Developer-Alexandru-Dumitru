import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  readStoredLanguage,
  persistLanguage,
  createContextValue,
} from './languageContextBase';
import LanguageContext from './languageContextBase';

/*
 * LanguageContext — Zero-dependency bilingual provider (FR / EN).
 * --------------------------------------------------------------------------
 * Native React Context replacing the removed `i18next` integration:
 *   - `language`   : 'fr' | 'en' — the ACTIVE locale ('fr' by default).
 *   - `setLanguage`: stable setter; validates input ('fr'/'en') and
 *     persists the choice to `localStorage` (guarded, non-throwing).
 *   - `t`          : `(path: string) => string` — resolves a dotted key
 *     path (`'nav.home'`) against `translations[language]`. Unknown
 *     paths resolve to an empty string, and the FR dictionary is used
 *     as a fallback dictionary for any key missing from the active one.
 *
 * Persistence contract (defensive rule 2):
 *   - Initial state reads `localStorage.getItem('portfolio-language')`
 *     only when `typeof window !== 'undefined'`; storage access is
 *     wrapped in try/catch so private-mode / sandboxed browsers never
 *     break the provider.
 *   - Persistence runs in a `useEffect` (no render-phase side effects)
 *     and is fully wrapped in try/catch.
 *   - A symmetric cleanup is returned on unmount (the in-memory locale
 *     needs no disposal; the effect teardown marker keeps the effect
 *     contract explicit and symmetric).
 *
 * Error-boundary contract:
 *   - `LanguageContext` is created with a `null` default. The
 *     `useLanguage()` hook throws a descriptive `Error` (a boundary-
 *     friendly failure) when consumed outside a `<LanguageProvider>`,
 *     so mis-wiring surfaces loudly instead of rendering silently
 *     wrong copy.
 *
 * Module layout: the pure (non-component) helpers live in
 * `languageContextBase.js` so this file exports only the component and
 * the hook, keeping Vite fast-refresh happy.
 */

/*
 * LanguageProvider — owns the locale state + persistence and exposes the
 * consumer contract via context value (memoized so consumers only
 * re-render when `language` actually changes).
 *
 * Props:
 *   children : React node tree wrapped in the provider.
 */
function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readStoredLanguage);

  /*
   * Symmetric persistence effect (defensive rule 2): writes only after
   * render, never throws (try/catch), and returns a no-op cleanup so the
   * effect's mount/unmount contract stays symmetric.
   */
  useEffect(() => {
    persistLanguage(language);
    return () => {
      /* intentional no-op — in-memory locale needs no disposal */
    };
  }, [language]);

  const setLanguage = useCallback((next) => {
    const value = (typeof next === 'string' && SUPPORTED_LANGUAGES.indexOf(next) !== -1)
      ? next
      : DEFAULT_LANGUAGE;
    setLanguageState(value);
  }, []);

  const value = useMemo(
    () => createContextValue(language, setLanguage),
    [language, setLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/*
 * useLanguage — the only supported consumer API.
 *
 * @returns {{ language: string, setLanguage: Function, t: Function }}
 * @throws {Error} when called outside a <LanguageProvider> (boundary-
 *                 friendly: a descriptive error instead of `undefined`).
 */
function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === null) {
    throw new Error('useLanguage must be used within a <LanguageProvider>');
  }
  return context;
}

export { LanguageProvider, useLanguage };
/*
 * The raw context object is NOT re-exported here: a fast-refresh-safe
 * component file may only export components. Import `LanguageContext`
 * from `./languageContextBase` if a boundary/advanced consumer needs it.
 */