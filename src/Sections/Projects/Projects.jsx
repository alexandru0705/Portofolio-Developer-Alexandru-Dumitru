import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '../../Context/LanguageContext';
import { projectsData } from '../../Data/projectsData';
import ProjectCard from '../../Components/ProjectCard/ProjectCard';
import ProjectModal from '../../Components/ProjectModal/ProjectModal';
import './Projects.scss';

/*
 * Projects — Milestone 3 (Milestone 8: single-card showcase carousel)
 * --------------------------------------------------------------------------
 * An editorial single-card carousel with a category filter bar and modal
 * deep-dive integration. The multi-column grid has been REPLACED: exactly
 * one project card is presented at a time in a centered carousel viewport
 * (max-width 820px) that fits neatly below the filter bar. Full project
 * details + gallery still live in the accessible `ProjectModal`.
 *
 * Carousel mechanics:
 *   - `activeCategory` filter ("Tous" = all); switching filters resets
 *     `currentIndex` to 0.
 *   - `currentIndex` is always clamped to `[0, visibleProjects.length - 1]`
 *     for rendering (a derived `safeIndex` guards against any out-of-range
 *     drift when the filtered set shrinks).
 *   - Previous (←) / Next (→) controls flank the card and support CIRCULAR
 *     wrap-around (modulo arithmetic) — the carousel loops infinitely
 *     between the last and first slides; the buttons stay enabled whenever
 *     more than one project is visible. A zero-padded counter (`01 / 06`)
 *     + bullet dots sit under the card.
 *   - Arrow-key navigation: Left/Right arrows move the carousel while the
 *     region has focus (the region is focusable via `tabIndex={0}`); the
 *     `keydown` listener is bound on the region element and removed
 *     symmetrically (event cleanup, session rule 2).
 *   - Empty guard: if the filtered set is empty, a graceful empty state
 *     replaces the carousel viewport.
 *
 * Asset resolution (GitHub Pages, session rule 3):
 *   Public-folder images referenced by `projectsData` are resolved through
 *   the runtime base path (`import.meta.env.BASE_URL`) so the same build
 *   works at `/` or under any repository name. Root-relative strings are
 *   never hardcoded in SCSS or emitted as raw literals.
 *
 * Defensive posture (session rule 2):
 *   - Every browser API is guarded with `typeof window !== 'undefined'`.
 *   - All data is sanitized with `Array.isArray()` and explicit shape
 *     checks before render.
 *   - The modal idle timer id lives in a `useRef` and is cleared on
 *     unmount.
 *   - High-frequency scroll work is wrapped in try/catch with native
 *     fallbacks.
 */

/*
 * Defensive image resolution for GitHub Pages (session rule 3).
 *
 * Public-folder images referenced by `projectsData` are resolved through
 * the runtime base path (`import.meta.env.BASE_URL`, which is set to the
 * GitHub Pages site path) so the same build works at `/` or under any
 * repository name.
 */
function resolveProjectImage(path) {
  if (typeof path !== 'string' || path.length === 0) {
    return undefined;
  }
  if (!path.startsWith('/')) {
    return path;
  }
  if (typeof window === 'undefined') {
    return undefined;
  }
  const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};
  const basePath = typeof env.BASE_URL === 'string' && env.BASE_URL.length > 0
    ? env.BASE_URL
    : window.location.pathname;
  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
  return `${normalizedBase}${path.slice(1)}`;
}

/*
 * Normalizes an arbitrary `projectsData` entry into a safe, fully-typed
 * preview shape. Guarantees:
 *   - id        : non-empty string (falls back to list index)
 *   - title     : non-empty string
 *   - category  : string (safe to render)
 *   - description: string (safe to render)
 *   - images    : array of non-empty resolved URL strings
 *   - tags      : array of non-empty strings
 *   - githubUrl / liveUrl : non-empty strings or undefined
 */
