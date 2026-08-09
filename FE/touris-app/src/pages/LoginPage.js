import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ userName: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/api/auth/login', form);
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Neuspesna prijava');
    }
  };

  return (
    <div className="auth-wrap">
      <section className="panel auth-panel">
        <p className="eyebrow">Dobrodosli nazad</p>
        <h1>Prijava</h1>
        <p className="lede">Udjite u Touris nalog i nastavite gde ste stali.</p>
        <form onSubmit={submit} className="form">
          <label>
            Korisnicko ime
            <input value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })} required />
          </label>
          <label>
            Lozinka
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </label>
          {error && <p className="error banner">{error}</p>}
          <button type="submit" className="btn-primary">Prijavi se</button>
        </form>
        <p className="muted">Nemate nalog? <Link to="/register">Registracija</Link></p>
      </section>
    </div>
  );
}
