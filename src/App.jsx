import Banner from './Components/Banner/Banner';
import './App.css';

export default function App() {
  return (
    <main className="app-container">
      <header className="app-header">
        <h1>Alexandru Dumitru</h1>
        <p>Web Developer & Software Engineering Student</p>
      </header>
      <section className="content-section">
        <Banner />
      </section>
    </main>
  );
}