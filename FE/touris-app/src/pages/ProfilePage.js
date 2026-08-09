import { useEffect, useState } from 'react';
import api from '../api';
import { useToast } from '../ToastContext';
import Spinner from '../components/Spinner';
import { getErrorMessage } from '../utils/apiErrors';

export default function ProfilePage() {
  const { notifySuccess, notifyError } = useToast();
  const [form, setForm] = useState({
    firstName: '', lastName: '', biography: '', motto: '', profileImage: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/api/auth/profile')
      .then(({ data }) => {
        setForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          biography: data.biography || '',
          motto: data.motto || '',
          profileImage: data.profileImage || '',
        });
      })
      .catch((err) => notifyError(getErrorMessage(err, 'Profil nije ucitan.')))
      .finally(() => setLoading(false));
  }, [notifyError]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/api/auth/profile', form);
      setForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        biography: data.biography || '',
        motto: data.motto || '',
        profileImage: data.profileImage || '',
      });
      notifySuccess('Profil je uspesno sacuvan.');
    } catch (err) {
      notifyError(getErrorMessage(err, 'Cuvanje profila nije uspelo.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="panel">
        <div className="page-loading">
          <Spinner label="Ucitavanje profila..." />
        </div>
      </section>
    );
  }

  return (
    <section className="panel reveal">
      <h1>Moj profil</h1>
      <form onSubmit={save} className="form">
        <label>
          Ime
          <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} disabled={saving} />
        </label>
        <label>
          Prezime
          <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} disabled={saving} />
        </label>
        <label>
          Biografija
          <textarea value={form.biography} onChange={(e) => setForm({ ...form, biography: e.target.value })} disabled={saving} />
        </label>
        <label>
          Moto
          <input value={form.motto} onChange={(e) => setForm({ ...form, motto: e.target.value })} disabled={saving} />
        </label>
        <label>
          URL profilne slike
          <input value={form.profileImage} onChange={(e) => setForm({ ...form, profileImage: e.target.value })} disabled={saving} />
        </label>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? <Spinner label="Cuvanje..." /> : 'Sacuvaj'}
        </button>
      </form>
    </section>
  );
}
