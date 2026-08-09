import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import Spinner from '../components/Spinner';
import { getErrorMessage, validateRegisterForm } from '../utils/apiErrors';

export default function RegisterPage() {
  const { login } = useAuth();
  const { notifySuccess, notifyError } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ userName: '', email: '', password: '', userRole: 2 });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const localErrors = validateRegisterForm(form);
    setFieldErrors(localErrors);
    if (Object.keys(localErrors).length) {
      notifyError('Ispravite oznacena polja pa pokusajte ponovo.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/register', {
        userName: form.userName.trim(),
        email: form.email.trim(),
        password: form.password,
        userRole: Number(form.userRole),
      });
      login(data);
      const roleLabel = Number(form.userRole) === 1 ? 'Vodic' : 'Turista';
      notifySuccess(`Nalog je kreiran. Ulogovani ste kao ${roleLabel}.`);
      navigate('/');
    } catch (err) {
      const status = err?.response?.status;
      let msg = getErrorMessage(err, 'Registracija nije uspela.');
      if (status === 409) {
        msg = err?.response?.data?.message || 'Korisnicko ime ili email su zauzeti.';
      }
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <section className="panel auth-panel">
        <p className="eyebrow">Novi nalog</p>
        <h1>Registracija</h1>
        <p className="lede">Izaberite ulogu Vodic ili Turista i krenite.</p>
        <form onSubmit={submit} className="form" noValidate>
          <label>
            Korisnicko ime
            <input
              value={form.userName}
              onChange={(e) => setForm({ ...form, userName: e.target.value })}
              disabled={loading}
              autoComplete="username"
            />
            {fieldErrors.userName && <span className="field-error">{fieldErrors.userName}</span>}
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={loading}
              autoComplete="email"
            />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </label>
          <label>
            Lozinka
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={loading}
              autoComplete="new-password"
            />
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            <span className="field-hint">Minimum 6 karaktera.</span>
          </label>
          <label>
            Uloga
            <select
              value={form.userRole}
              onChange={(e) => setForm({ ...form, userRole: e.target.value })}
              disabled={loading}
            >
              <option value={2}>Turista</option>
              <option value={1}>Vodic</option>
            </select>
          </label>
          {error && <p className="error banner">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Spinner label="Kreiranje naloga..." /> : 'Registruj se'}
          </button>
        </form>
        <p className="muted">Vec imate nalog? <Link to="/login">Prijava</Link></p>
      </section>
    </div>
  );
}