function sanitizeProject(rawProject, index) {
  if (typeof rawProject !== 'object' || rawProject === null) {
    return null;
  }

  const fallbackId = `project-${index + 1}`;
  const id = (typeof rawProject.id === 'string' && rawProject.id.length > 0)
    ? rawProject.id
    : fallbackId;

  const title = (typeof rawProject.title === 'string' && rawProject.title.length > 0)
    ? rawProject.title
    : 'Untitled Project';

  const category = (typeof rawProject.category === 'string' && rawProject.category.length > 0)
    ? rawProject.category
    : 'Project';

  const description = (typeof rawProject.description === 'string' && rawProject.description.length > 0)
    ? rawProject.description
    : 'Description à venir pour ce projet.'; //Fallback txt

  const images = Array.isArray(rawProject.images)
    ? rawProject.images
      .map((image) => resolveProjectImage(image))
      .filter((image) => typeof image === 'string' && image.length > 0)
    : [];

  const tags = Array.isArray(rawProject.tags)
    ? rawProject.tags
      .filter((tag) => typeof tag === 'string' && tag.length > 0)
    : [];

  const githubUrl = (typeof rawProject.githubUrl === 'string' && rawProject.githubUrl.length > 0)
    ? rawProject.githubUrl
    : undefined;

  const liveUrl = (typeof rawProject.liveUrl === 'string' && rawProject.liveUrl.length > 0)
    ? rawProject.liveUrl
    : undefined;

  /*
   * Bilingual deep-dive details for `ProjectModal` (see `projectsData.js`):
   * a `{ fr, en }` object. Passed through as-is when it is a plain object
   * (the modal resolves the active locale defensively); anything else
   * degrades to `null` so the modal simply omits the details sections.
   */
  const modalDetails = (typeof rawProject.modalDetails === 'object' && rawProject.modalDetails !== null)
    ? rawProject.modalDetails
    : null;

  return {
    id,
    title,
    category,
    description,
    images,
    tags,
    githubUrl,
    liveUrl,
    modalDetails,
  };
}

/*
 * Derives the ordered, de-duplicated list of categories from the sanitized
 * projects. The "Tous" (All) pseudo-category is always first. Categories
 * are derived dynamically from the data so the filter bar never drifts
 * from the actual project set.
 *
 * @param {Array} projects - sanitized project objects
 * @param {string} allFilterLabel - localized "all" label (projects.allFilter)
 * @returns {string[]} the ordered category list
 */
function deriveCategories(projects, allFilterLabel) {
  const allLabel = (typeof allFilterLabel === 'string' && allFilterLabel.length > 0)
    ? allFilterLabel
    : 'Tous';
  if (!Array.isArray(projects)) {
    return [allLabel];
  }
  const seen = new Set();
  const categories = [allLabel];
  for (let i = 0; i < projects.length; i += 1) {
    const project = projects[i];
    if (typeof project !== 'object' || project === null) {
      continue;
    }
    const category = (typeof project.category === 'string' && project.category.length > 0)
      ? project.category
      : 'Project';
    if (!seen.has(category)) {
      seen.add(category);
      categories.push(category);
    }
  }
  return categories;
}

/*
 * Clamps an arbitrary value into `[0, max]`. Guarded: returns 0 when the
 * bounds are not finite non-negative numbers (session rule 2).
 */
function clampIndex(value, max) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }
  if (typeof max !== 'number' || !Number.isFinite(max) || max < 0) {
    return 0;
  }
  const floored = Math.floor(value);
  return Math.min(Math.max(floored, 0), Math.floor(max));
}

/*
 * Zero-pads an index/total pair for the slide counter display
 * (`1 / 6` → `01 / 06`).
 */
