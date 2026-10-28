import { useState, useMemo } from 'react';
import { useLanguage } from '../../Context/LanguageContext';
import { competencesData } from '../../Data/competencesData';
import './Skills.scss';

/*
 * Skills — Milestone 5 (Harmonized Vertical Layout & Fixed-Rhythm Badges)
 * --------------------------------------------------------------------------
 * Displays technical competencies inside an editorial interactive container.
 * Features consistent vertical rhythm matching the Projects section, balanced
 * spacing across viewports, and uniform font sizing and row heights across all skills.
 *
 * Session rules honored:
 *   - Strict Array.isArray() defensive checks on all data structures.
 *   - Keyboard-accessible ARIA tab navigation (ArrowLeft / ArrowRight).
 *   - Resilient bilingual fallback chain ([language] -> fr -> en).
 *   - Monogram initials fallback for resilient visual geometry.
 *   - Zero inline layout CSS; standard function declarations with
 *     export default at the very bottom.
 */

/*
 * Derives a short initials monogram from an arbitrary string. Used as a
 * text fallback for skill badges when no icon asset is available.
 * Returns a non-empty 1–3 character uppercase string.
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
 *   - name: non-empty string (falls back to "Skill")
 *   - level: non-empty string (badge hidden when empty)
 *   - monogram: short initials derived from the name
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
 *   - category: non-empty string
 *   - description: non-empty string
 *   - skills: array of sanitized skill objects
 */
function sanitizeCategory(rawCategory, index, language) {
  if (typeof rawCategory !== 'object' || rawCategory === null) {
    return null;
  }
  const category = (typeof rawCategory.category === 'object' && rawCategory.category !== null)
    ? (rawCategory.category[language] || rawCategory.category.fr || rawCategory.category.en)
    : rawCategory.category;
  const safeCategory = (typeof category === 'string' && category.length > 0)
    ? category
    : `Category ${index + 1}`;
  const description = (typeof rawCategory.description === 'object' && rawCategory.description !== null)
    ? (rawCategory.description[language] || rawCategory.description.fr || rawCategory.description.en)
    : rawCategory.description;
  const safeDescription = (typeof description === 'string' && description.length > 0)
    ? description
    : '';
  const skills = Array.isArray(rawCategory.skills)
    ? rawCategory.skills
      .map((rawSkill, skillIndex) => sanitizeSkill(rawSkill, skillIndex))
      .filter((skill) => skill !== null)
    : [];
  return {
    category: safeCategory,
    description: safeDescription,
    skills,
  };
}

function Skills() {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);

  const isFr = language === 'fr';
  const navDictionary = t('nav') || {};
  const heading = (typeof navDictionary.skills === 'string' && navDictionary.skills.length > 0)
    ? navDictionary.skills
    : (isFr ? 'Compétences' : 'Skills');
  const skillUnit = isFr ? 'compétence' : 'skill';
  const skillUnits = isFr ? 'compétences' : 'skills';

  const categories = useMemo(() => {
    if (!Array.isArray(competencesData)) {
      return [];
    }
    return competencesData
      .map((rawCategory, index) => sanitizeCategory(rawCategory, index, language))
      .filter((category) => category !== null);
  }, [language]);

  const hasContent = Array.isArray(categories) && categories.length > 0;

  // Safe fallback if active tab index is out of bounds
  const currentCategory = hasContent && categories[activeTab]
    ? categories[activeTab]
    : (hasContent ? categories[0] : null);

  const handleTabKeyDown = (event, index) => {
    if (!hasContent) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setActiveTab((index + 1) % categories.length);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setActiveTab((index - 1 + categories.length) % categories.length);
    }
  };

  if (!hasContent) {
    return (
      <div className="skills-section skills-section--empty">
        <h2 className="skills-section__heading">{heading}</h2>
        <p className="skills-section__empty-message">
          {isFr ? 'Aucune compétence disponible.' : 'No skills available.'}
        </p>
      </div>
    );
  }

  return (
    <div className="skills-section">
      <div className="skills-section__top">
        <h2 className="skills-section__heading">{heading}</h2>

        {/* Category Tabs */}
        <div
          className="skills-section__tabs"
          role="tablist"
          aria-label={isFr ? 'Catégories de compétences' : 'Competence categories'}
        >
          {categories.map((cat, index) => {
            const isActive = index === activeTab;
            return (
              <button
                key={cat.category}
                type="button"
                role="tab"
                id={`skills-tab-${index}`}
                aria-selected={isActive}
                aria-controls={`skills-panel-${index}`}
                tabIndex={isActive ? 0 : -1}
                className={`skills-section__tab ${
                  isActive ? 'skills-section__tab--active' : ''
                }`}
                onClick={() => setActiveTab(index)}
                onKeyDown={(e) => handleTabKeyDown(e, index)}
              >
                <span className="skills-section__tab-title">{cat.category}</span>
                <span className="skills-section__tab-badge">
                  {cat.skills.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Card Panel */}
      {currentCategory && (
        <div
          role="tabpanel"
          id={`skills-panel-${activeTab}`}
          aria-labelledby={`skills-tab-${activeTab}`}
          className="skills-section__panel"
        >
          <article className="skills-section__card">
            <header className="skills-section__card-header">
              <span
                className="skills-section__card-mono"
                aria-hidden="true"
              >
                {deriveInitials(currentCategory.category, 'SK')}
              </span>
              <div className="skills-section__card-heading-text">
                <h3 className="skills-section__card-title">
                  {currentCategory.category}
                </h3>
                <span className="skills-section__card-count">
                  {currentCategory.skills.length}{' '}
                  {currentCategory.skills.length === 1 ? skillUnit : skillUnits}
                </span>
              </div>
            </header>

            {currentCategory.description.length > 0 && (
              <p className="skills-section__card-description">
                {currentCategory.description}
              </p>
            )}

            {currentCategory.skills.length > 0 ? (
              <ul className="skills-section__skill-list">
                {currentCategory.skills.map((skill) => (
                  <li key={skill.name} className="skills-section__skill">
                    <span
                      className="skills-section__skill-mono"
                      aria-hidden="true"
                    >
                      {skill.monogram}
                    </span>
                    <span className="skills-section__skill-name">
                      {skill.name}
                    </span>
                    {skill.level.length > 0 && (
                      <span className="skills-section__skill-level">
                        {skill.level}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="skills-section__skill-empty">
                {isFr ? 'Aucune compétence listée.' : 'No skills listed.'}
              </p>
            )}
          </article>
        </div>
      )}

      {/* Bottom Counter to Match Projects Visual Stance */}
      <footer className="skills-section__footer" aria-hidden="true">
        <span className="skills-section__footer-indicator">
          {String(activeTab + 1).padStart(2, '0')} / {String(categories.length).padStart(2, '0')}
        </span>
      </footer>
    </div>
  );
}

export default Skills;