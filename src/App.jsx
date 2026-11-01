import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';
import HomePage from './pages/HomePage.jsx';

export default function App() {
  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <HomePage />
      </main>
      <Footer />
    </div>
  );
}
