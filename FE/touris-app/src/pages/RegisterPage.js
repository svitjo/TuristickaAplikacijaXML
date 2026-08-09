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
    <section className="panel">
      <h1>Registracija</h1>
      <form onSubmit={submit} className="form">
        <input placeholder="Korisnicko ime" value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })} required />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input type="password" placeholder="Lozinka" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <select value={form.userRole} onChange={(e) => setForm({ ...form, userRole: e.target.value })}>
          <option value={2}>Turista</option>
          <option value={1}>Vodic</option>
        </select>
        {error && <p className="error">{error}</p>}
        <button type="submit">Registruj se</button>
      </form>
      <p>Vec imate nalog? <Link to="/login">Prijava</Link></p>
    </section>
  );
}
