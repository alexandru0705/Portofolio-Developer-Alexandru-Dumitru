import Header from './Components/Header/Header';
import Home from './Sections/Home/Home';
import Projects from './Sections/Projects/Projects';
import Skills from './Sections/Skills/Skills';
import Contact from './Sections/Contact/Contact';
import Footer from './Components/Footer/Footer';
import './App.scss';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <section id="banner">
          <Home />
        </section>
        <section id="projects">
          <Projects />
        </section>
        <section id="skills">
          <Skills />
        </section>
        <section id="contact">
          <Contact />
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default App;