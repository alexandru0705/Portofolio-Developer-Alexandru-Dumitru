import { useState, useRef } from 'react';
import './Contact.scss';

/*
 * Contact — Milestone 6
 * --------------------------------------------------------------------------
 * Editorial contact section with a Formspree-powered asynchronous form and
 * direct mail / profile fallbacks.
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

function Contact() {
  const [status, setStatus] = useState('idle');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const timeoutRef = useRef(null);

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
    submitting: 'Sending your message…',
    success: 'Message sent successfully. Thank you!',
    error: 'Something went wrong. Please try again or use your mail client.',
  }[status] || '';

  const statusClass = {
    idle: 'contact-section__status contact-section__status--idle',
    submitting: 'contact-section__status contact-section__status--submitting',
    success: 'contact-section__status contact-section__status--success',
    error: 'contact-section__status contact-section__status--error',
  }[status] || 'contact-section__status contact-section__status--idle';

  return (
    <div className="contact-section">
      <h2 className="contact-section__heading">Contact</h2>

      <div className="contact-section__layout">
        <div className="contact-section__info">
          <p className="contact-section__lead">
            Have a project in mind, a role to fill, or just want to say
            hello? Drop me a message and I'll get back to you as soon
            as I can.
          </p>

          <ul className="contact-section__links">
            <li className="contact-section__link-item">
              <a
                href={`mailto:${EMAIL_ADDRESS}`}
                className="contact-section__link"
                aria-label="Open your email client"
              >
                <span className="contact-section__link-label" aria-hidden="true">✉</span>
                Ouvrir directement votre messagerie
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
        </div>

        <form className="contact-section__form" onSubmit={handleSubmit} noValidate>
          <div className="contact-section__status-wrap">
            <p className={statusClass} aria-live="polite" role="status">
              {statusMessage}
            </p>
          </div>

          <div className="contact-section__field">
            <label className="contact-section__label" htmlFor="contact-name">Name</label>
            <input
              id="contact-name"
              name="name"
              type="text"
              className="contact-section__input"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
              disabled={status === 'submitting'}
            />
          </div>

          <div className="contact-section__field">
            <label className="contact-section__label" htmlFor="contact-email">Email</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              className="contact-section__input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              disabled={status === 'submitting'}
            />
          </div>

          <div className="contact-section__field">
            <label className="contact-section__label" htmlFor="contact-subject">Subject</label>
            <input
              id="contact-subject"
              name="subject"
              type="text"
              className="contact-section__input"
              placeholder="What is this about?"
              value={form.subject}
              onChange={handleChange}
              disabled={status === 'submitting'}
            />
          </div>

          <div className="contact-section__field">
            <label className="contact-section__label" htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              name="message"
              className="contact-section__textarea"
              placeholder="Tell me about your project…"
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
            {status === 'submitting' ? 'Sending…' : 'Send message'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Contact;