import { Navigate, NavLink, Route, Routes, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { ToastProvider } from './ToastContext';
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
        {isAuthenticated && (
          <nav className="nav-pills" aria-label="Glavna navigacija">
            <NavLink to="/profile">Profil</NavLink>
            <NavLink to="/blogs" className={({ isActive }) => `nav-blogs${isActive ? ' active' : ''}`}>Blogovi</NavLink>
            <NavLink to="/tours">Ture</NavLink>
            {user?.userRole === 2 && <NavLink to="/cart">Korpa</NavLink>}
            {user?.userRole === 2 && <NavLink to="/simulator">Simulator</NavLink>}
            {user?.userRole === 2 && <NavLink to="/execution">Izvodjenje</NavLink>}
          </nav>
        )}
        <div className="userbox">
          {isAuthenticated ? (
            <>
              <span className="user-chip">{user.userName} · {roleName}</span>
              <button type="button" className="btn-logout" onClick={logout}>Odjavi se</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-text-link">Prijava</Link>
              <Link to="/register" className="btn-primary btn-compact">Registracija</Link>
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
      <div className="hero-copy">
        <p className="eyebrow light">Turisticka platforma</p>
        <h1 className="brand-mark">Touris</h1>
        <p>
          Zdravo, {user?.userName}. Planiraj ture, zaprati vodice, kupi avanture i prati putanju
          kroz simulator — sve na jednom mestu.
        </p>
        <div className="hero-actions">
          <Link to="/tours" className="btn-primary btn-hero">
            {isGuide ? 'Kreiraj turu' : 'Pogledaj ture'}
          </Link>
          <Link to="/blogs" className="btn-hero-secondary">
            Otvori blogove
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </AuthProvider>
  );
}
