import { LanguageProvider } from './Context/LanguageContext';
import Header from './Components/Header/Header';
import Navigation from './Components/Navigation/Navigation';
import Home from './Sections/Home/Home';
import Projects from './Sections/Projects/Projects';
import Skills from './Sections/Skills/Skills';
import Contact from './Sections/Contact/Contact';
import Footer from './Components/Footer/Footer';
import './App.scss';

/*
 * Milestone 2 — Global page layout shell (Milestone 9: bilingual).
 *
 * The ENTIRE application hierarchy is wrapped in `<LanguageProvider>`
 * (see `src/Context/LanguageContext.jsx`) so every component can consume
 * the FR/EN locale via the `useLanguage()` hook with zero props drilling.
 *
 * The hero presentation section (`#banner`) spans the full viewport height
 * and sits above a two-pane split:
 *   - Left pane: the dedicated, accessible <Navigation /> component
 *     (sticky 280px sidebar on desktop, compact sticky top header + drawer
 *     on mobile).
 *   - Right pane: a fluid scrollable stream holding the Skills, Projects,
 *     and Contact sections plus the Footer.
 *
 * All layout lives in `App.scss` / `Navigation.scss` (BEM). This component
 * carries no inline styling.
 */
function App() {
  return (
    <LanguageProvider>
      <div className="app">
        <Header />

        <section id="banner" className="app__banner">
          <Home />
        </section>

        <div className="app__split">
          <Navigation />

          <main className="app__content">
            <section id="skills" className="app__section">
              <Skills />
            </section>
            <section id="projects" className="app__section">
              <Projects />
            </section>
            <section id="contact" className="app__section">
              <Contact />
            </section>
            <Footer />
          </main>
        </div>
      </div>
    </LanguageProvider>
  );
}

export default App;