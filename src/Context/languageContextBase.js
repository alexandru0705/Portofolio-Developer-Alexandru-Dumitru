import { translations } from '../Data/translations';

/*
 * languageContextBase.js — framework-agnostic core of the zero-dependency
 * i18n provider (FR / EN). Kept in a dedicated non-component module so
 * `LanguageContext.jsx` exports ONLY the component + hook (the Vite
 * `react-refresh` rule requires a component file to export components
 * exclusively).
 *
 * Contains the context object, locale constants, persistence helpers and
 * the memoized context-value factory (no React hooks live here).
 */
import { createContext } from 'react';

export const STORAGE_KEY = 'portfolio-language';
export const DEFAULT_LANGUAGE = 'fr';
export const SUPPORTED_LANGUAGES = ['fr', 'en'];

/*
 * Resolves a dotted path (e.g. `contact.nameLabel`) against a dictionary
 * object. Returns the string value when the full path exists and the
 * terminal value is a non-empty string; otherwise `undefined`
 * (callers decide the fallback).
 *
 * @param {object} dictionary - locale dictionary (e.g. translations.fr)
 * @param {string} path - dotted key path
 * @returns {string|undefined} the resolved string, if any
 */
function resolvePath(dictionary, path) {
  if (typeof dictionary !== 'object' || dictionary === null) {
    return undefined;
  }
  if (typeof path !== 'string' || path.length === 0) {
    return undefined;
  }
  const segments = path.split('.');
  let node = dictionary;
  for (let i = 0; i < segments.length; i += 1) {
    if (typeof node !== 'object' || node === null) {
      return undefined;
    }
    node = node[segments[i]];
  }
  return typeof node === 'string' && node.length > 0 ? node : undefined;
}

/*
 * Lazy initializer helper: reads the persisted language once (SSR-safe —
 * `window` is guarded; storage errors are swallowed and the default 'fr'
 * is used).
 *
 * @returns {string} the initial locale ('fr' | 'en')
 */
function readStoredLanguage() {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return DEFAULT_LANGUAGE;
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return (typeof stored === 'string' && SUPPORTED_LANGUAGES.indexOf(stored) !== -1)
      ? stored
      : DEFAULT_LANGUAGE;
  } catch (readError) {
    void readError;
    return DEFAULT_LANGUAGE;
  }
}

/*
 * Persisted the given locale to `localStorage` (guarded, non-throwing:
 * private-mode / quota errors leave the in-memory locale working).
 *
 * @param {string} language - the locale to persist
 */
function persistLanguage(language) {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch (writeError) {
    /* Private mode / quota errors: the in-memory locale still works. */
    void writeError;
  }
}

/*
 * Builds the memoized context value for a given locale: `{ language,
 * setLanguage, t }`. `t(path)` resolves a dotted key path against the
 * active dictionary, with the FR dictionary as fallback for any missing
 * key, and an empty string as the terminal fallback.
 *
 * @param {string} language - the active locale
 * @param {Function} setLanguage - stable setter
 * @returns {{ language: string, setLanguage: Function, t: Function }}
 */
function createContextValue(language, setLanguage) {
  const active = translations[language] || translations[DEFAULT_LANGUAGE] || {};
  const fallback = translations[DEFAULT_LANGUAGE] || {};

  function t(path) {
    return resolvePath(active, path)
      || resolvePath(fallback, path)
      || '';
  }

  return { language, setLanguage, t };
}

export { resolvePath, readStoredLanguage, persistLanguage, createContextValue };
export const LanguageContext = createContext(null);
export default LanguageContext;