import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ userName: '', email: '', password: '', userRole: 2 });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/api/auth/register', {
        ...form,
        userRole: Number(form.userRole),
      });
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Neuspesna registracija');
    }
  };

  return (
    <div className="auth-wrap">
      <section className="panel auth-panel">
        <p className="eyebrow">Novi nalog</p>
        <h1>Registracija</h1>
        <p className="lede">Izaberite ulogu Vodic ili Turista i krenite.</p>
        <form onSubmit={submit} className="form">
          <label>
            Korisnicko ime
            <input value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })} required />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label>
            Lozinka
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </label>
          <label>
            Uloga
            <select value={form.userRole} onChange={(e) => setForm({ ...form, userRole: e.target.value })}>
              <option value={2}>Turista</option>
              <option value={1}>Vodic</option>
            </select>
          </label>
          {error && <p className="error banner">{error}</p>}
          <button type="submit" className="btn-primary">Registruj se</button>
        </form>
        <p className="muted">Vec imate nalog? <Link to="/login">Prijava</Link></p>
      </section>
    </div>
  );
}
