// API för "Dom vi brukar laga" (orgutveckling.se/recept)
// POST /register {name,pin} -> {token,name}
// POST /login    {name,pin} -> {token,name}
// GET  /state  (Bearer token) -> {state}
// PUT  /state  (Bearer token) <- hela state-blobben {recipes,selections,extras,checked}
// GET  /allas-recept (Bearer token) -> [{...recipe, owner}, ...] från alla konton
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
const json = (d, s = 200) => Response.json(d, { status: s, headers: cors });

async function sha256hex(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}

async function userFromToken(req, env) {
  const t = (req.headers.get('Authorization') || '').replace(/^Bearer /, '');
  if (!t) return null;
  return env.DB.prepare('SELECT * FROM users WHERE token = ?').bind(t).first();
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    const path = new URL(req.url).pathname;
    try {
      if (req.method === 'POST' && (path === '/register' || path === '/login')) {
        const b = await req.json().catch(() => ({}));
        const name = String(b.name || '').trim().toLowerCase();
        const pin = String(b.pin || '');
        if (!/^[a-zåäö0-9_-]{2,20}$/.test(name) || pin.length < 4 || pin.length > 64) {
          return json({ error: 'Namn 2–20 tecken (bokstäver/siffror), PIN minst 4 tecken.' }, 400);
        }
        if (path === '/register') {
          const salt = crypto.randomUUID();
          const token = crypto.randomUUID();
          const hash = await sha256hex(salt + pin);
          try {
            await env.DB.prepare('INSERT INTO users (name, pin_hash, token, state) VALUES (?,?,?,?)')
              .bind(name, salt + ':' + hash, token, '').run();
          } catch (e) {
            return json({ error: 'Namnet är upptaget.' }, 409);
          }
          return json({ token, name });
        }
        const u = await env.DB.prepare('SELECT * FROM users WHERE name = ?').bind(name).first();
        if (!u) return json({ error: 'Fel namn eller PIN.' }, 401);
        const [salt, hash] = u.pin_hash.split(':');
        if (await sha256hex(salt + pin) !== hash) return json({ error: 'Fel namn eller PIN.' }, 401);
        return json({ token: u.token, name });
      }

      if (path === '/allas-recept' && req.method === 'GET') {
        const u = await userFromToken(req, env);
        if (!u) return json({ error: 'Inte inloggad.' }, 401);
        const { results } = await env.DB.prepare('SELECT name, state FROM users').all();
        const out = [];
        for (const row of results) {
          if (!row.state) continue;
          let s;
          try { s = JSON.parse(row.state); } catch (e) { continue; }
          if (!s || !Array.isArray(s.recipes)) continue;
          for (const r of s.recipes) out.push({ ...r, owner: row.name });
        }
        return json(out);
      }

      if (path === '/state') {
        const u = await userFromToken(req, env);
        if (!u) return json({ error: 'Inte inloggad.' }, 401);
        if (req.method === 'GET') return json({ state: u.state ? JSON.parse(u.state) : null });
        if (req.method === 'PUT') {
          const body = await req.text();
          if (body.length > 262144) return json({ error: 'För mycket data (max 256 kB).' }, 413);
          let s;
          try { s = JSON.parse(body); } catch (e) { return json({ error: 'Ogiltig data.' }, 400); }
          if (!s || typeof s !== 'object' || !Array.isArray(s.recipes)) return json({ error: 'Ogiltig data.' }, 400);
          await env.DB.prepare('UPDATE users SET state = ? WHERE id = ?').bind(JSON.stringify(s), u.id).run();
          return json({ ok: true });
        }
      }
    } catch (e) {
      return json({ error: 'Serverfel.' }, 500);
    }
    return json({ error: 'Hittades inte.' }, 404);
  },
};
