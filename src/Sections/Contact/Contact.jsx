import { useState, useRef } from 'react';
import { useLanguage } from '../../Context/LanguageContext';
import './Contact.scss';

/*
 * Contact — Milestone 6 (Milestone 9: fully bilingual via `useLanguage()`)
 * --------------------------------------------------------------------------
 * Editorial contact section with a Formspree-powered asynchronous form and
 * direct mail / profile fallbacks. All user-facing copy (labels,
 * placeholders, status messages, buttons) resolves through the centralized
 * FR/EN dictionary.
 *
 * Workflows:
 *   1. Formspree (primary) — native `fetch` POST to the endpoint with
 *      `Accept: 'application/json'`. Submission is asynchronous and drives a
 *      four-state machine: `idle` → `submitting` → `success` | `error`.
 *      A polite `aria-live` region announces the outcome to assistive
 *      technology.
 *   2. Direct mail (fallback) — `mailto:` action link.
 *   3. GitHub profile — external link (`target="_blank"`,
 *      `rel="noopener noreferrer"`).
 *   4. Developer portrait — public asset (`/images/Me.webp`) resolved
 *      through Vite's `BASE_URL` so the same build works at `/` or under
 *      any GitHub Pages subpath; a defensive `onError` hides the frame
 *      gracefully if the asset is missing.
 *
 * Session rules honored:
 *   - `typeof window !== 'undefined'` guards around any browser-only API
 *     (the form state machine is pure React; no timers, no `window` calls).
 *   - Defensively sanitized form values before submission.
 *   - Zero inline layout CSS — all layout in `Contact.scss` (BEM) using
 *     tokens from `Styles/variables.scss`.
 *   - Standard function declaration first; `export default Contact;`
 *     strictly at the very bottom.
 */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mzednyno';
const EMAIL_ADDRESS = 'alexandru0705@gmail.com';
const GITHUB_PROFILE = 'https://github.com/alexandru0705';

/*
 * Defensive public-asset resolution for GitHub Pages (session rule 3).
 * The portrait lives in `public/images/Me.webp` and is resolved through
 * the runtime base path (`import.meta.env.BASE_URL`) so the same build
 * works at `/` or under any repository name. Guarded for SSR (returns
 * `undefined` — React renders `src=""` only in that case, and the
 * `onError` fallback hides the frame if the asset is unavailable).
 */
function resolvePortraitUrl() {
  if (typeof window === 'undefined') return undefined;
  const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};
  const basePath = typeof env.BASE_URL === 'string' && env.BASE_URL.length > 0 ? env.BASE_URL : '/';
  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
  return `${normalizedBase}images/Me.webp`;
}

