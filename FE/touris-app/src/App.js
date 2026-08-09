import { Navigate, Route, Routes, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import BlogsPage from './pages/BlogsPage';
import ToursPage from './pages/ToursPage';
import CartPage from './pages/CartPage';
import SimulatorPage from './pages/SimulatorPage';
import ExecutionPage from './pages/ExecutionPage';
import './App.css';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function Shell() {
  const { user, logout, isAuthenticated } = useAuth();
  const roleName = { 0: 'Admin', 1: 'Vodic', 2: 'Turista' }[user?.userRole] || '';

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">Touris</Link>
        <nav>
          {isAuthenticated && (
            <>
              <Link to="/profile">Profil</Link>
              <Link to="/blogs">Blogovi</Link>
              <Link to="/tours">Ture</Link>
              {user?.userRole === 2 && <Link to="/cart">Korpa</Link>}
              {user?.userRole === 2 && <Link to="/simulator">Simulator</Link>}
              {user?.userRole === 2 && <Link to="/execution">Izvodjenje</Link>}
            </>
          )}
        </nav>
        <div className="userbox">
          {isAuthenticated ? (
            <>
              <span>{user.userName} · {roleName}</span>
              <button type="button" onClick={logout}>Odjavi se</button>
            </>
          ) : (
            <>
              <Link to="/login">Prijava</Link>
              <Link to="/register">Registracija</Link>
            </>
          )}
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/blogs" element={<PrivateRoute><BlogsPage /></PrivateRoute>} />
          <Route path="/tours" element={<PrivateRoute><ToursPage /></PrivateRoute>} />
          <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
          <Route path="/simulator" element={<PrivateRoute><SimulatorPage /></PrivateRoute>} />
          <Route path="/execution" element={<PrivateRoute><ExecutionPage /></PrivateRoute>} />
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  );
}

function Home() {
  const { user } = useAuth();
  const isGuide = user?.userRole === 1 || user?.userRole === 0;

  return (
    <section className="hero-home">
      <p className="eyebrow" style={{ color: 'rgba(247,250,248,0.8)' }}>Turisticka platforma</p>
      <h1 className="brand-mark">Touris</h1>
      <p>
        Zdravo, {user?.userName}. Planiraj ture, zaprati vodice, kupi avanture i prati putanju
        kroz simulator — sve na jednom mestu.
      </p>
      <div className="hero-actions">
        <Link to="/tours" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
          {isGuide ? 'Kreiraj turu' : 'Pogledaj ture'}
        </Link>
        <Link to="/blogs" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-block' }}>
          Otvori blogove
        </Link>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
