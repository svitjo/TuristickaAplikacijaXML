import { useEffect, useState } from 'react';
import api from '../api';

export default function ExecutionPage() {
  const [purchases, setPurchases] = useState([]);
  const [active, setActive] = useState(null);
  const [tourId, setTourId] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const [p, a] = await Promise.all([
      api.get('/api/purchase/purchases'),
      api.get('/api/execution/active'),
    ]);
    setPurchases(p.data);
    setActive(a.data);
  };

  useEffect(() => { load().catch(console.error); }, []);

  useEffect(() => {
    if (!active?.id) return undefined;
    const timer = setInterval(async () => {
      try {
        // 1) ask simulator position (already on backend), 2) check nearby keypoints
        await api.get('/api/execution/position');
        const { data } = await api.post(`/api/execution/${active.id}/check`);
        setActive(data.execution);
        if (data.newlyCompleted) {
          setStatus(`Kompletirana tacka #${data.newlyCompleted.keyPointId} (${data.completedCount}/${data.totalKeyPoints})`);
        } else {
          setStatus(`Provera uradjena. Completed: ${data.completedCount}/${data.totalKeyPoints}`);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Check nije uspeo');
      }
    }, 10000);
    return () => clearInterval(timer);
  }, [active?.id]);

  const start = async () => {
    setError('');
    try {
      const { data } = await api.post('/api/execution/start', { tourId: Number(tourId) });
      setActive(data);
      setStatus('Tura pokrenuta.');
    } catch (err) {
      setError(err.response?.data?.message || 'Neuspesno pokretanje');
    }
  };

  const complete = async () => {
    const { data } = await api.post(`/api/execution/${active.id}/complete`);
    setActive(null);
    setStatus(`Completed at ${data.endedAt}`);
  };

  const abandon = async () => {
    const { data } = await api.post(`/api/execution/${active.id}/abandon`);
    setActive(null);
    setStatus(`Abandoned at ${data.endedAt}`);
  };

  return (
    <section className="panel">
      <h1>Izvodjenje ture</h1>
      {error && <p className="error">{error}</p>}
      {status && <p className="ok">{status}</p>}

      {!active && (
        <div className="form">
          <p>Kupljene ture:</p>
          <ul className="list">
            {purchases.map((p) => (
              <li key={p.id}>
                <button type="button" className="linkish" onClick={() => setTourId(String(p.tourId))}>
                  {p.tourName} (#{p.tourId})
                </button>
              </li>
            ))}
          </ul>
          <input placeholder="Tour ID" value={tourId} onChange={(e) => setTourId(e.target.value)} />
          <button type="button" onClick={start}>Pokreni turu</button>
        </div>
      )}

      {active && (
        <div className="subpanel">
          <p>Aktivna sesija #{active.id} za turu #{active.tourId}</p>
          <p>Status: {['Active', 'Completed', 'Abandoned'][active.status]}</p>
          <p>Completed keypoints: {active.completedKeyPoints?.length || 0}</p>
          <p>Last activity: {active.lastActivity}</p>
          <p>Automatska provera na svakih 10s (position simulator → check).</p>
          <div className="row">
            <button type="button" onClick={complete}>Zavrsi</button>
            <button type="button" onClick={abandon}>Napusti</button>
          </div>
        </div>
      )}
    </section>
  );
}
