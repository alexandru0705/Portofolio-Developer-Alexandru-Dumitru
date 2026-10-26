import { useLanguage } from '../../Context/LanguageContext';
import './ProjectCard.scss';

/*
 * ProjectCard — Milestone 3 (Milestone 7 fix: bounded thumbnail).
 * --------------------------------------------------------------------------
 * A single card in the responsive Projects grid. Clicking the card (or
 * the "Détails" button) opens the full `ProjectModal` via
 * `onSelectProject`.
 *
 * Card contents:
 *   - project thumbnail image — bounded by a dedicated `__media` container
 *     (`aspect-ratio: 16/10`, `height: 200px` fallback, `overflow: hidden`)
 *     so raw screenshots never render at natural resolution (Milestone 7).
 *     The `<img>` is strictly `width: 100%; height: 100%; object-fit:
 *     cover; display: block;` with a smooth hover zoom.
 *   - category badge
 *   - project title
 *   - short description (2-line clamp)
 *   - tag pills
 *   - action triggers: "Détails / Inspect" button + "GitHub" external link
 *
 * Bilingual display:
 *   `project.description` is a `{ fr, en }` object (see
 *   `projectsData.js`). The active locale is consumed through
 *   `useLanguage()` and the description is resolved with a defensive
 *   fallback chain (`[language]` → `fr` → `en` → `''`) so a missing
 *   locale entry degrades gracefully instead of rendering `undefined`.
 *
 * Asset handling (session rule 3):
 *   The image `src` is resolved through `import.meta.env.BASE_URL` upstream
 *   (see `resolveProjectImage` in `Projects.jsx`). A native `onError`
 *   handler applies a fallback modifier class so a missing asset degrades
 *   to a styled gradient placeholder instead of a broken icon.
 *
 * Click isolation (session rule 2):
 *   The external GitHub link and the "Détails" button call
 *   `event.stopPropagation()` so they don't also trigger the card / modal.
 *
 * Props:
 *   project           : sanitized project object (see `sanitizeProject` in
 *                       `Projects.jsx`)
 *   onSelectProject   : (project: object) => void — opens the modal
 *   imageSrc          : resolved preview image URL (string | undefined)
 *   onError           : (event) => void — native img error handler
 *   detailsLabel      : (optional) string — localized "details" button copy
 */
function ProjectCard({
  project,
  onSelectProject,
  imageSrc,
  onError,
  detailsLabel,
}) {
  const { language } = useLanguage();

  if (typeof project !== 'object' || project === null) {
    return null;
  }

  const title = (typeof project.title === 'string' && project.title.length > 0)
    ? project.title
    : 'Untitled Project';

  const category = (typeof project.category === 'string' && project.category.length > 0)
    ? project.category
    : 'Project';

  const description = (typeof project.description === 'object' && project.description !== null)
    ? (project.description[language] || project.description.fr || project.description.en || '')
    : (typeof project.description === 'string' ? project.description : '');

  const tags = Array.isArray(project.tags)
    ? project.tags.filter((tag) => typeof tag === 'string' && tag.length > 0)
    : [];

  const githubUrl = (typeof project.githubUrl === 'string' && project.githubUrl.length > 0)
    ? project.githubUrl
    : undefined;

  const hasImage = typeof imageSrc === 'string' && imageSrc.length > 0;

  const inspectLabel = (typeof detailsLabel === 'string' && detailsLabel.length > 0)
    ? detailsLabel
    : 'Details';

  function handleInspect() {
    if (typeof onSelectProject === 'function') {
      onSelectProject(project);
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleInspect();
    }
  }

  /*
   * Stop click propagation on the external GitHub link so opening the
   * repository in a new tab does NOT also trigger the card / modal
   * (session rule 2).
   */
  function handleGithubClick(event) {
    if (event && typeof event.stopPropagation === 'function') {
      event.stopPropagation();
    }
  }

  /*
   * The 16 / 10 aspect ratio is enforced by CSS (`__media` container).
   * The `width`/`height` attributes below are set to 320 / 200 (matching
   * the card grid's `minmax(320px, 1fr)` minimum and the media container's
   * 200px height fallback) so the browser can reserve layout space before
   * the image loads — this prevents CLS (Cumulative Layout Shift) when
   * raw screenshots arrive at natural resolution.
   */
  const THUMBNAIL_WIDTH = 320;
  const THUMBNAIL_HEIGHT = 200;

  return (
    <article
      className="project-card"
      onClick={handleInspect}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Open ${title} details`}
    >
      <div className="project-card__media">
        {hasImage ? (
          <img
            src={imageSrc}
            alt={`${title} preview`}
            className="project-card__image"
            width={THUMBNAIL_WIDTH}
            height={THUMBNAIL_HEIGHT}
            onError={onError}
            loading="lazy"
          />
        ) : (
          <div className="project-card__placeholder" aria-hidden="true" />
        )}
      </div>

      <div className="project-card__body">
        <span className="project-card__category">{category}</span>
        <h3 className="project-card__title">{title}</h3>

        {description.length > 0 && (
          <p className="project-card__description">{description}</p>
        )}

        {tags.length > 0 && (
          <ul className="project-card__tags">
            {tags.slice(0, 4).map((tag) => (
              <li key={tag} className="project-card__tag">{tag}</li>
            ))}
          </ul>
        )}

        <div className="project-card__actions">
          <button
            type="button"
            className="project-card__btn project-card__btn--inspect"
            onClick={(event) => {
              if (event && typeof event.stopPropagation === 'function') {
                event.stopPropagation();
              }
              handleInspect();
            }}
            aria-label={`Inspect ${title} details`}
          >
            {inspectLabel}
          </button>

          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card__btn project-card__btn--link"
              onClick={handleGithubClick}
              aria-label={`Open ${title} GitHub repository`}
            >
              GitHub
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProjectCard;
