import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import MapPicker from '../components/MapPicker';

const STATUS = ['Draft', 'Objavljena', 'Arhivirana'];
const DIFF = ['Laka', 'Srednja', 'Teska'];

export default function ToursPage() {
  const { user } = useAuth();
  const isGuide = user?.userRole === 1 || user?.userRole === 0;
  const [mine, setMine] = useState([]);
  const [published, setPublished] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', difficulty: 0, tags: '' });
  const [selectedTourId, setSelectedTourId] = useState(null);
  const [kp, setKp] = useState({
    name: '',
    description: '',
    latitude: 44.7866,
    longitude: 20.4489,
    image: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [savingKp, setSavingKp] = useState(false);

  const selectedTour = useMemo(
    () => mine.find((t) => t.id === selectedTourId) || null,
    [mine, selectedTourId],
  );

  const existingPoints = selectedTour?.keyPoints || [];
  const isStartPoint = existingPoints.length === 0;

  const load = async () => {
    if (isGuide) {
      const { data } = await api.get('/api/tours/mine');
      setMine(Array.isArray(data) ? data : []);
    }
    const pub = await api.get('/api/tours/published');
    setPublished(Array.isArray(pub.data) ? pub.data : []);
  };

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Neuspesno ucitavanje tura'));
  }, [isGuide]);

  const createTour = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/api/tours', {
        name: form.name,
        description: form.description,
        difficulty: Number(form.difficulty),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      setForm({ name: '', description: '', difficulty: 0, tags: '' });
      setSelectedTourId(data.id);
      setKp({
        name: 'Pocetna tacka',
        description: '',
        latitude: 44.7866,
        longitude: 20.4489,
        image: '',
      });
      setMessage(`Tura "${data.name}" kreirana. Sada dodaj pocetnu tacku na mapi.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Kreiranje ture nije uspelo (uloguj se kao Vodic).');
    }
  };

  const openKeyPointEditor = (tour) => {
    setError('');
    setMessage('');
    setSelectedTourId(tour.id);
    const count = tour.keyPoints?.length || 0;
    setKp({
      name: count === 0 ? 'Pocetna tacka' : `Tacka ${count + 1}`,
      description: '',
      latitude: tour.keyPoints?.[count - 1]?.latitude ?? 44.7866,
      longitude: tour.keyPoints?.[count - 1]?.longitude ?? 20.4489,
      image: '',
    });
  };

  const addKeyPoint = async (e) => {
    e.preventDefault();
    if (!selectedTourId) {
      setError('Prvo izaberi turu.');
      return;
    }
    if (!kp.name.trim()) {
      setError('Unesi naziv tacke.');
      return;
    }
    if (Number.isNaN(Number(kp.latitude)) || Number.isNaN(Number(kp.longitude))) {
      setError('Klikni na mapu ili unesi validne koordinate.');
      return;
    }

    setSavingKp(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        name: kp.name.trim(),
        description: kp.description?.trim() || '',
        latitude: Number(kp.latitude),
        longitude: Number(kp.longitude),
        image: kp.image?.trim() || '',
      };
      const { data } = await api.post(`/api/tours/${selectedTourId}/keypoints`, payload);
      const count = data.keyPoints?.length || 0;
      setMessage(
        count === 1
          ? 'Pocetna tacka sacuvana. Dodaj jos bar jednu kljucnu tacku da mozes da objavis turu.'
          : `Kljucna tacka sacuvana. Ukupno tacki: ${count}.`,
      );
      setKp((prev) => ({
        ...prev,
        name: `Tacka ${count + 1}`,
        description: '',
        image: '',
      }));
      await load();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 403
          ? 'Nemate dozvolu za izmenu ove ture.'
          : 'Dodavanje tacke nije uspelo.');
      setError(msg);
    } finally {
      setSavingKp(false);
    }
  };

  const publish = async (id) => {
    setError('');
    setMessage('');
    try {
      await api.post(`/api/tours/${id}/publish`);
      setMessage('Tura je objavljena.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Objava nije uspela (potrebne su bar 2 tacke).');
    }
  };

  const addToCart = async (tour) => {
    setError('');
    try {
      await api.post('/api/purchase/cart/items', {
        tourId: tour.id,
        tourName: tour.name,
        price: tour.price,
      });
      setMessage(`Tura "${tour.name}" dodata u korpu.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Dodavanje u korpu nije uspelo.');
    }
  };

  return (
    <section className="panel reveal">
      <div className="section-head">
        <p className="eyebrow">Istrazi i kreiraj</p>
        <h1>Ture</h1>
        <p className="lede">Kreiraj draft, dodaj pocetnu i kljucne tacke na mapi, pa objavi turu.</p>
      </div>

      {message && <p className="ok banner">{message}</p>}
      {error && <p className="error banner">{error}</p>}

      {isGuide && (
        <>
          <form onSubmit={createTour} className="form surface">
            <h2>Nova tura</h2>
            <label>
              Naziv
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Opis
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </label>
            <div className="grid-2">
              <label>
                Tezina
                <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                  <option value={0}>Laka</option>
                  <option value={1}>Srednja</option>
                  <option value={2}>Teska</option>
                </select>
              </label>
              <label>
                Tagovi
                <input
                  placeholder="npr. beograd, setnja"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  required
                />
              </label>
            </div>
            <button type="submit" className="btn-primary">Kreiraj draft turu</button>
          </form>

          <div className="surface">
            <h2>Moje ture</h2>
            <ul className="list">
              {mine.map((t) => (
                <li key={t.id} className={selectedTourId === t.id ? 'active-item' : ''}>
                  <div className="item-top">
                    <strong>{t.name}</strong>
                    <span className={`chip status-${t.status}`}>{STATUS[t.status] || t.status}</span>
                  </div>
                  <p className="muted">
                    {DIFF[t.difficulty] || t.difficulty} · {t.keyPoints?.length || 0} tacke · {(t.lengthKm || 0).toFixed(2)} km
                  </p>
                  {(t.keyPoints || []).length > 0 && (
                    <ol className="kp-list">
                      {(t.keyPoints || []).map((point, idx) => (
                        <li key={point.id}>
                          {idx === 0 ? 'Pocetna' : `Tacka ${idx + 1}`}: {point.name} ({point.latitude?.toFixed?.(4)}, {point.longitude?.toFixed?.(4)})
                        </li>
                      ))}
                    </ol>
                  )}
                  <div className="row">
                    {t.status === 0 && (
                      <button type="button" className="btn-secondary" onClick={() => openKeyPointEditor(t)}>
                        {(t.keyPoints?.length || 0) === 0 ? 'Dodaj pocetnu tacku' : 'Dodaj kljucnu tacku'}
                      </button>
                    )}
                    {t.status === 0 && (
                      <button type="button" className="btn-primary" onClick={() => publish(t.id)}>
                        Objavi
                      </button>
                    )}
                  </div>
                </li>
              ))}
              {mine.length === 0 && <li className="muted">Jos nema tura. Kreiraj prvu draft turu.</li>}
            </ul>
          </div>

          {selectedTour && selectedTour.status === 0 && (
            <form onSubmit={addKeyPoint} className="form surface accent-border">
              <h2>{isStartPoint ? 'Pocetna tacka' : 'Nova kljucna tacka'} — {selectedTour.name}</h2>
              <p className="muted">
                Klikni na mapu da izaberes lokaciju, pa sacuvaj. Za objavu treba bar 2 tacke.
              </p>
              <label>
                Naziv tacke
                <input
                  value={kp.name}
                  onChange={(e) => setKp((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </label>
              <label>
                Opis
                <textarea
                  value={kp.description}
                  onChange={(e) => setKp((prev) => ({ ...prev, description: e.target.value }))}
                />
              </label>
              <label>
                Slika URL (opciono)
                <input
                  value={kp.image}
                  onChange={(e) => setKp((prev) => ({ ...prev, image: e.target.value }))}
                />
              </label>
              <div className="grid-2">
                <label>
                  Latitude
                  <input
                    type="number"
                    step="any"
                    value={kp.latitude}
                    onChange={(e) => setKp((prev) => ({ ...prev, latitude: Number(e.target.value) }))}
                    required
                  />
                </label>
                <label>
                  Longitude
                  <input
                    type="number"
                    step="any"
                    value={kp.longitude}
                    onChange={(e) => setKp((prev) => ({ ...prev, longitude: Number(e.target.value) }))}
                    required
                  />
                </label>
              </div>
              <p className="coords">
                Izabrano: {Number(kp.latitude).toFixed(5)}, {Number(kp.longitude).toFixed(5)}
              </p>
              <MapPicker
                mapKey={`tour-${selectedTourId}-${existingPoints.length}`}
                latitude={Number(kp.latitude)}
                longitude={Number(kp.longitude)}
                markers={existingPoints}
                height={420}
                onPick={(lat, lng) => setKp((prev) => ({ ...prev, latitude: lat, longitude: lng }))}
              />
              <button type="submit" className="btn-primary" disabled={savingKp}>
                {savingKp ? 'Cuvam...' : isStartPoint ? 'Sacuvaj pocetnu tacku' : 'Sacuvaj kljucnu tacku'}
              </button>
            </form>
          )}
        </>
      )}

      <div className="surface">
        <h2>Objavljene ture</h2>
        <ul className="list">
          {published.map((t) => (
            <li key={t.id}>
              <div className="item-top">
                <strong>{t.name}</strong>
                <span className="chip">{t.price} RSD</span>
              </div>
              <p>{t.description}</p>
              <p className="muted">
                {(t.lengthKm || 0).toFixed(2)} km
                {t.firstKeyPoint ? ` · Pocetak: ${t.firstKeyPoint.name}` : ''}
              </p>
              {user?.userRole === 2 && (
                <button type="button" className="btn-primary" onClick={() => addToCart(t)}>
                  Dodaj u korpu
                </button>
              )}
            </li>
          ))}
          {published.length === 0 && <li className="muted">Nema objavljenih tura.</li>}
        </ul>
      </div>
    </section>
  );
}