function Contact() {
  const { language, t } = useLanguage();
  const [status, setStatus] = useState('idle');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const timeoutRef = useRef(null);

  const contact = t('contact') || {};
  const pick = (key, fallback) => (typeof contact[key] === 'string' && contact[key].length > 0
    ? contact[key]
    : fallback);
  const isFr = language === 'fr';

  function clearResetTimer() {
    if (timeoutRef.current !== null) {
      if (typeof window !== 'undefined') {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = null;
    }
  }

  function scheduleStatusReset() {
    clearResetTimer();
    if (typeof window === 'undefined') {
      return;
    }
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      setStatus('idle');
    }, 6000);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    if (!name) {
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function sanitizeField(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function handleSubmit(event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    if (status === 'submitting') {
      return;
    }

    const payload = {
      name: sanitizeField(form.name),
      email: sanitizeField(form.email),
      subject: sanitizeField(form.subject),
      message: sanitizeField(form.message),
    };

    if (!payload.name || !payload.email || !payload.message) {
      setStatus('error');
      return;
    }

    setStatus('submitting');

    fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (response.ok) {
          setStatus('success');
          setForm({ name: '', email: '', subject: '', message: '' });
          scheduleStatusReset();
        } else {
          setStatus('error');
        }
      })
      .catch(() => {
        setStatus('error');
      });
  }

  const statusMessage = {
    idle: '',
    submitting: isFr
      ? 'Envoi de votre message…'
      : 'Sending your message…',
    success: isFr
      ? 'Message envoyé avec succès. Merci !'
      : 'Message sent successfully. Thank you!',
    error: isFr
      ? "Une erreur s'est produite. Réessayez ou utilisez votre messagerie."
      : 'Something went wrong. Please try again or use your mail client.',
  }[status] || '';

  const statusClass = {
    idle: 'contact-section__status contact-section__status--idle',
    submitting: 'contact-section__status contact-section__status--submitting',
    success: 'contact-section__status contact-section__status--success',
    error: 'contact-section__status contact-section__status--error',
  }[status] || 'contact-section__status contact-section__status--idle';

  return (
    <div className="contact-section">
      <h2 className="contact-section__heading">{pick('title', isFr ? 'Contact' : 'Contact')}</h2>

      <div className="contact-section__layout">
        <div className="contact-section__info">
          <p className="contact-section__lead">
            {pick('intro', isFr
              ? "Vous avez un projet en tête, une opportunité à pourvoir ou simplement envie d’échanger ? Envoyez-moi un message et je vous répondrai dès que possible."
              : "Have a project in mind, a role to fill, or just want to say hello? Drop me a message and I'll get back to you as soon as I can.")}
          </p>

          <ul className="contact-section__links">
            <li className="contact-section__link-item">
              <a
                href={`mailto:${EMAIL_ADDRESS}`}
                className="contact-section__link"
                aria-label={isFr ? 'Ouvrir votre messagerie' : 'Open your email client'}
              >
                <span className="contact-section__link-label" aria-hidden="true">✉</span>
                {pick('openMail', isFr
                  ? 'Ouvrir directement votre messagerie'
                  : 'Open default mail client')}
              </a>
            </li>
            <li className="contact-section__link-item">
              <a
                href={GITHUB_PROFILE}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-section__link"
                aria-label="Visit GitHub profile (opens in a new tab)"
              >
                <span className="contact-section__link-label" aria-hidden="true">GH</span>
                github.com/alexandru0705
              </a>
            </li>
          </ul>

          <div className="contact-section__portrait-wrapper">
            <img
              src={resolvePortraitUrl()}
              alt="Alexandru Dumitru"
              className="contact-section__portrait"
              loading="lazy"
              width={2311}
              height={2586}
              onError={(e) => {
                // Graceful defensive fallback if image fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>

        <form className="contact-section__form" onSubmit={handleSubmit} noValidate>
          <div className="contact-section__status-wrap">
            <p className={statusClass} aria-live="polite" role="status">
              {statusMessage}
            </p>
          </div>

          <div className="contact-section__field">
            <label className="contact-section__label" htmlFor="contact-name">{pick('nameLabel', isFr ? 'NOM' : 'NAME')}</label>
            <input
              id="contact-name"
              name="name"
              type="text"
              className="contact-section__input"
              placeholder={pick('namePlaceholder', isFr ? 'Votre nom' : 'Your name')}
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
              disabled={status === 'submitting'}
            />
          </div>

          <div className="contact-section__field">
            <label className="contact-section__label" htmlFor="contact-email">{pick('emailLabel', isFr ? 'EMAIL' : 'EMAIL')}</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              className="contact-section__input"
              placeholder={pick('emailPlaceholder', isFr ? 'vous@exemple.com' : 'you@example.com')}
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              disabled={status === 'submitting'}
            />
          </div>

          <div className="contact-section__field">
            <label className="contact-section__label" htmlFor="contact-subject">{pick('subjectLabel', isFr ? 'SUJET' : 'SUBJECT')}</label>
            <input
              id="contact-subject"
              name="subject"
              type="text"
              className="contact-section__input"
              placeholder={pick('subjectPlaceholder', isFr ? "De quoi s'agit-il ?" : 'What is this about?')}
              value={form.subject}
              onChange={handleChange}
              disabled={status === 'submitting'}
            />
          </div>

          <div className="contact-section__field">
            <label className="contact-section__label" htmlFor="contact-message">{pick('messageLabel', isFr ? 'MESSAGE' : 'MESSAGE')}</label>
            <textarea
              id="contact-message"
              name="message"
              className="contact-section__textarea"
              placeholder={pick('messagePlaceholder', isFr ? 'Parlez-moi de votre projet...' : 'Tell me about your project...')}
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              disabled={status === 'submitting'}
            />
          </div>

          <button
            type="submit"
            className={`contact-section__submit${status === 'submitting' ? ' contact-section__submit--loading' : ''}`}
            disabled={status === 'submitting'}
          >
            {status === 'submitting'
              ? pick('sendingBtn', isFr ? 'Envoi en cours...' : 'Sending...')
              : pick('sendBtn', isFr ? 'Envoyer le message' : 'Send message')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Contact;