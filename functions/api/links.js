// ============================================
// API /api/links — simples e à prova de falhas
// ============================================
var SVG_WHATS = '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#25D366"/><path fill="#fff" d="M24 10c-7.7 0-14 6.1-14 13.7 0 3 .9 5.7 2.6 8L11 38l6.5-1.7c2 1 4.2 1.5 6.5 1.5 7.7 0 14-6.1 14-13.7S31.7 10 24 10z"/><path fill="#25D366" d="M19.2 17.4c-.3-.7-.6-.7-.9-.7h-.8c-.3 0-.7.1-1 .5-.4.4-1.4 1.3-1.4 3.2s1.4 3.7 1.6 4c.2.3 2.8 4.4 6.9 6 3.4 1.3 4.1 1 4.8 1 .7-.1 2.3-.9 2.6-1.8.3-.9.3-1.7.2-1.8-.1-.2-.4-.3-.8-.5s-2.3-1.1-2.6-1.2c-.4-.1-.6-.2-.9.2-.3.4-1 1.2-1.2 1.5-.2.3-.4.3-.8.1-.4-.2-1.6-.6-3.1-1.9-1.1-1-1.9-2.2-2.1-2.6-.2-.4 0-.6.2-.8l.6-.7c.2-.2.3-.4.4-.7.1-.3.1-.5 0-.7-.1-.2-.9-2.2-1.7-3.1z"/></svg>';

const LINKS = [
  { id: '1', titulo: 'Privacy 50% OFF', url: 'https://privacy.com.br/checkout/soykarolinareal', icone: 'icone-onlyfans.avif' },
  { id: '2', titulo: 'Grupo VIP', url: 'https://t.me/Soykarolinareal_bot?start=biositesoykarolinareal', icone: 'icone-telegram.avif' },
  { id: '3', titulo: 'Packs e Chamada de Vídeo', url: 'https://serverflow.dad/c/whatsapp-karol', icone: SVG_WHATS },
  { id: '4', titulo: 'OnlyFans', url: 'https://onlyfans.com/karolinaofc/c2', icone: 'icone-twitter.avif' }
];

export async function onRequest(context) {
  const { request } = context;

  // 1) Bloqueia ferramentas de scraping pelo User-Agent
  const ua = request.headers.get('User-Agent') || '';
  if (/curl|wget|python-requests|scrapy|headlesschrome|puppeteer|selenium|phantomjs|bot|crawler|spider/i.test(ua)) {
    return json({ error: 'Acesso negado' }, 403);
  }

  // 2) Exige mesma origem ou header de requisição interna
  const url = new URL(request.url);
  const origin = request.headers.get('Origin') || '';
  const referer = request.headers.get('Referer') || '';
  const isXHR = request.headers.get('X-Requested-With') === 'XMLHttpRequest';
  if (origin !== url.origin && !referer.startsWith(url.origin) && !isXHR) {
    return json({ error: 'Acesso negado' }, 403);
  }

  // 3) Entrega os links (aceita GET e POST — nunca mais 405)
  return json({ links: LINKS, ts: Date.now() }, 200);
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}
