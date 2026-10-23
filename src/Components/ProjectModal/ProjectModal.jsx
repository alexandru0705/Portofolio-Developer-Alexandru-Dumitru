import { useState, useRef, useEffect, useCallback } from 'react';
import './ProjectModal.scss';

/*
 * ProjectModal — Milestone 3
 * --------------------------------------------------------------------------
 * An accessible full-details dialog with a screenshot gallery.
 *
 * Accessibility contract (Milestone 3 requirement 3):
 *   - `role="dialog"` + `aria-modal="true"` on the panel.
 *   - Focus containment: on open, focus moves into the dialog (the close
 *     button); while open, `Tab`/`Shift+Tab` cycle within the dialog's
 *     focusable elements only.
 *   - `Escape` key closes the dialog.
 *   - On close, focus is restored to the previously focused element.
 *
 * Defensive posture (session rule 2):
 *   - Every browser API is guarded with `typeof window !== 'undefined'`.
 *   - The previously-focused element is captured in a ref and restored on
 *     close/unmount.
 *   - The carousel image has a native `onError` fallback modifier.
 */
function ProjectModal({ project, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  const images = (typeof project !== 'object' || project === null)
    ? []
    : (Array.isArray(project.images)
      ? project.images.filter((image) => typeof image === 'string' && image.length > 0)
      : []);

  const safeIndex = images.length > 0
    ? Math.max(0, Math.min(currentIndex, images.length - 1))
    : 0;

  const title = (typeof project !== 'object' || project === null)
    ? 'Project'
    : ((typeof project.title === 'string' && project.title.length > 0)
      ? project.title
      : 'Untitled Project');

  const category = (typeof project !== 'object' || project === null)
    ? ''
    : ((typeof project.category === 'string' && project.category.length > 0)
      ? project.category
      : 'Project');

  const description = (typeof project !== 'object' || project === null)
    ? ''
    : ((typeof project.description === 'string' && project.description.length > 0)
      ? project.description
      : '');

  const githubUrl = (typeof project !== 'object' || project === null)
    ? undefined
    : ((typeof project.githubUrl === 'string' && project.githubUrl.length > 0)
      ? project.githubUrl
      : undefined);

  const liveUrl = (typeof project !== 'object' || project === null)
    ? undefined
    : ((typeof project.liveUrl === 'string' && project.liveUrl.length > 0)
      ? project.liveUrl
      : undefined);

  const hasImages = images.length > 0;
  const canNavigate = images.length > 1;

  /*
   * Focus containment: capture the previously focused element on mount,
   * move focus into the dialog, and restore focus on unmount (session
   * rule 2 / Milestone 3 requirement 3).
   */
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    try {
      previouslyFocusedRef.current = document.activeElement;
    } catch (captureError) {
      void captureError;
      previouslyFocusedRef.current = null;
    }

    try {
      if (closeRef.current && typeof closeRef.current.focus === 'function') {
        closeRef.current.focus();
      }
    } catch (focusError) {
      void focusError;
    }

    return () => {
      try {
        const previous = previouslyFocusedRef.current;
        if (previous && typeof previous.focus === 'function') {
          previous.focus();
        }
      } catch (restoreError) {
        void restoreError;
      }
    };
  }, []);

  /*
   * Escape key + Tab focus trapping (Milestone 3 requirement 3). Bound on
   * `document` while the modal is mounted, removed symmetrically on
   * unmount. `typeof window !== 'undefined'` guards the listener.
   */
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    function getFocusableElements() {
      const panel = panelRef.current;
      if (!panel) {
        return [];
      }
      const nodes = panel.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      return Array.from(nodes).filter((node) => {
        if (typeof node.offsetParent === 'undefined') {
          return true;
        }
        return node.offsetParent !== null || node === document.activeElement;
      });
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (typeof onClose === 'function') {
          onClose();
        }
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !panelRef.current || !panelRef.current.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !panelRef.current || !panelRef.current.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleNext = useCallback((event) => {
    if (event && typeof event.stopPropagation === 'function') {
      event.stopPropagation();
    }
    if (images.length === 0) {
      return;
    }
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback((event) => {
    if (event && typeof event.stopPropagation === 'function') {
      event.stopPropagation();
    }
    if (images.length === 0) {
      return;
    }
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  function handleOverlayClick() {
    if (typeof onClose === 'function') {
      onClose();
    }
  }

  function handlePanelClick(event) {
    if (event && typeof event.stopPropagation === 'function') {
      event.stopPropagation();
    }
  }

  function handleCarouselImageError(event) {
    if (event && event.currentTarget) {
      event.currentTarget.classList.add('project-modal__carousel-image--error');
    }
  }

  return (
    <div className="project-modal__overlay" onClick={handleOverlayClick} role="presentation">
      <div
        ref={panelRef}
        className="project-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={handlePanelClick}
      >
        <button
          ref={closeRef}
          type="button"
          className="project-modal__close"
          onClick={handleOverlayClick}
          aria-label="Close dialog"
        >
          ×
        </button>

        <h2 className="project-modal__title">{title}</h2>
        {category.length > 0 && (
          <p className="project-modal__category">{category}</p>
        )}

        {hasImages ? (
          <div className="project-modal__carousel">
            {canNavigate && (
              <button
                type="button"
                className="project-modal__nav project-modal__nav--prev"
                onClick={handlePrev}
                aria-label="Previous image"
              >
                ‹
              </button>
            )}

            <img
              src={images[safeIndex]}
              alt={`${title} slide ${safeIndex + 1}`}
              className="project-modal__carousel-image"
              onError={handleCarouselImageError}
            />

            {canNavigate && (
              <button
                type="button"
                className="project-modal__nav project-modal__nav--next"
                onClick={handleNext}
                aria-label="Next image"
              >
                ›
              </button>
            )}

            {canNavigate && (
              <span className="project-modal__counter" aria-hidden="true">
                {safeIndex + 1} / {images.length}
              </span>
            )}
          </div>
        ) : (
          <div className="project-modal__carousel project-modal__carousel--empty" aria-hidden="true" />
        )}

        {description.length > 0 && (
          <p className="project-modal__description">{description}</p>
        )}

        {(githubUrl || liveUrl) && (
          <div className="project-modal__links">
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="project-modal__btn"
              >
                GitHub Repository ↗
              </a>
            )}
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="project-modal__btn"
              >
                Live Site ↗
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectModal;