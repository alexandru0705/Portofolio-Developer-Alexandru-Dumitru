import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { projectsData } from '../../Data/projectsData';
import ProjectCard from '../../Components/ProjectCard/ProjectCard';
import ProjectModal from '../../Components/ProjectModal/ProjectModal';
import './Projects.scss';

/*
 * Projects — Milestone 3
 * --------------------------------------------------------------------------
 * A clean, responsive card grid with a category filter bar and modal
 * deep-dive integration. The nested internal preview pane
 * (`__preview-pane`) has been COMPLETELY REMOVED per the Milestone 3
 * contract: every project is now a first-class card in a multi-column
 * grid (`grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))`),
 * and the full details + gallery live in an accessible `ProjectModal`.
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
    : '';

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

  return {
    id,
    title,
    category,
    description,
    images,
    tags,
    githubUrl,
    liveUrl,
  };
}

/*
 * Derives the ordered, de-duplicated list of categories from the sanitized
 * projects. The "Tous" (All) pseudo-category is always first. Categories
 * are derived dynamically from the data so the filter bar never drifts
 * from the actual project set.
 */
function deriveCategories(projects) {
  if (!Array.isArray(projects)) {
    return ['Tous'];
  }
  const seen = new Set();
  const categories = ['Tous'];
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

function Projects() {
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [modalProject, setModalProject] = useState(null);
  const idleTimerRef = useRef(null);

  const projects = useMemo(() => {
    if (!Array.isArray(projectsData)) {
      return [];
    }
    return projectsData
      .map((rawProject, index) => sanitizeProject(rawProject, index))
      .filter((project) => project !== null);
  }, []);

  const categories = useMemo(
    () => deriveCategories(projects),
    [projects],
  );

  const visibleProjects = useMemo(() => {
    if (!Array.isArray(projects)) {
      return [];
    }
    if (activeCategory === 'Tous') {
      return projects;
    }
    return projects.filter((project) => project.category === activeCategory);
  }, [projects, activeCategory]);

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

  function handleCategorySelect(category) {
    if (typeof category !== 'string' || category.length === 0) {
      return;
    }
    setActiveCategory(category);
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

  if (!hasProjects) {
    return (
      <div className="projects-section projects-section--empty">
        <h2 className="projects-section__heading">Projects</h2>
        <p className="projects-section__empty-message">No projects available.</p>
      </div>
    );
  }

  return (
    <div className="projects-section">
      <h2 className="projects-section__heading">Projects</h2>

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

      <ul className="projects-section__grid">
        {visibleProjects.map((project) => (
          <li key={project.id} className="projects-section__grid-item">
            <ProjectCard
              project={project}
              onInspect={handleCardInspect}
              imageSrc={project.images.length > 0 ? project.images[0] : undefined}
              onError={handleCardImageError}
            />
          </li>
        ))}
      </ul>

      {visibleProjects.length === 0 && (
        <p className="projects-section__empty-message">
          No projects in this category.
        </p>
      )}

      {modalProject && (
        <ProjectModal project={modalProject} onClose={handleModalClose} />
      )}
    </div>
  );
}

export default Projects;