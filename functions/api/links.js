const LINKS = [
  { id: '1', titulo: 'Privacy 50% OFF', url: 'https://privacy.com.br/checkout/soykarolinareal', icone: 'icone-privacy.png' },
  { id: '2', titulo: 'Grupo VIP', url: 'https://t.me/Soykarolinareal_bot?start=biositesoykarolinareal', icone: 'icone-telegram.png' },
  { id: '3', titulo: 'Packs e Chamada de Vídeo', url: 'https://serverflow.dad/c/whatsapp-karol', icone: 'icone-whatsapp.png' },
  { id: '4', titulo: 'OnlyFans', url: 'https://onlyfans.com/karolinaofc/c2', icone: 'icone-onlyfans.png' }
];

export async function onRequestPost(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const origin = request.headers.get('Origin') || '';
  const referer = request.headers.get('Referer') || '';
  const isXHR = request.headers.get('X-Requested-With') === 'XMLHttpRequest';
  if (origin !== url.origin && !referer.startsWith(url.origin) && !isXHR) {
    return json({ error: 'Acesso negado' }, 403);
  }
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'JSON inválido' }, 400); }
  if (!body || !body.turnstile) return json({ error: 'Token ausente' }, 400);
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: body.turnstile, remoteip: ip })
  });
  const v = await check.json();
  if (!v.success) return json({ error: 'Verificação falhou' }, 403);
  return json({ links: LINKS, ts: Date.now() }, 200);
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}
