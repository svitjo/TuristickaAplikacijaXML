import { useEffect, useState } from 'react';
import api from '../api';

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    const [c, p] = await Promise.all([
      api.get('/api/purchase/cart'),
      api.get('/api/purchase/purchases'),
    ]);
    setCart(c.data);
    setPurchases(p.data);
  };

  useEffect(() => { load().catch(console.error); }, []);

  const remove = async (tourId) => {
    const { data } = await api.delete(`/api/purchase/cart/items/${tourId}`);
    setCart(data);
  };

  const checkout = async () => {
    const { data } = await api.post('/api/purchase/checkout');
    setMessage(`Checkout uspesan. Tokena: ${data.length}`);
    await load();
  };

  return (
    <section className="panel">
      <h1>Korpa</h1>
      {message && <p className="ok">{message}</p>}
      {cart && (
        <>
          <ul className="list">
            {cart.items.map((i) => (
              <li key={i.tourId}>
                {i.tourName} — {i.price} RSD
                <button type="button" onClick={() => remove(i.tourId)}>Ukloni</button>
              </li>
            ))}
          </ul>
          <p><strong>Ukupno:</strong> {cart.totalPrice} RSD</p>
          <button type="button" onClick={checkout} disabled={!cart.items.length}>Checkout</button>
        </>
      )}

      <h2>Kupljene ture</h2>
      <ul className="list">
        {purchases.map((p) => (
          <li key={p.id}>{p.tourName} (tour #{p.tourId}) — token: {p.token.slice(0, 8)}...</li>
        ))}
      </ul>
    </section>
  );
}
