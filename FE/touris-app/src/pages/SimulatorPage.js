import { useEffect, useState } from 'react';
import api from '../api';
import MapPicker from '../components/MapPicker';

export default function SimulatorPage() {
  const [lat, setLat] = useState(44.7866);
  const [lng, setLng] = useState(20.4489);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/api/execution/position').then(({ data }) => {
      if (data?.latitude) setLat(data.latitude);
      if (data?.longitude) setLng(data.longitude);
    }).catch(() => {});
  }, []);

  const save = async (latitude, longitude) => {
    setLat(latitude);
    setLng(longitude);
    await api.put('/api/execution/position', { latitude, longitude });
    setMessage(`Pozicija sacuvana: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
  };

  return (
    <section className="panel">
      <h1>Position simulator</h1>
      <p>Kliknite na mapu da postavite trenutnu lokaciju turiste.</p>
      {message && <p className="ok">{message}</p>}
      <MapPicker latitude={lat} longitude={lng} onPick={save} height={480} />
    </section>
  );
}
