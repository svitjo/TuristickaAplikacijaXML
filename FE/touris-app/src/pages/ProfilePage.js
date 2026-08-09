import { useEffect, useState } from 'react';
import api from '../api';

export default function ProfilePage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', biography: '', motto: '', profileImage: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/api/auth/profile').then(({ data }) => {
      setForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        biography: data.biography || '',
        motto: data.motto || '',
        profileImage: data.profileImage || '',
      });
    });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const { data } = await api.put('/api/auth/profile', form);
    setForm({
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      biography: data.biography || '',
      motto: data.motto || '',
      profileImage: data.profileImage || '',
    });
    setMessage('Profil sacuvan.');
  };

  return (
    <section className="panel">
      <h1>Moj profil</h1>
      <form onSubmit={save} className="form">
        <input placeholder="Ime" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        <input placeholder="Prezime" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        <textarea placeholder="Biografija" value={form.biography} onChange={(e) => setForm({ ...form, biography: e.target.value })} />
        <input placeholder="Moto" value={form.motto} onChange={(e) => setForm({ ...form, motto: e.target.value })} />
        <input placeholder="URL profilne slike" value={form.profileImage} onChange={(e) => setForm({ ...form, profileImage: e.target.value })} />
        <button type="submit">Sacuvaj</button>
      </form>
      {message && <p className="ok">{message}</p>}
    </section>
  );
}
