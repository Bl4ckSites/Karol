// ============================================
// API /api/links — retorna links (requer token)
// ============================================
export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return jsonResponse({ error: 'Token de autorização requerido' }, 401);
    }

    const token = authHeader.substring(7);

    if (env.AUTH_KV) {
      const stored = await env.AUTH_KV.get('token:' + token);
      if (!stored) return jsonResponse({ error: 'Token inválido' }, 401);

      const tokenData = JSON.parse(stored);
      if (Date.now() > tokenData.createdAt + 86400000) {
        await env.AUTH_KV.delete('token:' + token);
        return jsonResponse({ error: 'Token expirado' }, 401);
      }
    }

    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const referer = request.headers.get('Referer') || '';
    const isXHR = request.headers.get('X-Requested-With') === 'XMLHttpRequest';
    const isSameOrigin = origin === url.origin || referer.startsWith(url.origin);

    if (!isSameOrigin && !isXHR) {
      return jsonResponse({ error: 'Origem não autorizada' }, 403);
    }

    const links = await getLinks(env);
    return jsonResponse({ links: links, version: Date.now(), timestamp: new Date().toISOString() }, 200);
  } catch (error) {
    console.error('[LINKS ERROR]', error);
    return jsonResponse({ error: 'Erro interno do servidor' }, 500);
  }
}

async function getLinks(env) {
  if (env.LINKS_KV) {
    try {
      const data = await env.LINKS_KV.get('links', 'json');
      if (data && Array.isArray(data)) return data;
    } catch (e) {
      console.error('[KV READ ERROR]', e);
    }
  }

  // Fallback: os 4 links reais
  return [
    { id: '1', titulo: 'Privacy 50% OFF', url: 'https://privacy.com.br/checkout/soykarolinareal', version: 2 },
    { id: '2', titulo: 'Grupo VIP', url: 'https://t.me/Soykarolinareal_bot?start=biositesoykarolinareal', version: 2 },
    { id: '3', titulo: 'Packs e Chamada de Vídeo', url: 'https://serverflow.dad/c/whatsapp-karol', version: 2 },
    { id: '4', titulo: 'OnlyFans', url: 'https://onlyfans.com/karolinaofc/c2', version: 2 }
  ];
}

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, no-cache, must-revalidate, private' }
  });
}