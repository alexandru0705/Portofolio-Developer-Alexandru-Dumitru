import { useMemo } from 'react';
import { competencesData } from '../../Data/competencesData';
import './Skills.scss';

/*
 * Skills — Milestone 5
 * --------------------------------------------------------------------------
 * Categorized, editorial skills/competences grid. Data is ingested from
 * `competencesData.js` (Front-End, Back-End & Databases, Tools/Workflow)
 * and defensively normalized so missing or mis-shaped entries degrade to
 * safe text fallbacks instead of breaking the layout.
 *
 * Session rules honored:
 *   - `Array.isArray()` + explicit shape checks on every ingested item.
 *   - Text/initials fallbacks for missing skill names or levels.
 *   - Zero inline layout CSS — all layout in `Skills.scss` (BEM) using
 *     tokens from `Styles/variables.scss`.
 *   - Standard function declaration first; `export default Skills;`
 *     strictly at the very bottom.
 */

/*
 * Derives a short initials monogram from an arbitrary string. Used as a
 * text fallback for skill badges when no icon/monogram is available
 * (session rule 2: guard against broken icon/image references).
 * Returns a non-empty 1–3 character string.
 */
function deriveInitials(value, fallback) {
  if (typeof value !== 'string' || value.length === 0) {
    return typeof fallback === 'string' && fallback.length > 0 ? fallback : '•';
  }
  const words = value
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 0);
  if (words.length === 0) {
    return value.slice(0, 2).toUpperCase();
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}

/*
 * Normalizes a single skill entry:
 *   - name : non-empty string (falls back to "Skill")
 *   - level: non-empty string (falls back to "" — badge is hidden when empty)
 *   - monogram: short initials derived from the name (text fallback, rule 2)
 */
function sanitizeSkill(rawSkill, index) {
  if (typeof rawSkill !== 'object' || rawSkill === null) {
    return null;
  }
  const name = (typeof rawSkill.name === 'string' && rawSkill.name.length > 0)
    ? rawSkill.name
    : `Skill ${index + 1}`;
  const level = (typeof rawSkill.level === 'string' && rawSkill.level.length > 0)
    ? rawSkill.level
    : '';
  return {
    name,
    level,
    monogram: deriveInitials(name, 'SK'),
  };
}

/*
 * Normalizes a single competence category:
 *   - category   : non-empty string (falls back to "Category")
 *   - description: non-empty string (may be "")
 *   - skills     : array of sanitized skill objects (guaranteed array)
 */
function sanitizeCategory(rawCategory, index) {
  if (typeof rawCategory !== 'object' || rawCategory === null) {
    return null;
  }
  const category = (typeof rawCategory.category === 'string' && rawCategory.category.length > 0)
    ? rawCategory.category
    : `Category ${index + 1}`;
  const description = (typeof rawCategory.description === 'string' && rawCategory.description.length > 0)
    ? rawCategory.description
    : '';
  const skills = Array.isArray(rawCategory.skills)
    ? rawCategory.skills
      .map((rawSkill, skillIndex) => sanitizeSkill(rawSkill, skillIndex))
      .filter((skill) => skill !== null)
    : [];
  return {
    category,
    description,
    skills,
  };
}

function Skills() {
  const categories = useMemo(() => {
    if (!Array.isArray(competencesData)) {
      return [];
    }
    return competencesData
      .map((rawCategory, index) => sanitizeCategory(rawCategory, index))
      .filter((category) => category !== null);
  }, []);

  const hasContent = Array.isArray(categories) && categories.length > 0;

  if (!hasContent) {
    return (
      <div className="skills-section skills-section--empty">
        <h2 className="skills-section__heading">Skills</h2>
        <p className="skills-section__empty-message">No skills available.</p>
      </div>
    );
  }

  return (
    <div className="skills-section">
      <h2 className="skills-section__heading">Skills</h2>

      <ul className="skills-section__grid">
        {categories.map((entry) => (
          <li key={entry.category} className="skills-section__item">
            <article className="skills-section__card">
              <header className="skills-section__card-header">
                <span
                  className="skills-section__card-mono"
                  aria-hidden="true"
                >
                  {deriveInitials(entry.category, 'SK')}
                </span>
                <div className="skills-section__card-heading-text">
                  <h3 className="skills-section__card-title">{entry.category}</h3>
                  <span className="skills-section__card-count">
                    {entry.skills.length} {entry.skills.length === 1 ? 'skill' : 'skills'}
                  </span>
                </div>
              </header>

              {entry.description.length > 0 && (
                <p className="skills-section__card-description">{entry.description}</p>
              )}

              {entry.skills.length > 0 ? (
                <ul className="skills-section__skill-list">
                  {entry.skills.map((skill) => (
                    <li key={skill.name} className="skills-section__skill">
                      <span
                        className="skills-section__skill-mono"
                        aria-hidden="true"
                      >
                        {skill.monogram}
                      </span>
                      <span className="skills-section__skill-name">{skill.name}</span>
                      {skill.level.length > 0 && (
                        <span className="skills-section__skill-level">{skill.level}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="skills-section__skill-empty">No skills listed.</p>
              )}
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Skills;