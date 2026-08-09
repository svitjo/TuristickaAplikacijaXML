import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import Spinner from '../components/Spinner';
import { getErrorMessage, validateLoginForm } from '../utils/apiErrors';

export default function LoginPage() {
  const { login } = useAuth();
  const { notifySuccess, notifyError } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ userName: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const localErrors = validateLoginForm(form);
    setFieldErrors(localErrors);
    if (Object.keys(localErrors).length) {
      notifyError('Popunite obavezna polja za prijavu.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', {
        userName: form.userName.trim(),
        password: form.password,
      });
      login(data);
      notifySuccess(`Uspesna prijava. Dobrodosli, ${data.userName}!`);
      navigate('/');
    } catch (err) {
      const msg = getErrorMessage(err, 'Prijava nije uspela.');
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <section className="panel auth-panel">
        <p className="eyebrow">Dobrodosli nazad</p>
        <h1>Prijava</h1>
        <p className="lede">Udjite u Touris nalog i nastavite gde ste stali.</p>
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
            Lozinka
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={loading}
              autoComplete="current-password"
            />
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </label>
          {error && <p className="error banner">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Spinner label="Prijava u toku..." /> : 'Prijavi se'}
          </button>
        </form>
        <p className="muted">Nemate nalog? <Link to="/register">Registracija</Link></p>
      </section>
    </div>
  );
}
