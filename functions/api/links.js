// ============================================
// API /api/links — simples e à prova de falhas
// ============================================
const LINKS = [
  { id: '1', titulo: 'Privacy 50% OFF', url: 'https://privacy.com.br/checkout/soykarolinareal', icone: 'icone-privacy.png' },
  { id: '2', titulo: 'Grupo VIP', url: 'https://t.me/Soykarolinareal_bot?start=biositesoykarolinareal', icone: 'icone-telegram.png' },
  { id: '3', titulo: 'Packs e Chamada de Vídeo', url: 'https://serverflow.dad/c/whatsapp-karol', icone: 'icone-whatsapp.png' },
  { id: '4', titulo: 'OnlyFans', url: 'https://onlyfans.com/karolinaofc/c2', icone: 'icone-onlyfans.png' }
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
