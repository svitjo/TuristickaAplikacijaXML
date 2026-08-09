import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import MapPicker from '../components/MapPicker';

export default function ToursPage() {
  const { user } = useAuth();
  const isGuide = user?.userRole === 1 || user?.userRole === 0;
  const [mine, setMine] = useState([]);
  const [published, setPublished] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', difficulty: 0, tags: '' });
  const [selectedTourId, setSelectedTourId] = useState(null);
  const [kp, setKp] = useState({ name: '', description: '', latitude: 44.7866, longitude: 20.4489, image: '' });
  const [message, setMessage] = useState('');

  const load = async () => {
    if (isGuide) {
      const { data } = await api.get('/api/tours/mine');
      setMine(data);
    }
    const pub = await api.get('/api/tours/published');
    setPublished(pub.data);
  };

  useEffect(() => { load().catch(console.error); }, [isGuide]);

  const createTour = async (e) => {
    e.preventDefault();
    await api.post('/api/tours', {
      name: form.name,
      description: form.description,
      difficulty: Number(form.difficulty),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setForm({ name: '', description: '', difficulty: 0, tags: '' });
    await load();
  };

  const addKeyPoint = async (e) => {
    e.preventDefault();
    if (!selectedTourId) return;
    await api.post(`/api/tours/${selectedTourId}/keypoints`, kp);
    setMessage('Kljucna tacka dodata.');
    await load();
  };

  const publish = async (id) => {
    await api.post(`/api/tours/${id}/publish`);
    setMessage('Tura objavljena.');
    await load();
  };

  const addToCart = async (tour) => {
    await api.post('/api/purchase/cart/items', {
      tourId: tour.id,
      tourName: tour.name,
      price: tour.price,
    });
    setMessage(`Tura "${tour.name}" dodata u korpu.`);
  };

  return (
    <section className="panel">
      <h1>Ture</h1>
      {message && <p className="ok">{message}</p>}

      {isGuide && (
        <>
          <form onSubmit={createTour} className="form">
            <h2>Kreiraj turu (draft, cena 0)</h2>
            <input placeholder="Naziv" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <textarea placeholder="Opis" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              <option value={0}>Easy</option>
              <option value={1}>Medium</option>
              <option value={2}>Hard</option>
            </select>
            <input placeholder="Tagovi (zarez)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} required />
            <button type="submit">Kreiraj</button>
          </form>

          <h2>Moje ture</h2>
          <ul className="list">
            {mine.map((t) => (
              <li key={t.id}>
                <strong>{t.name}</strong> — {['Draft', 'Published', 'Archived'][t.status]} — {t.keyPoints?.length || 0} KP — {t.lengthKm?.toFixed?.(2) || 0} km
                <div className="row">
                  <button type="button" onClick={() => setSelectedTourId(t.id)}>Dodaj KP</button>
                  {t.status === 0 && <button type="button" onClick={() => publish(t.id)}>Objavi</button>}
                </div>
              </li>
            ))}
          </ul>

          {selectedTourId && (
            <form onSubmit={addKeyPoint} className="form">
              <h2>Kljucna tacka za turu #{selectedTourId}</h2>
              <input placeholder="Naziv" value={kp.name} onChange={(e) => setKp({ ...kp, name: e.target.value })} required />
              <textarea placeholder="Opis" value={kp.description} onChange={(e) => setKp({ ...kp, description: e.target.value })} />
              <input placeholder="Slika URL" value={kp.image} onChange={(e) => setKp({ ...kp, image: e.target.value })} />
              <p>Kliknite na mapu da izaberete lokaciju ({kp.latitude.toFixed(5)}, {kp.longitude.toFixed(5)})</p>
              <MapPicker
                latitude={kp.latitude}
                longitude={kp.longitude}
                onPick={(lat, lng) => setKp({ ...kp, latitude: lat, longitude: lng })}
              />
              <button type="submit">Dodaj kljucnu tacku</button>
            </form>
          )}
        </>
      )}

      <h2>Objavljene ture</h2>
      <ul className="list">
        {published.map((t) => (
          <li key={t.id}>
            <strong>{t.name}</strong> — {t.price} RSD — {t.lengthKm?.toFixed?.(2) || 0} km
            <p>{t.description}</p>
            {t.firstKeyPoint && <p>Pocetna tacka: {t.firstKeyPoint.name}</p>}
            {user?.userRole === 2 && (
              <button type="button" onClick={() => addToCart(t)}>Dodaj u korpu</button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