function formatCounter(index, total) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(index)} / ${pad(total)}`;
}

function Projects() {
  const { t } = useLanguage();
  const projectsDictionary = t('projects') || {};
  const allFilter = (typeof projectsDictionary.allFilter === 'string' && projectsDictionary.allFilter.length > 0)
    ? projectsDictionary.allFilter
    : 'Tous';
  /*
   * Locale-change reset (the canonical React "adjust state when a value
   * changes" pattern — no refs, no effect, no cascading renders): the
   * active filter is clamped to the localized "all" label whenever the
   * locale flips, so a selection stored under the previous locale never
   * stops matching the derived category list and shows an empty carousel.
   */
  const [rawFilter, setRawFilter] = useState(allFilter);
  const activeCategory = typeof rawFilter === 'string' && rawFilter.length > 0
    ? rawFilter
    : allFilter;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalProject, setModalProject] = useState(null);
  const idleTimerRef = useRef(null);
  const carouselRef = useRef(null);

  const projects = useMemo(() => {
    if (!Array.isArray(projectsData)) {
      return [];
    }
    return projectsData
      .map((rawProject, index) => sanitizeProject(rawProject, index))
      .filter((project) => project !== null);
  }, []);

  const categories = useMemo(
    () => deriveCategories(projects, allFilter),
    [projects, allFilter],
  );

  const visibleProjects = useMemo(() => {
    if (!Array.isArray(projects)) {
      return [];
    }
    if (activeCategory === allFilter) {
      return projects;
    }
    return projects.filter((project) => project.category === activeCategory);
  }, [projects, activeCategory, allFilter]);

  const totalProjects = visibleProjects.length;
  const safeIndex = clampIndex(currentIndex, totalProjects - 1);
  const activeProject = totalProjects > 0 ? visibleProjects[safeIndex] : null;
  const hasMultiple = totalProjects > 1;

  /*
   * Debounced idle timer (session rule 5): effect window deactivates
   * ~150ms after the last interaction. The timer id is stored in a ref
   * and cleared on unmount (session rule 2).
   */
  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current !== null) {
      if (typeof window !== 'undefined') {
        window.clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = null;
    }
  }, []);

  const scheduleIdleReset = useCallback((delayMs) => {
    clearIdleTimer();
    if (typeof window === 'undefined') {
      return;
    }
    idleTimerRef.current = window.setTimeout(() => {
      idleTimerRef.current = null;
    }, delayMs);
  }, [clearIdleTimer]);

  useEffect(() => {
    return () => {
      clearIdleTimer();
    };
  }, [clearIdleTimer]);

  /*
   * Navigation step helpers, memoized so the keyboard-navigation effect's
   * dependency list stays stable across renders (session rule 2: bound
   * listeners must not be re-created on every render).
   *
   * Circular wrap-around: previous/next use modulo arithmetic so the
   * carousel loops infinitely between the last and first slides — no
   * linear clamping at the boundaries.
   */
  const goToNext = useCallback(() => {
    if (totalProjects <= 1) return;
    setCurrentIndex((previous) => (previous + 1) % totalProjects);
    scheduleIdleReset(150);
  }, [totalProjects, scheduleIdleReset]);

  const goToPrevious = useCallback(() => {
    if (totalProjects <= 1) return;
    setCurrentIndex((previous) => (previous - 1 + totalProjects) % totalProjects);
    scheduleIdleReset(150);
  }, [totalProjects, scheduleIdleReset]);

  const goToSlide = useCallback((targetIndex) => {
    setCurrentIndex((previous) => {
      const clamped = clampIndex(targetIndex, totalProjects - 1);
      return clamped === previous ? previous : clamped;
    });
    scheduleIdleReset(150);
  }, [totalProjects, scheduleIdleReset]);

  /*
   * Body scroll lock while the modal is open (defensive rule 2). The
   * previous `overflow` value is captured and always restored on cleanup
   * — including on unmount — so the page never gets stuck locked.
   */
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }
    if (!modalProject) {
      return undefined;
    }
    try {
      const previous = document.body.style.overflow || '';
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previous;
      };
    } catch (lockError) {
      void lockError;
      return undefined;
    }
  }, [modalProject]);

  /*
   * Keyboard navigation: Left/Right arrows move the carousel while the
   * carousel region holds focus (the region is focusable via
   * `tabIndex={0}`). Bound on the region element with `addEventListener`
   * and removed symmetrically on unmount / re-render (event cleanup,
   * session rule 2). Guarded for non-browser environments.
   */
  useEffect(() => {
    const region = carouselRef.current;
    if (!region || typeof region.addEventListener !== 'function') {
      return undefined;
    }

    function handleKeyDown(event) {
      if (!event || typeof event.key !== 'string') {
        return;
      }
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        return;
      }
      if (typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      if (event.key === 'ArrowLeft') {
        goToPrevious();
      } else {
        goToNext();
      }
    }

    region.addEventListener('keydown', handleKeyDown);
    return () => {
      region.removeEventListener('keydown', handleKeyDown);
    };
  }, [totalProjects, goToNext, goToPrevious]);

  function handleCategorySelect(category) {
    if (typeof category !== 'string' || category.length === 0) {
      return;
    }
    setRawFilter(category);
    setCurrentIndex(0);
    scheduleIdleReset(150);
  }

  function handleCardInspect(project) {
    if (typeof project !== 'object' || project === null) {
      return;
    }
    setModalProject(project);
    scheduleIdleReset(150);
  }

  function handleModalClose() {
    setModalProject(null);
    scheduleIdleReset(150);
  }

  function handleCardImageError(event) {
    if (event && event.currentTarget) {
      event.currentTarget.classList.add('project-card__image--error');
      event.currentTarget.classList.add('project-card__media--error');
    }
  }

  const hasProjects = Array.isArray(projects) && projects.length > 0;

  const heading = typeof projectsDictionary.title === 'string' && projectsDictionary.title.length > 0
    ? projectsDictionary.title
    : 'Projects';
  const emptyMessage = typeof projectsDictionary.empty === 'string' && projectsDictionary.empty.length > 0
    ? projectsDictionary.empty
    : 'No projects in this category.';
  const projectUnit = typeof projectsDictionary.projectSingular === 'string' ? projectsDictionary.projectSingular : 'project';
  const projectUnits = typeof projectsDictionary.projectPlural === 'string' ? projectsDictionary.projectPlural : 'projects';

  if (!hasProjects) {
    return (
      <div className="projects-section projects-section--empty">
        <h2 className="projects-section__heading">{heading}</h2>
        <p className="projects-section__empty-message">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="projects-section">
      <h2 className="projects-section__heading">{heading}</h2>

      <div
        className="projects-section__filter-bar"
        role="group"
        aria-label="Filter projects by category"
      >
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`projects-section__filter${activeCategory === category ? ' projects-section__filter--active' : ''}`}
            aria-pressed={activeCategory === category}
            onClick={() => handleCategorySelect(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {totalProjects === 0 ? (
        <p className="projects-section__empty-message">
          {emptyMessage}
        </p>
      ) : (
        <div
          className="projects-section__carousel"
          ref={carouselRef}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label={`Project showcase, ${totalProjects} ${totalProjects === 1 ? projectUnit : projectUnits}`}
        >
          <div className="projects-section__carousel-frame">
            <button
              type="button"
              className="projects-section__nav projects-section__nav--prev"
              onClick={goToPrevious}
              disabled={!hasMultiple}
              aria-label="Previous project"
            >
              ←
            </button>

            <div
              className="projects-section__viewport"
              aria-live="polite"
            >
              {activeProject && (
                <div
                  key={activeProject.id}
                  className="projects-section__slide"
                >
                  <ProjectCard
                    project={activeProject}
                    onSelectProject={handleCardInspect}
                    imageSrc={activeProject.images.length > 0 ? activeProject.images[0] : undefined}
                    onError={handleCardImageError}
                    detailsLabel={typeof projectsDictionary.detailsBtn === 'string' && projectsDictionary.detailsBtn.length > 0
                      ? projectsDictionary.detailsBtn
                      : 'Détails'}
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              className="projects-section__nav projects-section__nav--next"
              onClick={goToNext}
              disabled={!hasMultiple}
              aria-label="Next project"
            >
              →
            </button>
          </div>

          <div className="projects-section__controls">
            <span
              className="projects-section__counter"
              aria-hidden="true"
            >
              {formatCounter(safeIndex + 1, totalProjects)}
            </span>

            <div
              className="projects-section__dots"
              role="group"
              aria-label="Choose project to display"
            >
              {visibleProjects.map((project, index) => (
                <button
                  key={project.id}
                  type="button"
                  className={`projects-section__dot${index === safeIndex ? ' projects-section__dot--active' : ''}`}
                  aria-label={`Go to project ${index + 1} of ${totalProjects}: ${project.title}`}
                  aria-current={index === safeIndex ? 'true' : undefined}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>

            <span className="projects-section__total" aria-hidden="true">
              {totalProjects} {totalProjects === 1 ? projectUnit : projectUnits}
            </span>
          </div>
        </div>
      )}

      {modalProject && (
        <ProjectModal project={modalProject} onClose={handleModalClose} />
      )}
    </div>
  );
}

export default Projects;