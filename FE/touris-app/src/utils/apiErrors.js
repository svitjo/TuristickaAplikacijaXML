function looksLikeHtml(value) {
  if (typeof value !== 'string') return false;
  const v = value.trim().toLowerCase();
  return v.startsWith('<!doctype') || v.startsWith('<html') || v.includes('<center><h1>');
}

function stripHtml(value) {
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getErrorMessage(err, fallback = 'Doslo je do greske. Pokusajte ponovo.') {
  const data = err?.response?.data;
  const status = err?.response?.status;

  if (!err?.response) {
    if (err?.code === 'ECONNABORTED') {
      return 'Zahtev je istekao. Server se mozda jos pokrece — sacekajte malo i pokusajte ponovo.';
    }
    return 'Nema veze sa serverom. Proverite internet ili sacekajte da se aplikacija pokrene.';
  }

  // nginx / proxy HTML pages (502 Bad Gateway, etc.)
  if (looksLikeHtml(data)) {
    if (status === 502 || status === 503 || status === 504 || /bad gateway|service unavailable/i.test(data)) {
      return 'Server se jos pokrece. Sacekajte 20–40 sekundi pa pokusajte ponovo.';
    }
    return 'Server je privremeno nedostupan. Pokusajte ponovo za trenutak.';
  }

  if (typeof data === 'string' && data.trim()) {
    const text = stripHtml(data);
    if (/bad gateway/i.test(text)) {
      return 'Server se jos pokrece. Sacekajte 20–40 sekundi pa pokusajte ponovo.';
    }
    return text;
  }

  if (data?.message) return data.message;
  if (data?.title && !data?.errors) return data.title;

  if (data?.errors && typeof data.errors === 'object') {
    const messages = [];
    Object.entries(data.errors).forEach(([field, list]) => {
      const items = Array.isArray(list) ? list : [list];
      items.forEach((msg) => {
        messages.push(translateFieldError(field, msg));
      });
    });
    if (messages.length) return messages.join(' ');
  }

  if (status === 401) return 'Pogresno korisnicko ime ili lozinka.';
  if (status === 409) return 'Korisnicko ime ili email su zauzeti.';
  if (status === 400) return 'Proverite unete podatke.';
  if (status === 403) return 'Nemate dozvolu za ovu akciju.';
  if (status === 502 || status === 503 || status === 504) {
    return 'Server se jos pokrece. Sacekajte 20–40 sekundi pa pokusajte ponovo.';
  }
  if (status >= 500) return 'Server trenutno nije dostupan. Pokusajte za minut.';

  return fallback;
}

function translateFieldError(field, msg) {
  const f = String(field || '').toLowerCase();
  const m = String(msg || '');

  if (f.includes('email')) {
    if (/valid|format/i.test(m)) return 'Email nije u ispravnom formatu.';
    return `Email: ${m}`;
  }
  if (f.includes('password')) {
    if (/minimum|min length|at least|6/i.test(m)) return 'Lozinka mora imati najmanje 6 karaktera.';
    return `Lozinka: ${m}`;
  }
  if (f.includes('username')) {
    return 'Korisnicko ime nije validno.';
  }
  if (f.includes('userrole')) {
    return 'Izaberite ulogu Vodic ili Turista.';
  }
  return m;
}

export function validateRegisterForm({ userName, email, password }) {
  const errors = {};
  if (!userName?.trim()) errors.userName = 'Unesite korisnicko ime.';
  if (!email?.trim()) errors.email = 'Unesite email.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Email nije u ispravnom formatu (npr. ime@email.com).';
  }
  if (!password) errors.password = 'Unesite lozinku.';
  else if (password.length < 6) errors.password = 'Lozinka mora imati najmanje 6 karaktera.';
  return errors;
}

export function validateLoginForm({ userName, password }) {
  const errors = {};
  if (!userName?.trim()) errors.userName = 'Unesite korisnicko ime.';
  if (!password) errors.password = 'Unesite lozinku.';
  return errors;
}
