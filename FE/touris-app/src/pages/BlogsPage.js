import { useEffect, useState } from 'react';
import api from '../api';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [following, setFollowing] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [followId, setFollowId] = useState('');
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const [feed, fol, rec] = await Promise.all([
      api.get('/api/blogs'),
      api.get('/api/blogs/following'),
      api.get('/api/blogs/recommendations'),
    ]);
    setBlogs(feed.data);
    setFollowing(fol.data);
    setRecommendations(rec.data);
  };

  useEffect(() => { load().catch(console.error); }, []);

  const createBlog = async (e) => {
    e.preventDefault();
    await api.post('/api/blogs', { title, description, images: [] });
    setTitle('');
    setDescription('');
    await load();
  };

  const follow = async (userId) => {
    await api.post('/api/blogs/follow', { userId: Number(userId) });
    setFollowId('');
    await load();
  };

  const openBlog = async (id) => {
    setError('');
    try {
      const { data } = await api.get(`/api/blogs/${id}`);
      setSelected(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Ne mozete citati ovaj blog (pratite autora).');
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/api/blogs/${selected.blog.id}/comments`, { text: comment });
      setComment('');
      await openBlog(selected.blog.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Komentar nije moguc.');
    }
  };

  return (
    <section className="panel">
      <h1>Blogovi</h1>
      <form onSubmit={createBlog} className="form">
        <h2>Novi blog</h2>
        <input placeholder="Naslov" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Opis" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <button type="submit">Kreiraj</button>
      </form>

      <div className="form">
        <h2>Zapratite korisnika (userId)</h2>
        <input placeholder="User ID" value={followId} onChange={(e) => setFollowId(e.target.value)} />
        <button type="button" onClick={() => follow(followId)}>Follow</button>
        <p>Pratite: {following.join(', ') || 'nikoga'}</p>
        <p>Preporuke: {recommendations.join(', ') || 'nema'}</p>
      </div>

      <h2>Feed (moji + praceni)</h2>
      <ul className="list">
        {blogs.map((b) => (
          <li key={b.id}>
            <button type="button" className="linkish" onClick={() => openBlog(b.id)}>
              {b.title} — {b.authorUserName}
            </button>
          </li>
        ))}
      </ul>

      {error && <p className="error">{error}</p>}
      {selected && (
        <div className="subpanel">
          <h3>{selected.blog.title}</h3>
          <p>{selected.blog.description}</p>
          <h4>Komentari</h4>
          <ul>
            {selected.comments.map((c) => (
              <li key={c.id}>{c.authorUserName}: {c.text}</li>
            ))}
          </ul>
          <form onSubmit={addComment} className="form">
            <input placeholder="Komentar" value={comment} onChange={(e) => setComment(e.target.value)} required />
            <button type="submit">Ostavi komentar</button>
          </form>
        </div>
      )}
    </section>
  );
}
