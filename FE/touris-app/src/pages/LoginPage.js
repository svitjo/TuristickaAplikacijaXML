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
    <section className="panel">
      <h1>Prijava</h1>
      <form onSubmit={submit} className="form">
        <input placeholder="Korisnicko ime" value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })} required />
        <input type="password" placeholder="Lozinka" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        {error && <p className="error">{error}</p>}
        <button type="submit">Prijavi se</button>
      </form>
      <p>Nemate nalog? <Link to="/register">Registracija</Link></p>
    </section>
  );
}
